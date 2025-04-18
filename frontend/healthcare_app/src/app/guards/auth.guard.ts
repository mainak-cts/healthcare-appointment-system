import { inject } from "@angular/core";
import { CanMatchFn, Router } from "@angular/router";
import { AuthApiService } from "../../services/authapi.service";
import { ToastManagerService } from "../../services/toastr.service";

// To prevent unauthenticated user access any secured route
export const authGuard: CanMatchFn = (route, segments) =>{
    const router = inject(Router);
    const toastManagerService = inject(ToastManagerService);
    const authService = inject(AuthApiService);

    // If authenticated, access
    if(authService.isAuthenticated()){
        return true;
    }

    // If not, redirect to 'login' page
    toastManagerService.setUnauthRedirectToLoginMessage('Please login to access this page');
    router.navigate(["/login"], {replaceUrl: true});
    return false;
}

// To prevent authenticated user to access '/forgot-password' route
export const forgotPasswordGuard: CanMatchFn = (route, segments) =>{
    const router = inject(Router);
    const authService = inject(AuthApiService);

    // If user is not logged in, then only access '/forgot-password'
    if(!authService.isAuthenticated()){
        return true;
    }
    router.navigate(["/home"], {replaceUrl: true});
    return false;
}

