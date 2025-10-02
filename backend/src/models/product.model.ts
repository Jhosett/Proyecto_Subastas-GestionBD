import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  nombre: string;
  descripcion: string;
  precioInicial: number;
  imagenUrl?: string; 
  categoria: string;
  estado: "activo" | "finalizado";
  vendedorId: string;
  fechaCreacion: Date;
  fechaCierre?: Date; 
}

const productSchema = new Schema<IProduct>({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precioInicial: { type: Number, required: true },
  imagenUrl: { type: String, required: false, default: '/assets/noimg.png' }, 
  categoria: { type: String, required: true },
  estado: { type: String, enum: ["activo", "finalizado"], default: "activo" },
  vendedorId: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaCierre: { type: Date, required: false } 
});

export default model<IProduct>("Product", productSchema);