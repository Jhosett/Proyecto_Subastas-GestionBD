import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';

export const routes: Routes = [
    {
        path: '', component: MainLayoutComponent,
        children: [
            { path: '', component: HomeComponent }
        ]
    },
    {
        path: '', component: AuthLayoutComponent, 
        children: [
            { path: 'register', component: RegisterComponent }
        ]
    },
    { path: '**', redirectTo: '' }
];
