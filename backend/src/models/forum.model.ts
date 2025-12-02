import mongoose, { Document, Schema } from 'mongoose';

export interface ForumPost extends Document {
  autor: mongoose.Types.ObjectId;
  titulo: string;
  contenido: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  reacciones: {
    bien: mongoose.Types.ObjectId[];
    contento: mongoose.Types.ObjectId[];
    enojado: mongoose.Types.ObjectId[];
    triste: mongoose.Types.ObjectId[];
  };
  totalComentarios: number;
}

export interface ForumComment extends Document {
  postId: mongoose.Types.ObjectId;
  autor: mongoose.Types.ObjectId;
  contenido: string;
  fechaCreacion: Date;
  reacciones: {
    bien: mongoose.Types.ObjectId[];
    contento: mongoose.Types.ObjectId[];
    enojado: mongoose.Types.ObjectId[];
    triste: mongoose.Types.ObjectId[];
  };
}

const forumPostSchema = new Schema<ForumPost>({
  autor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  titulo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  contenido: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  fechaActualizacion: {
    type: Date,
    default: Date.now
  },
  reacciones: {
    bien: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    contento: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    enojado: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    triste: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  totalComentarios: {
    type: Number,
    default: 0
  }
});

const forumCommentSchema = new Schema<ForumComment>({
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'ForumPost',
    required: true
  },
  autor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contenido: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  fechaCreacion: {
    type: Date,
    default: Date.now
  },
  reacciones: {
    bien: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    contento: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    enojado: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    triste: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  }
});

export const ForumPost = mongoose.model<ForumPost>('ForumPost', forumPostSchema);
export const ForumComment = mongoose.model<ForumComment>('ForumComment', forumCommentSchema);