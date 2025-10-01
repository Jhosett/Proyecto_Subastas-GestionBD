import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-form',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './product-form.component.html',
})
export class ProductFormComponent {
  product: Partial<Product> = {
    nombre: '',
    descripcion: '',
    precioInicial: 0,
    precioActual: 0,
    imagenUrl: '',
    categoria: '',
    estado: 'activo',
    vendedorId: '123',
    fechaCierre: ''
  };

  constructor(private productService: ProductService) {}

  saveProduct(): void {
    // ✅ Convertir fechaCierre a formato ISO string
    const productToSave: Product = {
      ...this.product,
      fechaCierre: new Date(this.product.fechaCierre!).toISOString()
    } as Product;

    // ✅ Pasar sellerId como segundo argumento
    this.productService.createProduct(productToSave, this.product.vendedorId!).subscribe({
      next: () => alert('✅ Producto creado con éxito'),
      error: () => alert('❌ Error al crear producto')
    });
  }
}