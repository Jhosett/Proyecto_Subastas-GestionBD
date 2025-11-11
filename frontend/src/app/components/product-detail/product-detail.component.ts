import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product, ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html'
})
export class ProductDetailComponent implements OnInit {
  
  @Input() product: Product | null = null;
  showImageModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProduct(id).subscribe({
        next: (data) => (this.product = data),
        error: (err) => console.error('Error al cargar el producto', err)
      });
    }
  }

  openImageModal(): void {
    this.showImageModal = true;
  }

  closeImageModal(): void {
    this.showImageModal = false;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  pujar(): void {
    if (!this.product) return;
    const amount = Number(prompt('Ingrese su oferta:'));
    if (!amount) return;

    this.productService.bid(this.product._id!, amount).subscribe({
      next: (updated) => {
        alert(`Nueva puja: ${updated.precioActual}`);
        this.product = updated;
      },
      error: () => alert('Error al pujar')
    });
  }
}