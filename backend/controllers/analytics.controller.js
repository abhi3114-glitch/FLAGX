import pool from '../config/database.js';

export async function getFlagAnalytics(req, res, next) {
  try {
    const { flagId } = req.params;
    const { timeRange = '24h' } = req.query;

    const timeRangeMap = {
      '1h': '1 hour',
      '24h': '24 hours',
      '7d': '7 days',
      '30d': '30 days'
    };

    const interval = timeRangeMap[timeRange] || '24 hours';

    // Get evaluation stats
    const evaluations = await pool.query(
      `SELECT 
        COUNT(*) as total_evaluations,
        COUNT(*) FILTER (WHERE result = true) as enabled_count,
        COUNT(*) FILTER (WHERE result = false) as disabled_count,
        COUNT(DISTINCT user_id) as unique_users
       FROM evaluations 
       WHERE flag_id = $1 AND timestamp > NOW() - INTERVAL '${interval}'`,
      [flagId]
    );

    // Get evaluation timeline
    const timeline = await pool.query(
      `SELECT 
        DATE_TRUNC('hour', timestamp) as hour,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE result = true) as enabled
       FROM evaluations 
       WHERE flag_id = $1 AND timestamp > NOW() - INTERVAL '${interval}'
       GROUP BY hour
       ORDER BY hour`,
      [flagId]
    );

    res.json({
      stats: evaluations.rows[0],
      timeline: timeline.rows
    });
  } catch (error) {
    next(error);
  }
}

export async function getSystemMetrics(req, res, next) {
  try {
    const flagsCount = await pool.query('SELECT COUNT(*) as count FROM feature_flags');
    const enabledFlags = await pool.query('SELECT COUNT(*) as count FROM feature_flags WHERE enabled = true');
    const segmentsCount = await pool.query('SELECT COUNT(*) as count FROM segments');
    const recentEvaluations = await pool.query(
      "SELECT COUNT(*) as count FROM evaluations WHERE timestamp > NOW() - INTERVAL '1 hour'"
    );

    res.json({
      totalFlags: parseInt(flagsCount.rows[0].count),
      enabledFlags: parseInt(enabledFlags.rows[0].count),
      totalSegments: parseInt(segmentsCount.rows[0].count),
      evaluationsLastHour: parseInt(recentEvaluations.rows[0].count)
    });
  } catch (error) {
    next(error);
  }
}