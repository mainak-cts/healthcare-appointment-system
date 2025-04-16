import { inject } from "@angular/core";
import { CanMatchFn, Router } from "@angular/router";
import { AuthApiService } from "../../services/authapi.service";
import { ToastManagerService } from "../../services/toastr.service";

export const authGuard: CanMatchFn = (route, segments) =>{
    const router = inject(Router);
    const toastManagerService = inject(ToastManagerService);
    const authService = inject(AuthApiService);

    if(authService.isAuthenticated()){
        return true;
    }

    toastManagerService.setUnauthRedirectToLoginMessage('Please login to access this page');
    router.navigate(["/login"], {replaceUrl: true});
    return false;
}

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

