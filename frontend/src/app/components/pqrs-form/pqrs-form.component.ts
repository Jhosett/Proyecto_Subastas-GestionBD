import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService, Product } from '../../services/product.service';
import { UsersService } from '../../services/users.service';
import { PqrsService, PQRSData } from '../../services/pqrs.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pqrs-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './pqrs-form.component.html',
  styleUrl: './pqrs-form.component.css'
})
export class PqrsFormComponent implements OnInit {
  pqrsData = {
    type: '',
    subject: '',
    description: '',
    productId: '',
    relatedUser: '',
    isAnonymous: false
  };

  products: Product[] = [];
  users: any[] = [];
  isSubmitting = false;
  private productService = inject(ProductService);
  private usersService = inject(UsersService);
  private pqrsService = inject(PqrsService);

  requestTypes = [
    { value: 'peticion', label: 'Petición' },
    { value: 'queja', label: 'Queja' },
    { value: 'reclamo', label: 'Reclamo' },
    { value: 'sugerencia', label: 'Sugerencia' }
  ];

  onSubmit() {
    if (!this.isFormValid()) {
      Swal.fire({
        title: 'Campos incompletos',
        text: 'Por favor completa todos los campos obligatorios',
        icon: 'warning',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    this.isSubmitting = true;

    const pqrsData: PQRSData = {
      type: this.pqrsData.type as any,
      subject: this.pqrsData.subject,
      description: this.pqrsData.description,
      productId: this.pqrsData.productId || undefined,
      relatedUserId: this.pqrsData.relatedUser || undefined,
      isAnonymous: this.pqrsData.isAnonymous
    };

    this.pqrsService.createPQRS(pqrsData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        Swal.fire({
          title: '¡PQRS Enviado!',
          text: 'Tu solicitud ha sido enviada correctamente. Te contactaremos pronto.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        }).then(() => {
          this.resetForm();
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error sending PQRS:', error);
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema al enviar tu solicitud. Intenta de nuevo.',
          icon: 'error',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  resetForm() {
    this.pqrsData = {
      type: '',
      subject: '',
      description: '',
      productId: '',
      relatedUser: '',
      isAnonymous: false
    };
  }

  isFormValid(): boolean {
    return !!(this.pqrsData.type && this.pqrsData.subject && this.pqrsData.description);
  }

  private router = inject(Router);

  ngOnInit() {
    this.loadProducts();
    this.loadUsers();
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  loadUsers() {
    this.usersService.getAllUsers().subscribe({
      next: (response) => {
        const allUsers = response.users || response;
        // Remove duplicates based on userId or _id
        const uniqueUsers = allUsers.filter((user: any, index: number, self: any[]) => 
          index === self.findIndex((u: any) => (u.userId || u._id) === (user.userId || user._id))
        );
        this.users = uniqueUsers;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  getSellerName(vendedorId: string): string {
    const seller = this.users.find(user => user.userId === vendedorId || user._id === vendedorId);
    return seller ? seller.nombre : 'Vendedor no encontrado';
  }

  getUserRole(user: any): string {
    if (user.isAdmin) return 'Administrador';
    if (user.esVendedor || user.rol === 'Vendedor') return 'Vendedor';
    return 'Comprador';
  }

  onProductChange() {
    if (this.pqrsData.productId) {
      this.pqrsData.relatedUser = '';
    }
  }

  onUserChange() {
    if (this.pqrsData.relatedUser) {
      this.pqrsData.productId = '';
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
