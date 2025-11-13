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

  bidders: Array<any> = [];
  isSeller: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProduct(id).subscribe({
        next: (data) => {
          this.product = data;
          this.checkIfSellerAndLoadBidders();
        },
        error: (err) => console.error('Error al cargar el producto', err)
      });
    }
  }

  private checkIfSellerAndLoadBidders() {
    const uid = localStorage.getItem('userId');
    if (this.product && uid && this.product.vendedorId === uid) {
      this.isSeller = true;
      this.loadBidders();
    } else {
      this.isSeller = false;
    }
  }

  private loadBidders() {
    if (!this.product) return;
    this.productService.getBids(this.product._id!).subscribe({
      next: (b) => {
        this.bidders = b;
      },
      error: (err) => console.error('Error cargando pujadores', err)
    });
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
        alert('Puja realizada correctamente');
        this.product = updated;
      },
      error: () => alert('Error al pujar')
    });
  }

  // El vendedor asigna ganador
  assignWinner(bid: any) {
    if (!this.product) return;
    const confirmMsg = `¿Asignar ganador ${bid.nombre || bid.compradorId} por $${bid.valorPuja}?`;
    if (!confirm(confirmMsg)) return;

    const paymentMethod = prompt('Ingrese método de pago sugerido (Nequi, Bancolombia, PSE, etc):', 'Nequi');
    const paymentDetails = prompt('Ingrese detalles de pago (número de cuenta, teléfono, o instrucciones):', '3103155486 - Nequi');

    const sellerId = localStorage.getItem('userId');
    if (!sellerId) {
      alert('No autenticado');
      return;
    }

    this.productService.award(this.product._id!, sellerId, bid.compradorId, paymentMethod || undefined, paymentDetails || undefined)
      .subscribe({
        next: (res) => {
          alert('Ganador asignado y notificaciones enviadas');
          // refrescar producto y lista de pujadores
          this.productService.getProduct(this.product!._id!).subscribe({ next: p => { this.product = p; this.loadBidders(); } });
        },
        error: (err) => {
          console.error('Error asignando ganador', err);
          alert('Error al asignar ganador');
        }
      });
  }
}
