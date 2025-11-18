import express from 'express';
import {
  getAuditLogs,
  getAuditLogsByFlag
} from '../controllers/audit.controller.js';

const router = express.Router();

router.get('/', getAuditLogs);
router.get('/flag/:flagId', getAuditLogsByFlag);

export default router;