import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

// Productos
import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { ProductFormComponent } from './components/product-form/product-form.component';

export const routes: Routes = [
  // 📌 Rutas principales (MainLayout)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'dashboard', component: DashboardComponent },

      // Productos
      { path: 'products', component: ProductListComponent },
      { path: 'products/card', component: ProductCardComponent }, 
      { path: 'products/:id', component: ProductDetailComponent },
      { path: 'products/form/new', component: ProductFormComponent },
      { path: 'products/form/:id', component: ProductFormComponent }, 
    ]
  },

  // 📌 Rutas de login y registro (AuthLayout)
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'register', component: RegisterComponent },
      { path: 'login', component: LoginComponent }
    ]
  },

  // Ruta comodín
  { path: '**', redirectTo: '' }
];
