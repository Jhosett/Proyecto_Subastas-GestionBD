export interface ForumPost {
  _id: string;
  autor: {
    _id: string;
    nombre: string;
    email: string;
    esVendedor: boolean;
    isAdmin: boolean;
  };
  titulo: string;
  contenido: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  reacciones: {
    bien: string[];
    contento: string[];
    enojado: string[];
    triste: string[];
  };
  totalComentarios: number;
}

export interface ForumComment {
  _id: string;
  postId: string;
  autor: {
    _id: string;
    nombre: string;
    email: string;
    esVendedor: boolean;
    isAdmin: boolean;
  };
  contenido: string;
  fechaCreacion: Date;
  reacciones: {
    bien: string[];
    contento: string[];
    enojado: string[];
    triste: string[];
  };
}

export interface CreatePostRequest {
  titulo: string;
  contenido: string;
}

export interface CreateCommentRequest {
  contenido: string;
}

export interface ReactionRequest {
  tipo: 'bien' | 'contento' | 'enojado' | 'triste';
}

export interface ForumNotification {
  _id: string;
  destinatario: string;
  remitente: {
    _id: string;
    nombre: string;
    email: string;
  };
  tipo: 'reaccion_post' | 'reaccion_comentario' | 'nuevo_comentario';
  postId?: string;
  comentarioId?: string;
  tipoReaccion?: 'bien' | 'contento' | 'enojado' | 'triste';
  mensaje: string;
  leida: boolean;
  fechaCreacion: Date;
}