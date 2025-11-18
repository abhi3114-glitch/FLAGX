import { v4 as uuidv4 } from 'uuid';
import pool from '../config/database.js';
import { getRedisClient } from '../config/redis.js';

const CACHE_TTL = 300;

export async function getAllSegments(req, res, next) {
  try {
    const cacheKey = 'segments:all';
    const redis = getRedisClient();

    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const result = await pool.query('SELECT * FROM segments ORDER BY created_at DESC');
    await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(result.rows));

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

export async function getSegmentById(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM segments WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function createSegment(req, res, next) {
  try {
    const { name, description, conditions } = req.body;
    const id = uuidv4();

    const result = await pool.query(
      'INSERT INTO segments (id, name, description, conditions) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, name, description, JSON.stringify(conditions)]
    );

    const redis = getRedisClient();
    await redis.del('segments:all');

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function updateSegment(req, res, next) {
  try {
    const { id } = req.params;
    const { name, description, conditions } = req.body;

    const result = await pool.query(
      `UPDATE segments 
       SET name = $1, description = $2, conditions = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [name, description, JSON.stringify(conditions), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    const redis = getRedisClient();
    await redis.del('segments:all');

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

export async function deleteSegment(req, res, next) {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM segments WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    const redis = getRedisClient();
    await redis.del('segments:all');

    res.json({ message: 'Segment deleted successfully' });
  } catch (error) {
    next(error);
  }
}