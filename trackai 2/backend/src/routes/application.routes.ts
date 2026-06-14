import { Router } from 'express';
import { ApplicationController } from '../controllers/application.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const ctrl = new ApplicationController();

router.use(authenticate);

router.get('/', ctrl.getAll.bind(ctrl));
router.get('/:id', ctrl.getOne.bind(ctrl));
router.post('/', ctrl.create.bind(ctrl));
router.put('/:id', ctrl.update.bind(ctrl));
router.patch('/:id', ctrl.update.bind(ctrl));
router.delete('/bulk', ctrl.bulkDelete.bind(ctrl));
router.delete('/:id', ctrl.delete.bind(ctrl));

export default router;
