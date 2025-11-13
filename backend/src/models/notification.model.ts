

import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string; // Destinatario (comprador o vendedor)
  tipo: 'pujaRecibida' | 'pujaRealizada' | 'subastaGanada' | 'subastaPerdida' | 'productoVendido';
  mensaje: string;
  productoId?: string; 
  leida: boolean;
  fechaCreacion: Date;
}

const notificationSchema = new Schema<INotification>({
  userId: { type: String, required: true, ref: 'User' },
  tipo: {
    type: String,
    enum: ['pujaRecibida', 'pujaRealizada', 'subastaGanada', 'subastaPerdida', 'productoVendido'],
    required: true,
  },
  mensaje: { type: String, required: true },
  productoId: { type: String, required: false, ref: 'Product' },
  leida: { type: Boolean, default: false },
  fechaCreacion: { type: Date, default: Date.now },
});

export const Notification = model<INotification>('Notification', notificationSchema);