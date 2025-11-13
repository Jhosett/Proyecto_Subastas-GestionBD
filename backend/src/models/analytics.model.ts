

import { Schema, model, Document } from 'mongoose';
import { User } from './user.model'; 


type Ubicacion = Pick<User, 'pais' | 'departamento' | 'ciudad'>;

export interface IAnalytics extends Document {
  userId: string;
  fecha: Date; 
  ubicacion: Ubicacion; 
  tiempoTotalEnPagina: number; 
  categoriasClickeadas: string[]; 
  intentoSubastar: boolean; 
}

const analyticsSchema = new Schema<IAnalytics>({
  userId: { type: String, required: true, ref: 'User' },
  fecha: { type: Date, default: Date.now, required: true },
  ubicacion: {
    pais: { type: String, required: true },
    departamento: { type: String, required: true },
    ciudad: { type: String, required: true },
  },
  tiempoTotalEnPagina: { type: Number, required: true, default: 0 },
  categoriasClickeadas: [{ type: String }],
  intentoSubastar: { type: Boolean, required: true, default: false },
});

export const Analytics = model<IAnalytics>('Analytics', analyticsSchema);