import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { AuthApiService } from "./authapi.service";
import { UserData } from "../app/models/UserData";
import { User } from "../app/models/User";
import { BASE_URLS } from "../environment/environment";
import { ChangeUserPassword } from "../app/models/ChnageUserPassword";
import { firstValueFrom } from "rxjs";

@Injectable({providedIn: 'root'})
export class UserApiService{
    private BASE_URL = BASE_URLS.USER_BASE_URL;
    private httpClient = inject(HttpClient);
    private authService = inject(AuthApiService);

    editUserProfile(data: UserData){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });
        return this.httpClient.put<User>(
            `${this.BASE_URL}`,
            data,
            {
                headers: authHeader
            }
        )
    }

    deleteUserById(id: string){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });
        return this.httpClient.delete<User>(
            `${this.BASE_URL}/${id}`,
            {
                headers: authHeader
            }
        )
    }

    changeUserPassword(data: ChangeUserPassword){
        const response = this.httpClient.put<User>(
            `${this.BASE_URL}/change-password`,
            data
        )

        return firstValueFrom(response);
    }
}