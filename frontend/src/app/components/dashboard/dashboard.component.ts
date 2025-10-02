
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../services/users.service';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Product } from '../../models/product.model';

interface UserProfile {
  _id: string;
  nombre: string;
  tipoDocumento: string;
  numeroDocumento: string;
  telefono: string;
  direccion: string;
  email: string;
  esVendedor: boolean;
  datosVendedor?: {
    tipoActividad: string;
    nombreEmpresa?: string;
    descripcionEmpresa?: string;
    nit: string;
  };
  fechaRegistro: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  userProfile: UserProfile | null = null;
  isLoading: boolean = true;
  errorMessage: string = '';
  activeTab: string = 'personal';

  products: Product[] = [];
  newProduct: Partial<Product> = {
    nombre: '',
    descripcion: '',
    precioInicial: 0,
    precioActual: 0,
    categoria: '',
    vendedorId: '',
    imagenUrl: '',
    fechaCierre: ''
  };
  editingProduct: Product | null = null;

  constructor(
    private usersService: UsersService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'productos' && this.userProfile?.esVendedor) {
      this.loadProducts();
    }
  }

  loadUserProfile() {
    this.isLoading = true;
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        this.userProfile = JSON.parse(userData);
        this.isLoading = false;
        if (this.userProfile?.esVendedor) {
          this.loadProducts();
        }
      } else {
        this.errorMessage = 'No se encontró información del usuario. Por favor, inicia sesión.';
        this.isLoading = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.errorMessage = 'Error al cargar el perfil del usuario.';
      this.isLoading = false;
    }
  }

  loadProducts() {
    if (!this.userProfile) return;
    this.productService.getProductsBySeller(this.userProfile._id).subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los productos'
        });
      }
    });
  }

  createProduct() {
    if (!this.userProfile) return;

    // Validación
    if (!this.newProduct.nombre || !this.newProduct.descripcion || 
        !this.newProduct.precioInicial || !this.newProduct.categoria) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos obligatorios',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    const productData: Product = {
      ...this.newProduct,
      vendedorId: this.userProfile._id,
      precioActual: this.newProduct.precioInicial || 0
    } as Product;

    // Mostrar loading
    Swal.fire({
      title: 'Publicando subasta...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.productService.createProduct(productData, this.userProfile._id).subscribe({
      next: (created) => {
        Swal.fire({
          icon: 'success',
          title: '¡Producto Registrado!',
          text: 'Tu producto se ha publicado correctamente en la subasta',
          confirmButtonColor: '#10b981',
          timer: 2000
        });
        this.products.unshift(created); 
        this.resetNewProductForm();
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error al publicar',
          text: 'No se pudo registrar el producto. Por favor intenta de nuevo.',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  editProduct(product: Product) {
    this.editingProduct = { ...product };
    
    setTimeout(() => {
      const editForm = document.querySelector('.from-yellow-50');
      if (editForm) {
        editForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  updateProduct() {
    if (!this.editingProduct) return;

    // Validación
    if (!this.editingProduct.nombre || !this.editingProduct.descripcion || 
        !this.editingProduct.precioInicial) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos obligatorios',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    Swal.fire({
      title: 'Actualizando producto...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.productService.updateProduct(this.editingProduct._id!, this.editingProduct).subscribe({
      next: (updated) => {
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'El producto se ha modificado correctamente',
          confirmButtonColor: '#10b981',
          timer: 2000
        });
        const index = this.products.findIndex(p => p._id === updated._id);
        if (index !== -1) this.products[index] = updated;
        this.editingProduct = null;
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el producto',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  deleteProduct(productId: string) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Eliminando...',
          text: 'Por favor espera',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.productService.deleteProduct(productId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El producto ha sido eliminado correctamente',
              confirmButtonColor: '#10b981',
              timer: 2000
            });
            this.products = this.products.filter(p => p._id !== productId);
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el producto',
              confirmButtonColor: '#ef4444'
            });
          }
        });
      }
    });
  }

  cancelEdit() {
    this.editingProduct = null;
  }

  resetNewProductForm() {
    this.newProduct = { 
      nombre: '', 
      descripcion: '', 
      precioInicial: 0, 
      precioActual: 0, 
      categoria: '', 
      vendedorId: this.userProfile?._id || '',
      imagenUrl: '',
      fechaCierre: ''
    };
  }

 
  getActiveAuctions(): number {
    return this.products.filter(p => p.estado === 'activo').length;
  }

  getTotalValue(): number {
    return this.products.reduce((sum, p) => sum + (p.precioActual || p.precioInicial || 0), 0);
  }

  logout() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro que deseas salir?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('userData');
        localStorage.removeItem('currentUser');
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Hasta pronto',
          timer: 1500,
          showConfirmButton: false
        });
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      }
    });
  }
}