import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { PqrsFormComponent } from './components/pqrs-form/pqrs-form.component';


import { ProductListComponent } from './components/product-list/product-list.component';
import { ProductCardComponent } from './components/product-card/product-card.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.seller.component';
import { ProductFormComponent } from './components/product-form/product-form.component';
import { AdminProfileComponent } from './components/admin-profile/admin-profile.component';
import { PqrsLayoutComponent } from './layouts/pqrs-layout/pqrs-layout.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { ForumComponent } from './components/forum/forum.component';

export const routes: Routes = [
  
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'admin-profile', component: AdminProfileComponent },
      {path: 'notifications', component: NotificationsComponent},
      { path: 'forum', component: ForumComponent },


     
      { path: 'products', component: ProductListComponent },
      { path: 'products/card', component: ProductCardComponent }, 
      { path: 'products/:id', component: ProductDetailComponent },
      { path: 'products/form/new', component: ProductFormComponent },
      { path: 'products/form/:id', component: ProductFormComponent }, 
    ]
  },


  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'register', component: RegisterComponent },
      { path: 'login', component: LoginComponent }
    ]
  },

  {
    path: '',
    component: PqrsLayoutComponent,
    children: [
      { path: 'pqrs', component: PqrsFormComponent }
    ]
  },

  { path: '**', redirectTo: '' }
];
