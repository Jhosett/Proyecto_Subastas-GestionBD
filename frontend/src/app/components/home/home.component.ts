import { Component, OnInit, inject, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { UsersService } from '../../services/users.service';

import { CarruselComponent } from "../carrusel/carrusel.component";
import { AuctionCardComponent } from '../auction-card/auction-card.component';
// CORRECCIÓN CLAVE: Importar el componente que se inyecta
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component'; 

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, CarruselComponent, AuctionCardComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  
  // INYECCIÓN DEL PADRE: Se inyecta MainLayoutComponent para acceder a la lógica de analíticas
  private mainLayout = inject(MainLayoutComponent, { optional: true });
  
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading: boolean = true;  // Auction modal state
  showAuctionModal: boolean = false;
  selectedProduct: Product | null = null;

  
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
    private usersService: UsersService,
    private router: Router
  ) {}  ngOnInit(): void {
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
    // 1. Lógica de Analíticas: Registrar el clic en la categoría seleccionada
    // Solo registra si la categoría es nueva (para evitar spamming en el servidor si el usuario hace doble click)
    if (this.mainLayout && category !== this.selectedCategory) {
      this.mainLayout.registerCategoryClick(category);
    }

    // 2. Lógica de Negocio: Aplicar filtro
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
      Swal.fire({
        title: '¡Inicia sesión para pujar!',
        text: 'Necesitas tener una cuenta para participar en las subastas',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Ir al Login',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    const product = this.products.find(p => p._id === productId);
    if (!product) return;

    this.selectedProduct = product;
    this.showAuctionModal = true;
  }

  onCloseAuctionModal(): void {
    this.showAuctionModal = false;
    this.selectedProduct = null;
  }

  /**
    * Función que maneja la lógica para colocar una puja.
    * 🚀 Implementa la analítica para registrar el intento de subasta.
    */
  onPlaceBid(bidAmount: number): void {
    if (!this.selectedProduct) return;

    // Validar que el usuario esté autenticado
    if (!this.usersService.userId) {
      Swal.fire('Autenticación requerida', 'Debes iniciar sesión para hacer una puja.', 'warning');
      this.router.navigate(['/login']);
      return;
    }

    // ✅ LÓGICA DE ANALÍTICAS: Registrar el intento de subastar
    this.mainLayout?.registerIntentoSubastar();
    
    this.productService.bid(this.selectedProduct._id, bidAmount).subscribe({
      next: (updated) => {
        console.log('Bid placed successfully:', updated);
        this.loadProducts();
        this.onCloseAuctionModal();
        Swal.fire('Puja Exitosa', 'Tu puja ha sido registrada. ¡Mucha suerte!', 'success');
      },
      error: (error) => {
        console.error('Error placing bid:', error);
        // Usar Swal en lugar de alert
        Swal.fire('Error al Pujar', error.error?.error || 'No se pudo registrar la puja. Asegúrate de que tu oferta sea superior.', 'error');
        this.onCloseAuctionModal();
      }
    });
  }  trackByProductId(index: number, product: Product): string { return product._id; }
}