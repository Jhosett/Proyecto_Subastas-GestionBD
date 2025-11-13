import { Router } from 'express';
import { 
    registerEntry, 
    registerExit, 
    registerCategoryClick,
    registerAuctionAttempt,
    getAnalyticsReport,
    getUserAnalytics
} from '../controllers/analytics.controller';

const router = Router();

// POST /api/analytics/entry: Registra la entrada del usuario a la página. Devuelve el sessionId.
router.post('/entry', registerEntry);

// POST /api/analytics/exit: Registra el egreso y calcula el tiempo total en la página.
router.post('/exit', registerExit);

// POST /api/analytics/click: Registra las categorías que el usuario clickea.
router.post('/click', registerCategoryClick);

// POST /api/analytics/attempt: Registra si el usuario intentó subastar un producto.
router.post('/attempt', registerAuctionAttempt);

// GET /api/analytics/report: Obtiene un reporte general de analíticas (Filtrable por userId, startDate, endDate)
router.get('/report', getAnalyticsReport);

// GET /api/analytics/user/:userId: Obtiene estadísticas específicas de un usuario
router.get('/user/:userId', getUserAnalytics);

export default router;