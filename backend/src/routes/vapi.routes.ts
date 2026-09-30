import { Router } from 'express';
import { getVedasPointData, getVedasPolygonData } from '../controllers/vapi.controller';

const router = Router();

router.get('/point', getVedasPointData);
router.post('/polygon', getVedasPolygonData);

export default router;
