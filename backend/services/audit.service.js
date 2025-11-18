import pool from '../config/database.js';

export async function logAudit(flagId, action, userId, changes, metadata = {}) {
  try {
    await pool.query(
      'INSERT INTO audit_logs (flag_id, action, user_id, changes, metadata) VALUES ($1, $2, $3, $4, $5)',
      [flagId, action, userId, JSON.stringify(changes), JSON.stringify(metadata)]
    );
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}