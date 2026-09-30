import { Router } from 'express';
import { getNearbyWells, getActiveWell, getHistoricalEvents } from '../controllers/wells.controller';

const router = Router();

router.get('/active', getActiveWell);
router.get('/nearby', getNearbyWells);
router.get('/:well_id/events', getHistoricalEvents);

export default router;
