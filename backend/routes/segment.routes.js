import express from 'express';
import {
  getAllSegments,
  getSegmentById,
  createSegment,
  updateSegment,
  deleteSegment
} from '../controllers/segment.controller.js';

const router = express.Router();

router.get('/', getAllSegments);
router.get('/:id', getSegmentById);
router.post('/', createSegment);
router.put('/:id', updateSegment);
router.delete('/:id', deleteSegment);

export default router;