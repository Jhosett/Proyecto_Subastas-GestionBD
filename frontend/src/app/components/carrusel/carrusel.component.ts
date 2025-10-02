import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AuctionProduct {
  id: number;
  name: string;
  image: string;
  currentPrice: number;
  minBid: number;
  totalBids: number;
  timeRemaining: string;
  isFeatured?: boolean;
}

@Component({
  selector: 'app-carrusel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './carrusel.component.html',
  styleUrls: ['./carrusel.component.css']
})
export class CarruselComponent implements OnInit, OnDestroy {
  products: AuctionProduct[] = [
    {
      id: 1,
      name: 'Reloj de Lujo Vintage',
      image: 'https://imgs.search.brave.com/IY0rYOq8Im2WgKexW7uEuBIlbKBPv0u11o6EdjKHD2U/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMudW5zcGxhc2gu/Y29tL3Bob3RvLTE3/MTg0Mzg1MzE2MTIt/M2EyYmE4MDY5MDk2/P2ZtPWpwZyZxPTYw/Jnc9MzAwMCZpeGxp/Yj1yYi00LjAuMyZp/eGlkPU0zd3hNakEz/ZkRCOE1IeHpaV0Z5/WTJoOE1UVjhmSEps/Ykc5cUpUSXdkbWx1/ZEdGblpYeGxibnd3/Zkh3d2ZIeDhNQT09',
      currentPrice: 1500000,
      minBid: 50000,
      totalBids: 23,
      timeRemaining: '2h 15m',
      isFeatured: true
    },
    {
      id: 2,
      name: 'Pintura Original Siglo XIX',
      image: 'https://pictolic.com/img/2022/10-pinturas-ms-famosas-del/10-pinturas-ms-famosas-del-2.jpg',
      currentPrice: 3200000,
      minBid: 100000,
      totalBids: 47,
      timeRemaining: '5h 30m'
    },
    {
      id: 3,
      name: 'Cámara Profesional Clásica',
      image: 'data:image/webp;base64,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',
      currentPrice: 850000,
      minBid: 25000,
      totalBids: 15,
      timeRemaining: '1h 45m'
    }
  ];
  
  currentIndex = 0;
  private intervalId: any;
  private progressIntervalId: any;
  private readonly autoPlayInterval = 5000;
  isPaused = false;
  isTransitioning = false;
  progressPercentage = 0;

  ngOnInit(): void {
    this.startAutoPlay();
    this.startProgressTimer();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
    this.stopProgressTimer();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  }

  startAutoPlay(): void {
    this.intervalId = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, this.autoPlayInterval);
  }

  stopAutoPlay(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  startProgressTimer(): void {
    this.progressPercentage = 0;
    this.progressIntervalId = setInterval(() => {
      if (!this.isPaused) {
        this.progressPercentage += (100 / (this.autoPlayInterval / 100));
        if (this.progressPercentage >= 100) {
          this.progressPercentage = 0;
        }
      }
    }, 100);
  }

  stopProgressTimer(): void {
    if (this.progressIntervalId) {
      clearInterval(this.progressIntervalId);
      this.progressIntervalId = null;
    }
  }

  resetProgress(): void {
    this.progressPercentage = 0;
  }

  toggleAutoPlay(): void {
    this.isPaused = !this.isPaused;
    if (!this.isPaused) {
      this.resetProgress();
    }
  }

  nextSlide(): void {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentIndex = (this.currentIndex + 1) % this.products.length;
    this.resetProgress();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 700);
  }

  prevSlide(): void {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentIndex = this.currentIndex === 0 
      ? this.products.length - 1 
      : this.currentIndex - 1;
    this.resetProgress();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 700);
  }

  goToSlide(index: number): void {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    this.currentIndex = index;
    this.resetProgress();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 700);
  }

  onBidNow(product: AuctionProduct): void {
    console.log('Pujar ahora:', product);
    // Aquí irá la lógica para abrir el modal de puja
  }
}