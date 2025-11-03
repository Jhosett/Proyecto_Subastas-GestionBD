import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService } from '../../services/users.service';

@Component({
  selector: 'app-admin-profile',
  imports: [CommonModule],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css'
})
export class AdminProfileComponent implements OnInit, OnDestroy {
  users: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  private refreshInterval: any;

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
    console.log('Loading users...');
    this.usersService.getAllUsers().subscribe({
      next: (response) => {
        console.log('Users response:', response);
        this.users = response.users || response;
        console.log('Users loaded:', this.users);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = `Error: ${error.status} - ${error.message || 'No se pudieron cargar los usuarios'}`;
        this.isLoading = false;
      }
    });
  }

  getRoleText(user: any): string {
    if (user.isAdmin) return 'Administrador';
    if (user.esVendedor) return 'Vendedor';
    return 'Comprador';
  }
}
