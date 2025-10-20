// home.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

import { ProductCardComponent } from '../product-card/product-card.component';
import { CarruselComponent } from "../carrusel/carrusel.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, CarruselComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading: boolean = true;

 
  searchTerm: string = '';
  selectedCategory: string = '';
  filterStatus: string = '';
  sortBy: string = 'recent';

  categories = [
    { name: 'Electrónica', icon: '/assets/iphone.png' },
    { name: 'Hogar', icon: '/assets/casa.png' },
    { name: 'Moda', icon: '/assets/vestir.png' },
    { name: 'Deportes', icon: '/assets/deportes.png' },
    { name: 'Vehículos', icon: '/assets/carro.png' },
    { name: 'Arte', icon: '/assets/arte.png' },
    { name: 'Otros', icon: '/assets/objetos.png' }
  ];
  

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // ✅ Cargar todos los productos
  loadProducts(): void {
    this.isLoading = true;
    this.productService.getProducts().subscribe({
      next: (data) => {
        console.log('Productos cargados:', data);
        this.products = data;
        this.filteredProducts = [...data];
        this.isLoading = false;
        this.applySorting();
      },
      error: (err) => {
        console.error('Error cargando productos', err);
        this.isLoading = false;
      }
    });
  }

  // 🔍 Filtros
  onSearch(): void { this.applyFilters(); }

  filterByCategory(category: string): void {
    this.selectedCategory = this.selectedCategory === category ? '' : category;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.products];

    // Filtro por búsqueda
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.nombre.toLowerCase().includes(term) ||
        p.descripcion.toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term)
      );
    }

    // Filtro por categoría
    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.categoria === this.selectedCategory);
    }

    // Filtro por estado
    if (this.filterStatus) {
      filtered = filtered.filter(p => p.estado === this.filterStatus);
    }

    this.filteredProducts = filtered;
    this.applySorting();
  }

  // 📊 Ordenamiento
  applySorting(): void {
    switch (this.sortBy) {
      case 'price-low':
        this.filteredProducts.sort((a, b) => (a.precioActual ?? a.precioInicial) - (b.precioActual ?? b.precioInicial));
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => (b.precioActual ?? b.precioInicial) - (a.precioActual ?? a.precioInicial));
        break;
      case 'ending':
        this.filteredProducts.sort((a, b) => {
          if (!a.fechaCierre) return 1;
          if (!b.fechaCierre) return -1;
          return new Date(a.fechaCierre).getTime() - new Date(b.fechaCierre).getTime();
        });
        break;
      default: // 'recent'
        this.filteredProducts.sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.filterStatus = '';
    this.sortBy = 'recent';
    this.filteredProducts = [...this.products];
    this.applySorting();
  }

  getTimeRemaining(fechaCierre: string): string {
    const now = new Date().getTime();
    const end = new Date(fechaCierre).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Finalizada';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  // 🔗 Navegación
  goToDetail(productId: string): void { this.router.navigate(['/products', productId]); }

  // 💰 Pujar
  makeBid(productId: string): void {
    const userData = localStorage.getItem('userData');
    if (!userData) {
      this.router.navigate(['/login']);
      return;
    }

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

  trackByProductId(index: number, product: Product): string { return product._id; }
}
