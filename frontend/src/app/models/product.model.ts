
export interface Product {
  _id: string;
  nombre: string;
  descripcion: string;
  precioInicial: number;
  precioActual?: number; 
  imagenUrl: string;
  categoria: string;
  estado: "activo" | "finalizado";
  vendedorId: string;
  fechaCreacion: string; 
  fechaCierre: string;   
}
