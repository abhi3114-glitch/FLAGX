import express from 'express';
import {
  getAllFlags,
  getFlagById,
  createFlag,
  updateFlag,
  deleteFlag,
  toggleFlag,
  killSwitch
} from '../controllers/flag.controller.js';
import { validateFlag } from '../middleware/validation.middleware.js';

const router = express.Router();

router.get('/', getAllFlags);
router.get('/:id', getFlagById);
router.post('/', validateFlag, createFlag);
router.put('/:id', validateFlag, updateFlag);
router.delete('/:id', deleteFlag);
router.patch('/:id/toggle', toggleFlag);
router.post('/:id/kill-switch', killSwitch);

export default router;