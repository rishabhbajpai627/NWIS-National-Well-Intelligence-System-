import { Router } from 'express';
import { getOperationsList, getOperationDetails, getOperationContext } from '../controllers/operations.controller';

const router = Router();

router.get('/', getOperationsList);
router.get('/:id', getOperationDetails);
router.get('/:id/context', getOperationContext);

export default router;
