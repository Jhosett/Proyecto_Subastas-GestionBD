import { Request, Response } from 'express';
import { Analytics } from '../models/analytics.model';
import { User } from '../models/user.model';

// Asumimos que esta ruta está montada bajo '/api/analytics'

/**
 * Función para iniciar la sesión de analíticas (al cargar el Main Layout).
 * Registra el ingreso del usuario y su ubicación.
 */
export const registerEntry = async (req: Request, res: Response): Promise<void> => {
    // Nota: El ID del usuario debería ser validado y obtenido del token en producción.
    const { userId } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado' });
            return;
        }

        // Crear una nueva entrada de analíticas
        const newSession = await Analytics.create({
            userId,
            fecha: new Date(),
            ubicacion: {
                pais: user.pais,
                departamento: user.departamento,
                ciudad: user.ciudad,
            },
            tiempoTotalEnPagina: 0, 
            categoriasClickeadas: [],
            intentoSubastar: false, 
        });

    // Retornar el ID de la sesión para que el frontend pueda seguir la trazabilidad
    // `newSession._id` puede ser `unknown` según la definición de tipos de mongoose,
    // usar `String(...)` evita el error de compilación TS18046 sin forzar un cast.
    res.status(201).json({ sessionId: String(newSession._id) });

    } catch (err) {
        console.error('Error al registrar la entrada de analíticas:', err);
        res.status(500).json({ error: 'Error interno al iniciar sesión de analíticas' });
    }
};

/**
 * Función para registrar clics en categorías.
 */
export const registerCategoryClick = async (req: Request, res: Response): Promise<void> => {
    const { sessionId, categoryName } = req.body;

    try {
        // Se utiliza findByIdAndUpdate para una operación atómica y eficiente
        const session = await Analytics.findByIdAndUpdate(
            sessionId,
            { $addToSet: { categoriasClickeadas: categoryName } }, // $addToSet previene duplicados
            { new: true }
        );

        if (!session) {
            res.status(404).json({ error: 'Sesión de analíticas no encontrada' });
            return;
        }
        
        res.status(200).json({ message: 'Click registrado correctamente' });

    } catch (err) {
        console.error('Error al registrar click en categoría:', err);
        res.status(500).json({ error: 'Error interno al registrar click' });
    }
};

/**
 * FUNCIÓN FINAL REQUERIDA: Registrar intento de subastar.
 * Marca la bandera `intentoSubastar` como verdadera.
 */
export const registerAuctionAttempt = async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.body; 

    try {
        // Se utiliza findByIdAndUpdate para una operación atómica y eficiente
        const session = await Analytics.findByIdAndUpdate(
            sessionId,
            { intentoSubastar: true }, // Establece la bandera a true
            { new: true }
        );

        if (!session) {
            res.status(404).json({ error: 'Sesión de analíticas no encontrada' });
            return;
        }
        
        res.status(200).json({ message: 'Intento de subasta registrado' });

    } catch (err) {
        console.error('Error al registrar intento de subasta:', err);
        res.status(500).json({ error: 'Error interno al registrar intento de subasta' });
    }
};


/**
 * Función para finalizar la sesión de analíticas (al salir del Main Layout).
 * Calcula el tiempo total de permanencia.
 */
export const registerExit = async (req: Request, res: Response): Promise<void> => {
    const { sessionId } = req.body;

    try {
        const session = await Analytics.findById(sessionId);
        if (!session) {
            // No devolver 404 para no bloquear el cierre de sesión del usuario
            console.warn(`[Analytics] Advertencia: Sesión ${sessionId} no encontrada al cerrar.`);
            res.status(200).json({ message: 'Sesión ya cerrada o ID inválido.', timeSpent: 0 });
            return;
        }

        const now = new Date();
        const entryTime = session.fecha.getTime();
        const timeSpent = Math.floor((now.getTime() - entryTime) / 1000); // Tiempo en segundos

        // Actualizar el tiempo total de permanencia
        await Analytics.findByIdAndUpdate(
            sessionId,
            { tiempoTotalEnPagina: timeSpent },
            { new: true }
        );
        
        res.status(200).json({ message: 'Salida registrada correctamente', timeSpent });

    } catch (err) {
        console.error('Error al registrar la salida de analíticas:', err);
        res.status(500).json({ error: 'Error interno al finalizar sesión de analíticas' });
    }
};

/**
 * Función para obtener reportes de analíticas (para administradores).
 * Devuelve estadísticas globales y por usuario.
 */
export const getAnalyticsReport = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId, startDate, endDate } = req.query;

        // Construir filtro dinámico
        const filter: any = {};
        if (userId) {
            filter.userId = userId;
        }
        if (startDate || endDate) {
            filter.fecha = {};
            if (startDate) {
                filter.fecha.$gte = new Date(startDate as string);
            }
            if (endDate) {
                filter.fecha.$lte = new Date(endDate as string);
            }
        }

        // Obtener todas las sesiones
        const sessions = await Analytics.find(filter).lean();

        if (sessions.length === 0) {
            res.status(200).json({
                message: 'No se encontraron sesiones de analíticas',
                totalSessions: 0,
                statistics: {
                    totalUsers: 0,
                    avgTimePerPage: 0,
                    usersAttemptedAuction: 0,
                    topCategories: [],
                    locationDistribution: [],
                }
            });
            return;
        }

        // Calcular estadísticas
        const uniqueUsers = new Set(sessions.map(s => s.userId)).size;
        const avgTimePerPage = Math.round(
            sessions.reduce((acc, s) => acc + s.tiempoTotalEnPagina, 0) / sessions.length
        );
        const usersAttemptedAuction = sessions.filter(s => s.intentoSubastar).length;

        // Contar clics por categoría
        const categoryClicks: { [key: string]: number } = {};
        sessions.forEach(session => {
            session.categoriasClickeadas.forEach(category => {
                categoryClicks[category] = (categoryClicks[category] || 0) + 1;
            });
        });

        const topCategories = Object.entries(categoryClicks)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, count]) => ({ name, count }));

        // Distribución por ubicación
        const locationDistribution = sessions.reduce((acc, session) => {
            const location = `${session.ubicacion.pais} - ${session.ubicacion.departamento} - ${session.ubicacion.ciudad}`;
            const existing = acc.find(l => l.location === location);
            if (existing) {
                existing.count++;
            } else {
                acc.push({ location, count: 1 });
            }
            return acc;
        }, [] as Array<{ location: string; count: number }>);

        res.status(200).json({
            message: 'Reporte de analíticas generado correctamente',
            totalSessions: sessions.length,
            statistics: {
                totalUsers: uniqueUsers,
                avgTimePerPage,
                usersAttemptedAuction,
                percentageAttemptedAuction: Math.round((usersAttemptedAuction / sessions.length) * 100),
                topCategories,
                locationDistribution: locationDistribution.sort((a, b) => b.count - a.count).slice(0, 10),
            },
            sessionDetails: sessions.map(s => ({
                sessionId: s._id,
                userId: s.userId,
                date: s.fecha,
                timeOnPage: s.tiempoTotalEnPagina,
                categoriesClicked: s.categoriasClickeadas,
                attemptedAuction: s.intentoSubastar,
                location: `${s.ubicacion.pais}, ${s.ubicacion.departamento}, ${s.ubicacion.ciudad}`,
            })),
        });

    } catch (err) {
        console.error('Error al obtener reporte de analíticas:', err);
        res.status(500).json({ error: 'Error interno al generar reporte' });
    }
};

/**
 * Función para obtener estadísticas de un usuario específico.
 */
export const getUserAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        const sessions = await Analytics.find({ userId }).lean();

        if (sessions.length === 0) {
            res.status(404).json({ error: 'No se encontraron sesiones para este usuario' });
            return;
        }

        const totalTime = sessions.reduce((acc, s) => acc + s.tiempoTotalEnPagina, 0);
        const avgTime = Math.round(totalTime / sessions.length);
        const allCategories = [...new Set(sessions.flatMap(s => s.categoriasClickeadas))];
        const attemptedAuction = sessions.some(s => s.intentoSubastar);

        res.status(200).json({
            userId,
            totalSessions: sessions.length,
            totalTimeSpent: totalTime,
            averageTimePerSession: avgTime,
            categoriesExplored: allCategories,
            attemptedAuction,
            sessions: sessions.map(s => ({
                sessionId: s._id,
                date: s.fecha,
                timeOnPage: s.tiempoTotalEnPagina,
                categoriesClicked: s.categoriasClickeadas,
                attemptedAuction: s.intentoSubastar,
                location: `${s.ubicacion.pais}, ${s.ubicacion.departamento}, ${s.ubicacion.ciudad}`,
            })),
        });

    } catch (err) {
        console.error('Error al obtener analíticas del usuario:', err);
        res.status(500).json({ error: 'Error interno al recuperar analíticas del usuario' });
    }
};