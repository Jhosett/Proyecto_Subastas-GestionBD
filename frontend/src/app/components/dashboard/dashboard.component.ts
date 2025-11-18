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
  pais: string;
  departamento: string;
  ciudad: string;
  email: string;
  esVendedor: boolean;
  datosVendedor?: {
    tipoActividad: string;
    nombreEmpresa?: string;
    descripcionEmpresa?: string;
    nit: string;
  };
  fechaRegistro: string;
  ultimoLogin?: string;
  ultimoLogout?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
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
    fechaCierre: '',
  };
  editingProduct: Product | null = null;

  showOptions = false;
  selectedProductForBidders: Product | null = null;
  bidders: any[] = [];
  loadingBidders: boolean = false;

  categorias = [
    { nombre: 'Electrónica', icon: 'fa-solid fa-mobile-screen' },
    { nombre: 'Hogar y Jardín', icon: 'fa-solid fa-house' },
    { nombre: 'Moda y Accesorios', icon: 'fa-solid fa-shirt' },
    { nombre: 'Deportes', icon: 'fa-solid fa-football' },
    { nombre: 'Vehículos', icon: 'fa-solid fa-car' },
    { nombre: 'Arte y Antigüedades', icon: 'fa-solid fa-palette' },
    { nombre: 'Otros', icon: 'fa-solid fa-box' },
  ];

  selectCategoria(cat: any) {
    this.newProduct.categoria = cat.nombre;
    this.showOptions = false;
  }

  toggleOptions(event: Event) {
    event.stopPropagation();
    this.showOptions = !this.showOptions;
  }

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
        this.errorMessage =
          'No se encontró información del usuario. Por favor, inicia sesión.';
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
          text: 'No se pudieron cargar los productos',
        });
      },
    });
  }

  createProduct() {
    if (!this.userProfile) return;

    // Validación
    if (
      !this.newProduct.nombre ||
      !this.newProduct.descripcion ||
      !this.newProduct.precioInicial ||
      !this.newProduct.categoria
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos obligatorios',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    const productData: Product = {
      ...this.newProduct,
      vendedorId: this.userProfile._id,
      precioActual: this.newProduct.precioInicial || 0,
    } as Product;

    // Mostrar loading
    Swal.fire({
      title: 'Publicando subasta...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.productService
      .createProduct(productData, this.userProfile._id)
      .subscribe({
        next: (created) => {
          Swal.fire({
            icon: 'success',
            title: '¡Producto Registrado!',
            text: 'Tu producto se ha publicado correctamente en la subasta',
            confirmButtonColor: '#10b981',
            timer: 2000,
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
            confirmButtonColor: '#ef4444',
          });
        },
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
    if (
      !this.editingProduct.nombre ||
      !this.editingProduct.descripcion ||
      !this.editingProduct.precioInicial
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos obligatorios',
        confirmButtonColor: '#3b82f6',
      });
      return;
    }

    Swal.fire({
      title: 'Actualizando producto...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.productService
      .updateProduct(this.editingProduct._id!, this.editingProduct)
      .subscribe({
        next: (updated) => {
          Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: 'El producto se ha modificado correctamente',
            confirmButtonColor: '#10b981',
            timer: 2000,
          });
          const index = this.products.findIndex((p) => p._id === updated._id);
          if (index !== -1) this.products[index] = updated;
          this.editingProduct = null;
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el producto',
            confirmButtonColor: '#ef4444',
          });
        },
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
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Eliminando...',
          text: 'Por favor espera',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        this.productService.deleteProduct(productId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El producto ha sido eliminado correctamente',
              confirmButtonColor: '#10b981',
              timer: 2000,
            });
            this.products = this.products.filter((p) => p._id !== productId);
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar el producto',
              confirmButtonColor: '#ef4444',
            });
          },
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
      precioInicial: undefined,
      precioActual: 0,
      categoria: '',
      vendedorId: this.userProfile?._id || '',
      imagenUrl: '',
      fechaCierre: '',
    };
  }

  getActiveAuctions(): number {
    return this.products.filter((p) => p.estado === 'activo').length;
  }

  getTotalValue(): number {
    return this.products.reduce(
      (sum, p) => sum + (p.precioActual || p.precioInicial || 0),
      0
    );
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
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Record logout timestamp
        if (this.userProfile) {
          this.usersService.logout(this.userProfile._id).subscribe();
        }
        
        localStorage.removeItem('userData');
        localStorage.removeItem('currentUser');
        Swal.fire({
          icon: 'success',
          title: 'Sesión cerrada',
          text: 'Hasta pronto',
          timer: 1500,
          showConfirmButton: false,
        });
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      }
    });
  }

  loadBiddersForProduct(product: Product) {
    this.selectedProductForBidders = product;
    this.loadingBidders = true;
    this.productService.getBids(product._id!).subscribe({
      next: (data) => {
        this.bidders = data;
        this.loadingBidders = false;
      },
      error: (err) => {
        console.error('Error loading bidders:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los pujadores',
        });
        this.loadingBidders = false;
      },
    });
  }

  closeBiddersPanel() {
    this.selectedProductForBidders = null;
    this.bidders = [];
  }

  assignWinner(bidder: any) {
    if (!this.selectedProductForBidders || !this.userProfile) return;

      const buyerName = bidder.nombre || bidder.compradorId || 'Desconocido';
      const buyerEmail = bidder.email || '';

      Swal.fire({
        title: '¿Seleccionar ganador?',
        html: `<p>¿Asignar la subasta a <strong>${buyerName}</strong> (${buyerEmail}) por <strong>$${bidder.valorPuja.toLocaleString()}</strong>?</p>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, asignar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        // Seleccionar método de pago
        Swal.fire({
          title: 'Selecciona método de pago',
          input: 'select',
          inputOptions: {
            Nequi: 'Nequi',
            Bancolombia: 'Bancolombia - Cuenta Corriente',
            PSE: 'PSE - Transferencia Bancaria'
          },
          inputPlaceholder: 'Selecciona un método',
          showCancelButton: true,
          confirmButtonColor: '#10b981',
          cancelButtonColor: '#6b7280',
        }).then((paymentResult) => {
          if (paymentResult.isConfirmed) {
            const paymentMethod = paymentResult.value;
            
            // Solicitar detalles del pago
            Swal.fire({
              title: 'Detalles de pago',
              input: 'text',
              inputPlaceholder: 'Ej: Número de cuenta o instrucciones',
              showCancelButton: true,
              confirmButtonColor: '#10b981',
              cancelButtonColor: '#6b7280',
            }).then((detailsResult) => {
              if (detailsResult.isConfirmed) {
                this.submitAward(bidder, paymentMethod, detailsResult.value);
              }
            });
          }
        });
      }
    });
  }

  submitAward(bidder: any, paymentMethod: string, paymentDetails: string) {
    if (!this.selectedProductForBidders || !this.userProfile) return;

    Swal.fire({
      title: 'Asignando ganador...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

            this.productService
      .award(
        this.selectedProductForBidders._id!,
        this.userProfile._id,
        bidder.compradorId || bidder._id,
        paymentMethod,
        paymentDetails
      )
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Ganador asignado!',
            text: 'Se han enviado notificaciones y correos',
            confirmButtonColor: '#10b981',
            timer: 2000,
          });
          this.closeBiddersPanel();
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error assigning winner:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo asignar el ganador',
            confirmButtonColor: '#ef4444',
          });
        },
      });
  }

  toggleEditPersonalInfo() {
    if (!this.userProfile) return;

    Swal.fire({
      title:
        '<i class="fa-solid fa-user-edit text-blue-600"></i> Editar Información Personal',
      html: `
        <div class="p-4">
          <div class="mb-4">
            <label class="block text-left text-sm font-bold text-gray-700 mb-2"><i class="fa-solid fa-user text-blue-500 mr-2"></i>Nombre Completo</label>
            <input id="nombre" class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" placeholder="Ingresa tu nombre completo" value="${this.userProfile.nombre}">
          </div>
          <div class="mb-4">
            <label class="block text-left text-sm font-bold text-gray-700 mb-2"><i class="fa-solid fa-envelope text-blue-500 mr-2"></i>Correo Electrónico</label>
            <input id="email" type="email" class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" placeholder="correo@ejemplo.com" value="${this.userProfile.email}">
          </div>
          <div class="mb-4">
            <label class="block text-left text-sm font-bold text-gray-700 mb-2"><i class="fa-solid fa-phone text-blue-500 mr-2"></i>Teléfono</label>
            <input id="telefono" class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" placeholder="Ej: +57 300 123 4567" value="${this.userProfile.telefono}">
          </div>
          <div class="mb-4">
            <label class="block text-left text-sm font-bold text-gray-700 mb-2"><i class="fa-solid fa-map-marker-alt text-blue-500 mr-2"></i>Dirección</label>
            <input id="direccion" class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" placeholder="Ingresa tu dirección completa" value="${this.userProfile.direccion}">
          </div>
          <div class="mb-4">
            <label class="block text-left text-sm font-bold text-gray-700 mb-2"><i class="fa-solid fa-globe text-blue-500 mr-2"></i>País</label>
            <input id="pais" class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" placeholder="Ingresa tu país" value="${this.userProfile.pais}">
          </div>
          <div class="mb-4">
            <label class="block text-left text-sm font-bold text-gray-700 mb-2"><i class="fa-solid fa-map text-blue-500 mr-2"></i>Departamento</label>
            <input id="departamento" class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" placeholder="Ingresa tu departamento" value="${this.userProfile.departamento}">
          </div>
          <div class="mb-4">
            <label class="block text-left text-sm font-bold text-gray-700 mb-2"><i class="fa-solid fa-city text-blue-500 mr-2"></i>Ciudad</label>
            <input id="ciudad" class="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none transition-colors" placeholder="Ingresa tu ciudad" value="${this.userProfile.ciudad}">
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: '<i class="fa-solid fa-save mr-2"></i>Guardar Cambios',
      cancelButtonText: '<i class="fa-solid fa-times mr-2"></i>Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      buttonsStyling: false,
      customClass: {
        confirmButton:
          'px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors mr-3',
        cancelButton:
          'px-6 py-3 bg-gray-500 text-white font-bold rounded-xl hover:bg-gray-600 transition-colors',
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-2xl font-bold text-gray-800 mb-4',
      },
      width: '500px',
      preConfirm: () => {
        const nombre = (document.getElementById('nombre') as HTMLInputElement)
          .value;
        const email = (document.getElementById('email') as HTMLInputElement)
          .value;
        const telefono = (
          document.getElementById('telefono') as HTMLInputElement
        ).value;
        const direccion = (
          document.getElementById('direccion') as HTMLInputElement
        ).value;
        const pais = (document.getElementById('pais') as HTMLInputElement)
          .value;
        const departamento = (
          document.getElementById('departamento') as HTMLInputElement
        ).value;
        const ciudad = (document.getElementById('ciudad') as HTMLInputElement)
          .value;

        if (
          !nombre ||
          !email ||
          !telefono ||
          !direccion ||
          !pais ||
          !departamento ||
          !ciudad
        ) {
          Swal.showValidationMessage(
            '<i class="fa-solid fa-exclamation-triangle text-red-500 mr-2"></i>Todos los campos son obligatorios'
          );
          return false;
        }

        return {
          nombre,
          email,
          telefono,
          direccion,
          pais,
          departamento,
          ciudad,
        };
      },
    }).then((result) => {
      if (result.isConfirmed && this.userProfile) {
        this.savePersonalInfo(result.value);
      }
    });
  }

  savePersonalInfo(data: any) {
    if (!this.userProfile) return;

    Swal.fire({
      title: 'Actualizando información...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const updatedProfile = { ...this.userProfile, ...data };

    this.usersService
      .updateProfile(this.userProfile._id, updatedProfile)
      .subscribe({
        next: (updated) => {
          this.userProfile = updated;
          localStorage.setItem('userData', JSON.stringify(updated));
          Swal.fire({
            icon: 'success',
            title: '¡Información actualizada!',
            timer: 2000,
          });
        },
        error: () => {
          Swal.fire({
            icon: 'error',
            title: 'Error al actualizar',
          });
        },
      });
  }

  getActiveTime(): string {
    if (!this.userProfile?.ultimoLogin) return 'No disponible';
    
    const loginTime = new Date(this.userProfile.ultimoLogin);
    const logoutTime = this.userProfile.ultimoLogout ? new Date(this.userProfile.ultimoLogout) : new Date();
    
    const diffMs = logoutTime.getTime() - loginTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  }
}
