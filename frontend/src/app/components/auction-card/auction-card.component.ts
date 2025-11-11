import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../services/product.service';

@Component({
  selector: 'app-auction-card',
  imports: [CommonModule, FormsModule],
  templateUrl: './auction-card.component.html',
  styleUrl: './auction-card.component.css'
})
export class AuctionCardComponent implements OnInit {
  @Input() product: Product | null = null;
  @Input() isVisible: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() placeBid = new EventEmitter<number>();

  bidAmount: number = 0;
  minBid: number = 0;

  ngOnInit() {
    if (this.product) {
      this.minBid = (this.product.precioActual || this.product.precioInicial || 0) + 1;
      this.bidAmount = this.minBid;
    }
  }

  onClose() {
    this.close.emit();
  }

  onPlaceBid() {
    if (this.bidAmount >= this.minBid) {
      this.placeBid.emit(this.bidAmount);
      this.close.emit();
    }
  }

  incrementBid(amount: number) {
    this.bidAmount += amount;
  }
}
