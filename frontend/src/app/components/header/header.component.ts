import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from "@angular/router";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  username = '';
  showUserMenu = false;
  private checkInterval: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.checkLoginStatus();
    // Check login status every second
    this.checkInterval = setInterval(() => {
      this.checkLoginStatus();
    }, 1000);
    
    // Also check when window gains focus
    window.addEventListener('focus', () => this.checkLoginStatus());
  }

  ngOnDestroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  checkLoginStatus() {
    const userData = localStorage.getItem('userData');
    const wasLoggedIn = this.isLoggedIn;
    
    if (userData) {
      const user = JSON.parse(userData);
      this.isLoggedIn = true;
      this.username = user.nombre || user.username;
    } else {
      this.isLoggedIn = false;
      this.username = '';
      this.showUserMenu = false;
    }
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
  }

  logout() {
    localStorage.removeItem('userData');
    this.isLoggedIn = false;
    this.username = '';
    this.showUserMenu = false;
    this.router.navigate(['/']);
  }
}
