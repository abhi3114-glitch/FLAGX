import express from 'express';
import {
  getFlagAnalytics,
  getSystemMetrics
} from '../controllers/analytics.controller.js';

const router = express.Router();

router.get('/flags/:flagId', getFlagAnalytics);
router.get('/metrics', getSystemMetrics);

export default router;