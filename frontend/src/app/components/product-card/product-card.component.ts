import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // <- importa CommonModule para pipes
import { Product } from '../../services/product.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-product-card',
  standalone: true, // <- importante si quieres usar este componente de manera independiente
  imports: [CommonModule], // <- necesario para currency, date, ngIf, ngFor, etc
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent implements OnInit, OnDestroy {
  @Input() product?: Product;
  @Output() view = new EventEmitter<string>(); // emite id para ver detalle
  @Output() bidNow = new EventEmitter<string>(); // emite id para pujar

  timeLeft = '—';
  private sub?: Subscription;

  ngOnInit(): void {
    this.updateTimer();
    this.sub = interval(1000).subscribe(() => this.updateTimer());
  }

  updateTimer(): void {
    if (!this.product?.fechaCierre) { this.timeLeft = '—'; return; }
    const diff = new Date(this.product.fechaCierre).getTime() - Date.now();
    if (diff <= 0) { this.timeLeft = '00:00:00'; return; }
    const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
    const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
    this.timeLeft = `${h}:${m}:${s}`;
  }

  onView(): void {
    if (this.product?._id) this.view.emit(this.product._id);
  }

  onBidNow(): void {
    if (this.product?._id) this.bidNow.emit(this.product._id);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
