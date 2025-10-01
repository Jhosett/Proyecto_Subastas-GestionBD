// dashboard.component.ts
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

  // 🔹 Productos del vendedor
  products: Product[] = [];
  newProduct: Partial<Product> = {
    nombre: '',
    descripcion: '',
    precioInicial: 0,
    precioActual: 0,
    categoria: '',
    vendedorId: ''
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
          window.location.href = '/login';
        }, 2000);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.errorMessage = 'Error al cargar el perfil del usuario.';
      this.isLoading = false;
    }
  }

  // 🔹 Cargar productos del vendedor
  loadProducts() {
    if (!this.userProfile) return;
    this.productService.getProductsBySeller(this.userProfile._id).subscribe({
      next: (data) => {
        this.products = data;
      },
      error: (err) => {
        console.error('Error cargando productos:', err);
      }
    });
  }

  // 🔹 Crear nuevo producto
  createProduct() {
    if (!this.userProfile) return;

    const productData: Product = {
      ...this.newProduct,
      vendedorId: this.userProfile._id,
      precioActual: this.newProduct.precioInicial || 0
    } as Product;

    // ✅ Pasar sellerId como segundo argumento
    this.productService.createProduct(productData, this.userProfile._id).subscribe({
      next: (created) => {
        Swal.fire('Producto registrado', 'Tu producto se ha registrado correctamente.', 'success');
        this.products.push(created);
        this.newProduct = { 
          nombre: '', 
          descripcion: '', 
          precioInicial: 0, 
          precioActual: 0, 
          categoria: '', 
          vendedorId: this.userProfile?._id || ''
        };
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo registrar el producto.', 'error');
      }
    });
  }

  // 🔹 Editar producto
  editProduct(product: Product) {
    this.editingProduct = { ...product };
  }

  updateProduct() {
    if (!this.editingProduct) return;
    this.productService.updateProduct(this.editingProduct._id!, this.editingProduct).subscribe({
      next: (updated) => {
        Swal.fire('Producto actualizado', 'El producto se ha modificado correctamente.', 'success');
        const index = this.products.findIndex(p => p._id === updated._id);
        if (index !== -1) this.products[index] = updated;
        this.editingProduct = null;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'No se pudo actualizar el producto.', 'error');
      }
    });
  }

  cancelEdit() {
    this.editingProduct = null;
  }

  // 🔹 Logout
  logout() {
    localStorage.removeItem('userData');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/']);
  }
}