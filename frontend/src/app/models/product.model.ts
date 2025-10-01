// models/product.model.ts
export interface Product {
  _id: string;
  nombre: string;
  descripcion: string;
  precioInicial: number;
  precioActual?: number; // <-- opcional porque a veces no existe
  imagenUrl: string;
  categoria: string;
  estado: "activo" | "finalizado";
  vendedorId: string;
  fechaCreacion: string; // o Date
  fechaCierre: string;   // o Date
}
