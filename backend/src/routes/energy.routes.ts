import { Router } from 'express';
import { getNearbyEnergyAssets } from '../controllers/energy.controller';

const router = Router();

router.get('/nearby', getNearbyEnergyAssets);

export default router;
