import { Schema, model, Document } from 'mongoose';

export interface IBid extends Document {
  productoId: string;
  compradorId: string; 
  valorPuja: number; 
  fechaPuja: Date; 
}

const bidSchema = new Schema<IBid>({
  productoId: { type: String, required: true, ref: 'Product' },
  compradorId: { type: String, required: true, ref: 'User' },
  valorPuja: { type: Number, required: true, min: 0 },
  fechaPuja: { type: Date, default: Date.now },
});

bidSchema.index({ productoId: 1, valorPuja: -1 });

export const Bid = model<IBid>('Bid', bidSchema);