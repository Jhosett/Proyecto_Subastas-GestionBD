import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-admin-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css'
})
export class AdminProfileComponent implements OnInit, OnDestroy {
  users: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  private refreshInterval: any;

  // Filter properties
  filters = {
    pais: '',
    rol: '',
    desde: '',
    hasta: '',
    search: ''
  };

  constructor(private usersService: UsersService) {}

  ngOnInit() {
    this.loadUsers();
    // Auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadUsers();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadUsers() {
    this.isLoading = true;
    this.errorMessage = '';
    
    const params = new URLSearchParams();
    if (this.filters.pais) params.append('pais', this.filters.pais);
    if (this.filters.rol) params.append('rol', this.filters.rol);
    if (this.filters.desde) params.append('desde', this.filters.desde);
    if (this.filters.hasta) params.append('hasta', this.filters.hasta);
    if (this.filters.search) params.append('search', this.filters.search);
    
    const queryString = params.toString();
    const url = queryString ? `/users?${queryString}` : '/users';
    
    this.usersService.getUsersWithFilters(url).subscribe({
      next: (response) => {
        this.users = response.users || response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = `Error: ${error.status} - ${error.message || 'No se pudieron cargar los usuarios'}`;
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    this.loadUsers();
  }

  clearFilters() {
    this.filters = {
      pais: '',
      rol: '',
      desde: '',
      hasta: '',
      search: ''
    };
    this.loadUsers();
  }

  getRoleText(user: any): string {
    return user.rol || 'Comprador';
  }

  getUniqueUsers(): number {
    const uniqueUserIds = new Set(this.users.map(user => user.userId));
    return uniqueUserIds.size;
  }

  getAdminCount(): number {
    const uniqueAdmins = new Set(
      this.users.filter(user => user.rol === 'Administrador').map(user => user.userId)
    );
    return uniqueAdmins.size;
  }

  getSellerCount(): number {
    const uniqueSellers = new Set(
      this.users.filter(user => user.rol === 'Vendedor').map(user => user.userId)
    );
    return uniqueSellers.size;
  }

  getActiveSessionsCount(): number {
    return this.users.filter(user => user.sessionActive).length;
  }
}
