import { Router } from 'express';
import { PQRSController } from '../controllers/pqrs.controller';

const router = Router();
const pqrsController = new PQRSController();

// Create new PQRS
router.post('/', pqrsController.createPQRS.bind(pqrsController));

// Get all PQRS (admin only)
router.get('/all', pqrsController.getAllPQRS.bind(pqrsController));

// Get user's PQRS
router.get('/user', pqrsController.getUserPQRS.bind(pqrsController));

// Get user's notifications (PQRS addressed to them)
router.get('/notifications', pqrsController.getUserNotifications.bind(pqrsController));

// Get PQRS by ID
router.get('/:id', pqrsController.getPQRSById.bind(pqrsController));

// Update PQRS status (admin only)
router.put('/:id/status', pqrsController.updatePQRSStatus.bind(pqrsController));

export default router;