import pool from '../config/database.js';
import { evaluateRules } from '../services/rule-engine.service.js';
import { getRedisClient } from '../config/redis.js';

export async function evaluateFlag(req, res, next) {
  try {
    const { flagId, userId, context } = req.body;

    if (!flagId) {
      return res.status(400).json({ error: 'flagId is required' });
    }

    const redis = getRedisClient();
    const cacheKey = `flag:${flagId}`;

    // Get flag from cache or database
    let flag;
    const cached = await redis.get(cacheKey);
    if (cached) {
      flag = JSON.parse(cached);
    } else {
      const result = await pool.query('SELECT * FROM feature_flags WHERE id = $1', [flagId]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Flag not found' });
      }
      flag = result.rows[0];
      await redis.setEx(cacheKey, 300, JSON.stringify(flag));
    }

    // If flag is disabled, return false immediately
    if (!flag.enabled) {
      await logEvaluation(flagId, userId, context, false);
      return res.json({ enabled: false, reason: 'Flag is disabled' });
    }

    // Evaluate rules
    const result = await evaluateRules(flag.rules, context);

    // Log evaluation
    await logEvaluation(flagId, userId, context, result.enabled);

    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function bulkEvaluate(req, res, next) {
  try {
    const { flagIds, userId, context } = req.body;

    if (!Array.isArray(flagIds) || flagIds.length === 0) {
      return res.status(400).json({ error: 'flagIds array is required' });
    }

    const results = {};

    for (const flagId of flagIds) {
      try {
        const redis = getRedisClient();
        const cacheKey = `flag:${flagId}`;

        let flag;
        const cached = await redis.get(cacheKey);
        if (cached) {
          flag = JSON.parse(cached);
        } else {
          const result = await pool.query('SELECT * FROM feature_flags WHERE id = $1', [flagId]);
          if (result.rows.length > 0) {
            flag = result.rows[0];
            await redis.setEx(cacheKey, 300, JSON.stringify(flag));
          }
        }

        if (!flag) {
          results[flagId] = { enabled: false, reason: 'Flag not found' };
          continue;
        }

        if (!flag.enabled) {
          results[flagId] = { enabled: false, reason: 'Flag is disabled' };
          await logEvaluation(flagId, userId, context, false);
          continue;
        }

        const evaluation = await evaluateRules(flag.rules, context);
        results[flagId] = evaluation;
        await logEvaluation(flagId, userId, context, evaluation.enabled);
      } catch (error) {
        results[flagId] = { enabled: false, reason: 'Evaluation error', error: error.message };
      }
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
}

async function logEvaluation(flagId, userId, context, result) {
  try {
    await pool.query(
      'INSERT INTO evaluations (flag_id, user_id, context, result) VALUES ($1, $2, $3, $4)',
      [flagId, userId, JSON.stringify(context), result]
    );
  } catch (error) {
    console.error('Failed to log evaluation:', error);
  }
}