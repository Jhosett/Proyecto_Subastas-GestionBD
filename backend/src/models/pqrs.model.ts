import mongoose, { Schema, Document } from 'mongoose';

export interface IPQRS extends Document {
  type: 'peticion' | 'queja' | 'reclamo' | 'sugerencia';
  subject: string;
  description: string;
  productId?: string;
  relatedUserId?: string;
  isAnonymous: boolean;
  userId: string;
  status: 'pendiente' | 'en_proceso' | 'resuelto' | 'cerrado';
  response?: string;
  responseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PQRSSchema: Schema = new Schema({
  type: {
    type: String,
    enum: ['peticion', 'queja', 'reclamo', 'sugerencia'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  productId: {
    type: String,
    required: false
  },
  relatedUserId: {
    type: String,
    required: false
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  userId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pendiente', 'en_proceso', 'resuelto', 'cerrado'],
    default: 'pendiente'
  },
  response: {
    type: String,
    required: false
  },
  responseDate: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

export default mongoose.model<IPQRS>('PQRS', PQRSSchema);