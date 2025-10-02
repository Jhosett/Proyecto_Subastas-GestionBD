import { Schema, model, Document } from "mongoose";

export interface IProduct extends Document {
  nombre: string;
  descripcion: string;
  precioInicial: number;
  imagenUrl?: string; // Ahora opcional
  categoria: string;
  estado: "activo" | "finalizado";
  vendedorId: string;
  fechaCreacion: Date;
  fechaCierre?: Date; // Ahora opcional
}

const productSchema = new Schema<IProduct>({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precioInicial: { type: Number, required: true },
  imagenUrl: { type: String, required: false, default: '/assets/noimg.png' }, // Opcional con valor por defecto
  categoria: { type: String, required: true },
  estado: { type: String, enum: ["activo", "finalizado"], default: "activo" },
  vendedorId: { type: String, required: true },
  fechaCreacion: { type: Date, default: Date.now },
  fechaCierre: { type: Date, required: false } // Opcional
});

export default model<IProduct>("Product", productSchema);