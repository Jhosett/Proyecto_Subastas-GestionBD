import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PqrsService, PQRS } from '../../services/pqrs.service';
import { ProductService } from '../../services/product.service';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent implements OnInit {
  notifications: PQRS[] = [];
  loading = true;
  products: any[] = [];
  users: any[] = [];

  private pqrsService = inject(PqrsService);
  private productService = inject(ProductService);
  private usersService = inject(UsersService);

  ngOnInit() {
    this.loadNotifications();
    this.loadProducts();
    this.loadUsers();
  }

  loadNotifications() {
    this.loading = true;
    this.pqrsService.getUserNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.loading = false;
      }
    });
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
        this.users = response.users || response;
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  getProductName(productId: string): string {
    const product = this.products.find(p => p._id === productId);
    return product ? product.nombre : 'Producto no encontrado';
  }

  getSenderName(userId: string): string {
    const user = this.users.find(u => u._id === userId || u.userId === userId);
    return user ? user.nombre : 'Usuario no encontrado';
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'peticion': 'Petición',
      'queja': 'Queja',
      'reclamo': 'Reclamo',
      'sugerencia': 'Sugerencia'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En Proceso',
      'resuelto': 'Resuelto',
      'cerrado': 'Cerrado'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pendiente': 'status-pending',
      'en_proceso': 'status-processing',
      'resuelto': 'status-resolved',
      'cerrado': 'status-closed'
    };
    return classes[status] || 'status-pending';
  }

  getTypeClass(type: string): string {
    const classes: { [key: string]: string } = {
      'peticion': 'type-petition',
      'queja': 'type-complaint',
      'reclamo': 'type-claim',
      'sugerencia': 'type-suggestion'
    };
    return classes[type] || 'type-petition';
  }
}
