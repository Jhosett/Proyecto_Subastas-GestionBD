import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginComponent } from './components/auth/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
    //Ruta para la página principal y secundarias
    {
        path: '', component: MainLayoutComponent,
        children: [
            { path: '', component: HomeComponent },
            { path: 'dashboard', component: DashboardComponent}
        ]
    },
    //Ruta apartado de login y registro
    {
        path: '', component: AuthLayoutComponent, 
        children: [
            { path: 'register', component: RegisterComponent },
            { path: 'login', component: LoginComponent}
        ]
    },
    { path: '**', redirectTo: '' }
];
