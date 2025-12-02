import { Request, Response } from 'express';
import { ForumPost, ForumComment } from '../models/forum.model';
import { ForumNotification } from '../models/forum-notification.model';
import mongoose from 'mongoose';

export class ForumController {
  // Crear nuevo post
  static async createPost(req: Request, res: Response) {
    try {
      const { titulo, contenido } = req.body;
      const autor = req.user?.id;

      const newPost = new ForumPost({
        autor,
        titulo,
        contenido
      });

      await newPost.save();
      await newPost.populate('autor', 'nombre email esVendedor isAdmin');

      res.status(201).json({
        success: true,
        data: newPost
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear el post',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }

  // Obtener todos los posts
  static async getPosts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const posts = await ForumPost.find()
        .populate('autor', 'nombre email esVendedor isAdmin')
        .sort({ fechaCreacion: -1 })
        .skip(skip)
        .limit(limit);

      const total = await ForumPost.countDocuments();

      res.json({
        success: true,
        data: posts,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener los posts'
      });
    }
  }

  // Agregar reacción a post
  static async addReactionToPost(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { tipo } = req.body; // bien, contento, enojado, triste
      const userId = req.user?.id;

      const post = await ForumPost.findById(postId);
      if (!post) {
        return res.status(404).json({
          success: false,
          message: 'Post no encontrado'
        });
      }

      // Remover reacción anterior del usuario
      Object.keys(post.reacciones).forEach(key => {
        const reactionArray = post.reacciones[key as keyof typeof post.reacciones];
        const index = reactionArray.indexOf(new mongoose.Types.ObjectId(userId));
        if (index > -1) {
          reactionArray.splice(index, 1);
        }
      });

      // Agregar nueva reacción
      if (tipo && post.reacciones[tipo as keyof typeof post.reacciones]) {
        post.reacciones[tipo as keyof typeof post.reacciones].push(new mongoose.Types.ObjectId(userId));
        
        // Crear notificación si no es el autor del post
        if (post.autor.toString() !== userId) {
          const reactionEmojis = { bien: '👍', contento: '😊', enojado: '😠', triste: '😢' };
          await ForumNotification.create({
            destinatario: post.autor,
            remitente: userId,
            tipo: 'reaccion_post',
            postId: post._id,
            tipoReaccion: tipo,
            mensaje: `reaccionó ${reactionEmojis[tipo as keyof typeof reactionEmojis]} a tu publicación`
          });
        }
      }

      await post.save();

      return res.json({
        success: true,
        data: post.reacciones
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al agregar reacción'
      });
    }
  }

  // Crear comentario
  static async createComment(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const { contenido } = req.body;
      const autor = req.user?.id;

      const comment = new ForumComment({
        postId,
        autor,
        contenido
      });

      await comment.save();
      await comment.populate('autor', 'nombre email esVendedor isAdmin');

      // Incrementar contador de comentarios en el post
      const post = await ForumPost.findByIdAndUpdate(postId, {
        $inc: { totalComentarios: 1 }
      }, { new: true });

      // Crear notificación para el autor del post
      if (post && post.autor.toString() !== autor) {
        await ForumNotification.create({
          destinatario: post.autor,
          remitente: autor,
          tipo: 'nuevo_comentario',
          postId: post._id,
          comentarioId: comment._id,
          mensaje: 'comentó en tu publicación'
        });
      }

      res.status(201).json({
        success: true,
        data: comment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al crear comentario'
      });
    }
  }

  // Obtener comentarios de un post
  static async getComments(req: Request, res: Response) {
    try {
      const { postId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const comments = await ForumComment.find({ postId })
        .populate('autor', 'nombre email esVendedor isAdmin')
        .sort({ fechaCreacion: -1 })
        .skip(skip)
        .limit(limit);

      res.json({
        success: true,
        data: comments
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener comentarios'
      });
    }
  }

  // Agregar reacción a comentario
  static async addReactionToComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const { tipo } = req.body;
      const userId = req.user?.id;

      const comment = await ForumComment.findById(commentId);
      if (!comment) {
        return res.status(404).json({
          success: false,
          message: 'Comentario no encontrado'
        });
      }

      // Remover reacción anterior del usuario
      Object.keys(comment.reacciones).forEach(key => {
        const reactionArray = comment.reacciones[key as keyof typeof comment.reacciones];
        const index = reactionArray.indexOf(new mongoose.Types.ObjectId(userId));
        if (index > -1) {
          reactionArray.splice(index, 1);
        }
      });

      // Agregar nueva reacción
      if (tipo && comment.reacciones[tipo as keyof typeof comment.reacciones]) {
        comment.reacciones[tipo as keyof typeof comment.reacciones].push(new mongoose.Types.ObjectId(userId));
        
        // Crear notificación si no es el autor del comentario
        if (comment.autor.toString() !== userId) {
          const reactionEmojis = { bien: '👍', contento: '😊', enojado: '😠', triste: '😢' };
          await ForumNotification.create({
            destinatario: comment.autor,
            remitente: userId,
            tipo: 'reaccion_comentario',
            comentarioId: comment._id,
            tipoReaccion: tipo,
            mensaje: `reaccionó ${reactionEmojis[tipo as keyof typeof reactionEmojis]} a tu comentario`
          });
        }
      }

      await comment.save();

      return res.json({
        success: true,
        data: comment.reacciones
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error al agregar reacción'
      });
    }
  }

  // Obtener notificaciones del usuario
  static async getNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const notifications = await ForumNotification.find({ destinatario: userId })
        .populate('remitente', 'nombre email')
        .sort({ fechaCreacion: -1 })
        .limit(20);

      res.json({
        success: true,
        data: notifications
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener notificaciones'
      });
    }
  }

  // Marcar notificación como leída
  static async markAsRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      await ForumNotification.findByIdAndUpdate(notificationId, { leida: true });
      
      res.json({
        success: true,
        message: 'Notificación marcada como leída'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al marcar notificación'
      });
    }
  }
}