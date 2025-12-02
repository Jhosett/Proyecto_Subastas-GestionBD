import { Router } from 'express';
import { ForumController } from '../controllers/forum.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Rutas para posts
router.post('/posts', authenticateToken, ForumController.createPost);
router.get('/posts', ForumController.getPosts);
router.post('/posts/:postId/reactions', authenticateToken, ForumController.addReactionToPost);

// Rutas para comentarios
router.post('/posts/:postId/comments', authenticateToken, ForumController.createComment);
router.get('/posts/:postId/comments', ForumController.getComments);
router.post('/comments/:commentId/reactions', authenticateToken, ForumController.addReactionToComment);

// Rutas para notificaciones
router.get('/notifications', authenticateToken, ForumController.getNotifications);
router.put('/notifications/:notificationId/read', authenticateToken, ForumController.markAsRead);

export default router;