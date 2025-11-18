import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { getRedisClient, getRedisPubClient } from '../config/redis.js';
import { logAudit } from '../services/audit.service.js';
import { broadcastFlagUpdate } from '../services/websocket.service.js';

const CACHE_TTL = 300; // 5 minutes

export async function getAllFlags(req, res, next) {
  try {
    const { environment = 'development' } = req.query;
    const cacheKey = `flags:${environment}`;
    const redis = getRedisClient();

    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await pool.query(
      'SELECT * FROM feature_flags WHERE environment = $1 ORDER BY created_at DESC',
      [environment]
    );

    // Cache the result
    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(result.rows));

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

export async function getFlagById(req, res, next) {
  try {
    const { id } = req.params;
    const cacheKey = `flag:${id}`;
    const redis = getRedisClient();

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await pool.query(
      'SELECT * FROM feature_flags WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(result.rows[0]));
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function createFlag(req, res, next) {
  try {
    const { name, description, enabled, environment, rules } = req.body;
    const id = uuidv4();
    const userId = req.user?.id || 'system';

    const result = await pool.query(
      `INSERT INTO feature_flags (id, name, description, enabled, environment, rules, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id, name, description, enabled || false, environment || 'development', JSON.stringify(rules || []), userId, userId]
    );

    const flag = result.rows[0];

    // Invalidate cache
    const redis = getRedisClient();
    await redis.del(`flags:${flag.environment}`);

    // Log audit
    await logAudit(flag.id, 'CREATE', userId, { flag });

    // Broadcast update
    broadcastFlagUpdate('create', flag);

    res.status(201).json(flag);
  } catch (error) {
    next(error);
  }
}

export async function updateFlag(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, enabled, rules } = req.body;
    const userId = req.user?.id || 'system';

    // Get old flag for audit
    const oldFlag = await pool.query('SELECT * FROM feature_flags WHERE id = $1', [id]);
    if (oldFlag.rows.length === 0) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    const result = await pool.query(
      `UPDATE feature_flags 
       SET name = $1, description = $2, enabled = $3, rules = $4, updated_by = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [name, description, enabled, JSON.stringify(rules || []), userId, id]
    );

    const flag = result.rows[0];

    // Invalidate cache
    const redis = getRedisClient();
    await redis.del(`flag:${id}`);
    await redis.del(`flags:${flag.environment}`);

    // Log audit
    await logAudit(flag.id, 'UPDATE', userId, {
      old: oldFlag.rows[0],
      new: flag
    });

    // Broadcast update
    broadcastFlagUpdate('update', flag);

    res.json(flag);
  } catch (error) {
    next(error);
  }
}

export async function deleteFlag(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'system';

    const result = await pool.query('DELETE FROM feature_flags WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    const flag = result.rows[0];

    // Invalidate cache
    const redis = getRedisClient();
    await redis.del(`flag:${id}`);
    await redis.del(`flags:${flag.environment}`);

    // Log audit
    await logAudit(flag.id, 'DELETE', userId, { flag });

    // Broadcast update
    broadcastFlagUpdate('delete', flag);

    res.json({ message: 'Flag deleted successfully' });
  } catch (error) {
    next(error);
  }
}

export async function toggleFlag(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'system';

    const result = await pool.query(
      `UPDATE feature_flags 
       SET enabled = NOT enabled, updated_by = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    const flag = result.rows[0];

    // Invalidate cache
    const redis = getRedisClient();
    await redis.del(`flag:${id}`);
    await redis.del(`flags:${flag.environment}`);

    // Publish to Redis for real-time updates
    const pubClient = getRedisPubClient();
    await pubClient.publish('flag:toggle', JSON.stringify(flag));

    // Log audit
    await logAudit(flag.id, 'TOGGLE', userId, { enabled: flag.enabled });

    // Broadcast update
    broadcastFlagUpdate('toggle', flag);

    res.json(flag);
  } catch (error) {
    next(error);
  }
}

export async function killSwitch(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id || 'system';

    const result = await pool.query(
      `UPDATE feature_flags 
       SET enabled = false, updated_by = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flag not found' });
    }

    const flag = result.rows[0];

    // Invalidate cache immediately
    const redis = getRedisClient();
    await redis.del(`flag:${id}`);
    await redis.del(`flags:${flag.environment}`);

    // Publish emergency kill switch
    const pubClient = getRedisPubClient();
    await pubClient.publish('flag:killswitch', JSON.stringify({ flag, reason }));

    // Log audit with high priority
    await logAudit(flag.id, 'KILL_SWITCH', userId, { reason, timestamp: new Date() });

    // Broadcast emergency update
    broadcastFlagUpdate('killswitch', { ...flag, reason });

    res.json({ message: 'Kill switch activated', flag });
  } catch (error) {
    next(error);
  }
}