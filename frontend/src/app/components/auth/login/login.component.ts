import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  showPassword: boolean = false;
  rememberMe: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  
  loginData = {
    email: '',
    password: ''
  };

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  isFormValid(): boolean {
    return !!(this.loginData.email && this.loginData.password);
  }

  onSubmit() {
    if (this.isFormValid()) {
      this.isLoading = true;
      this.errorMessage = '';
      // Implement login logic here
      console.log('Login attempt:', this.loginData);
      
      // Simulate API call
      setTimeout(() => {
        this.isLoading = false;
        // Handle success or error
      }, 2000);
    }
  }
}
