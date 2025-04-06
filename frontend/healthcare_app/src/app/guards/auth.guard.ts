import { inject } from "@angular/core";
import { CanMatchFn, Router } from "@angular/router";
import { AuthApiService } from "../../services/authapi.service";

export const authGuard: CanMatchFn = (route, segments) =>{
    const router = inject(Router);
    const authService = inject(AuthApiService);

    if(authService.isAuthenticated()){
        return true;
    }
    router.navigate(["/login"]);
    return false;
}

