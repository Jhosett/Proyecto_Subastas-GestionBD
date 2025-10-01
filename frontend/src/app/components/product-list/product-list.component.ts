import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common'; 
import { Product, ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './product-list.component.html'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => (this.products = data),
      error: (err) => console.error('Error cargando productos', err)
    });
  }

  pujar(product: Product): void {
    const amount = Number(prompt('Ingrese su oferta:'));
    if (!amount) return;

    this.productService.bid(product._id!, amount).subscribe({
      next: (updated) => {
        alert(`Nueva puja registrada: ${updated.precioActual}`);
        this.loadProducts();
      },
      error: () => alert('Error al pujar')
    });
  }
}
