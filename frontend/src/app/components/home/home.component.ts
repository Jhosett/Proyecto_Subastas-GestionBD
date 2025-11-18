import { Component, OnInit, inject, Optional } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import { UsersService } from '../../services/users.service';

import { CarruselComponent } from "../carrusel/carrusel.component";
import { AuctionCardComponent } from '../auction-card/auction-card.component';
import { MainLayoutComponent } from '../../layouts/main-layout/main-layout.component'; 

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    HttpClientModule, 
    CarruselComponent, 
    AuctionCardComponent,
    RouterLink
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  
  private mainLayout = inject(MainLayoutComponent, { optional: true });
  
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading: boolean = true;
  showAuctionModal: boolean = false;
  selectedProduct: Product | null = null;

  // Variables de autenticación
  isLoggedIn: boolean = false;
  
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
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.checkLoginStatus();
  }

  // Verificar estado de autenticación
  checkLoginStatus(): void {
    const userData = localStorage.getItem('userData');
    const userId = localStorage.getItem('userId');
    this.isLoggedIn = !!(userData && userId);
    
    // Debug log
    console.log('🔐 Login status:', this.isLoggedIn);
    console.log('  - userId:', userId);
    console.log('  - userId from service:', this.usersService.userId());
  }

  // Cargar todos los productos
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

  // Filtros
  onSearch(): void { 
    this.applyFilters(); 
  }

  filterByCategory(category: string): void {
    // Track category click
    const userId = this.usersService.userId();
    if (userId && category !== this.selectedCategory) {
      this.usersService.trackAction(userId, category).subscribe();
    }

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

  // Ordenamiento
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

  // Navegación
  goToDetail(productId: string): void {
    // Track product click
    const userId = this.usersService.userId();
    const product = this.products.find(p => p._id === productId);
    if (userId && product) {
      this.usersService.trackAction(userId, product.categoria).subscribe();
    }
    
    this.router.navigate(['/products', productId]); 
  }

  // Pujar
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

    // Check if user is the seller of this product
    const currentUser = JSON.parse(userData);
    if (product.vendedorId === currentUser._id) {
      Swal.fire({
        title: 'No puedes pujar',
        text: 'No puedes pujar en tus propios productos',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    this.selectedProduct = product;
    this.showAuctionModal = true;
  }

  onCloseAuctionModal(): void {
    this.showAuctionModal = false;
    this.selectedProduct = null;
  }

  onPlaceBid(bidAmount: number): void {
    if (!this.selectedProduct) return;

    const userId = this.usersService.userId();
    
    if (!userId) {
      Swal.fire({
        title: 'Autenticación requerida',
        text: 'Debes iniciar sesión para hacer una puja.',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      this.router.navigate(['/login']);
      return;
    }

    // Track bid attempt
    this.usersService.trackBid(userId).subscribe();
    
    Swal.fire({
      title: 'Procesando puja...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.productService.bid(this.selectedProduct._id, bidAmount).subscribe({
      next: (updated) => {
        console.log('✅ Bid placed successfully:', updated);
        this.loadProducts();
        this.onCloseAuctionModal();
        Swal.fire({
          icon: 'success',
          title: 'Puja Exitosa',
          text: 'Tu puja ha sido registrada. ¡Mucha suerte!',
          confirmButtonColor: '#10b981',
          timer: 2000
        });
      },
      error: (error) => {
        console.error('❌ Error placing bid:', error);
        console.error('  - Status:', error.status);
        console.error('  - Error message:', error.error);
        
        let errorMessage = 'No se pudo registrar la puja.';
        
        if (error.status === 400) {
          errorMessage = error.error?.error || error.error?.message || 'La puja debe ser mayor al precio actual.';
        } else if (error.status === 401 || error.status === 403) {
          errorMessage = 'Error de autenticación. Por favor, inicia sesión nuevamente.';
        } else if (error.status === 404) {
          errorMessage = 'Producto no encontrado.';
        }
        
        Swal.fire({
          icon: 'error',
          title: 'Error al Pujar',
          text: errorMessage,
          confirmButtonColor: '#ef4444'
        });
        this.onCloseAuctionModal();
      }
    });
  }

  trackByProductId(index: number, product: Product): string { 
    return product._id; 
  }

  isOwnProduct(product: Product): boolean {
    const userData = localStorage.getItem('userData');
    if (!userData) return false;
    const currentUser = JSON.parse(userData);
    return product.vendedorId === currentUser._id;
  }
}