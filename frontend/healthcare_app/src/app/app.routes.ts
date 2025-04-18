import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './profile/profile.component';
import { AvailabilitiesComponent } from './availabilities/availabilities.component';
import { authGuard, forgotPasswordGuard } from './guards/auth.guard';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';

// Routes for our app
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
        path: 'forgot-password',
        component: ChangepasswordComponent,
        canMatch: [forgotPasswordGuard],
        title: "Forgot password"
    },
    {
        path: '**',
        component: PagenotfoundComponent,
        title: "404 - Page Not Found"
    }

];
