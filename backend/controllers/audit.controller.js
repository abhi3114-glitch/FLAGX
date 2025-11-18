import pool from '../config/database.js';

export async function getAuditLogs(req, res, next) {
  try {
    const { limit = 100, offset = 0, action, userId } = req.query;

    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (action) {
      query += ` AND action = $${paramCount}`;
      params.push(action);
      paramCount++;
    }

    if (userId) {
      query += ` AND user_id = $${paramCount}`;
      params.push(userId);
      paramCount++;
    }

    query += ` ORDER BY timestamp DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

export async function getAuditLogsByFlag(req, res, next) {
  try {
    const { flagId } = req.params;
    const { limit = 50 } = req.query;

    const result = await pool.query(
      'SELECT * FROM audit_logs WHERE flag_id = $1 ORDER BY timestamp DESC LIMIT $2',
      [flagId, limit]
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}