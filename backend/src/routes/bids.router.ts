

import { Router } from 'express';
import { createBid } from '../controllers/bid.controller';

const router = Router();

// Ruta para crear una nueva puja. Se asume que el ID de usuario viene del cuerpo o un middleware
router.post('/', createBid);

// ... (Aquí puede añadir rutas para listar pujas por producto o por usuario)

export default router;