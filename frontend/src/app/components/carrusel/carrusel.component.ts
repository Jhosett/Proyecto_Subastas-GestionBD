import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-carrusel',
  imports: [CommonModule],
  templateUrl: './carrusel.component.html',
  styleUrl: './carrusel.component.css'
})
export class CarruselComponent implements OnInit, OnDestroy {
  images = [
    'assets/carrusel_img1.jpg',
    'assets/carrusel_img2.jpg',
    'assets/carrusel_img4.webp',
  ];
  
  currentIndex = 0;
  private intervalId: any;
  private progressIntervalId: any;
  private readonly autoPlayInterval = 5000; // 5 segundos
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

  pauseAutoPlay(): void {
    this.isPaused = true;
  }

  resumeAutoPlay(): void {
    this.isPaused = false;
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
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
    this.resetProgress();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 400);
  }

  prevSlide(): void {
    if (this.isTransitioning) return;
    
    this.isTransitioning = true;
    this.currentIndex = this.currentIndex === 0 
      ? this.images.length - 1 
      : this.currentIndex - 1;
    this.resetProgress();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 400);
  }

  goToSlide(index: number): void {
    if (this.isTransitioning || index === this.currentIndex) return;
    
    this.isTransitioning = true;
    this.currentIndex = index;
    this.resetProgress();
    
    setTimeout(() => {
      this.isTransitioning = false;
    }, 400);
  }

  trackByIndex(index: number): number {
    return index;
  }
}