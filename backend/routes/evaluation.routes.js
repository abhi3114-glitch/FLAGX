import express from 'express';
import { evaluateFlag, bulkEvaluate } from '../controllers/evaluation.controller.js';

const router = express.Router();

router.post('/', evaluateFlag);
router.post('/bulk', bulkEvaluate);

export default router;