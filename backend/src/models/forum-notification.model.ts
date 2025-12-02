import mongoose, { Document, Schema } from 'mongoose';

export interface ForumNotification extends Document {
  destinatario: mongoose.Types.ObjectId;
  remitente: mongoose.Types.ObjectId;
  tipo: 'reaccion_post' | 'reaccion_comentario' | 'nuevo_comentario';
  postId?: mongoose.Types.ObjectId;
  comentarioId?: mongoose.Types.ObjectId;
  tipoReaccion?: 'bien' | 'contento' | 'enojado' | 'triste';
  mensaje: string;
  leida: boolean;
  fechaCreacion: Date;
}

const forumNotificationSchema = new Schema<ForumNotification>({
  destinatario: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  remitente: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tipo: {
    type: String,
    enum: ['reaccion_post', 'reaccion_comentario', 'nuevo_comentario'],
    required: true
  },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'ForumPost'
  },
  comentarioId: {
    type: Schema.Types.ObjectId,
    ref: 'ForumComment'
  },
  tipoReaccion: {
    type: String,
    enum: ['bien', 'contento', 'enojado', 'triste']
  },
  mensaje: {
    type: String,
    required: true
  },
  leida: {
    type: Boolean,
    default: false
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
});

export const ForumNotification = mongoose.model<ForumNotification>('ForumNotification', forumNotificationSchema);