import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AvailabilitiesComponent } from './availabilities/availabilities.component';
import { authGuard } from './guards/auth.guard';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },
    {
        path: 'home',
        component: HomeComponent,
        title: 'Home'
    },
    {
        path: 'availabilitites',
        component: AvailabilitiesComponent,
        canMatch: [authGuard],
        title: 'Availabilities'
    },
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login'
    },
    {
        path: 'register',
        component: RegisterComponent,
        title: 'Register'
    },
    {
        path: 'users/:userId',
        component: ProfileComponent,
        canMatch: [authGuard],
        title: 'Profile'
    },
    {
        path: '**',
        component: PagenotfoundComponent,
        title: "404 - Page Not Found"
    }

];
