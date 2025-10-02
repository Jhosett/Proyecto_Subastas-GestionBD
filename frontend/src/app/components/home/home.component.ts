// home.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { Product } from '../../models/product.model'; 
import { ProductService } from '../../services/product.service';

// 👇 Importar tu card de producto
import { ProductCardComponent } from '../product-card/product-card.component';
import { CarruselComponent } from "../carrusel/carrusel.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, ProductCardComponent, CarruselComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  products: Product[] = [];

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // ✅ Cargar todos los productos desde el backend
  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        console.log('Productos cargados:', data);
        this.products = data;
      },
      error: (err) => console.error('Error cargando productos', err)
    });
  }

  // ✅ Navegar al detalle del producto
  goToDetail(productId: string): void {
    this.router.navigate(['/products', productId]);
  }

  // ✅ Hacer una puja
  makeBid(productId: string): void {
    const product = this.products.find(p => p._id === productId);
    if (!product) return;

    const amountStr = prompt('Ingrese su oferta:');
    if (!amountStr) return;

    const amount = Number(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert('Ingrese un monto válido');
      return;
    }

    this.productService.bid(productId, amount).subscribe({
      next: (updated) => {
        alert(`Nueva puja registrada: ${updated.precioActual ?? amount}`);
        this.loadProducts();
      },
      error: () => alert('Error al pujar')
    });
  }
}
