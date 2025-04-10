import { inject, Injectable } from "@angular/core";
import { LogInData } from "../app/models/LogInData";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { BehaviorSubject, firstValueFrom } from "rxjs";
import { RegisterData } from "../app/models/RegisterData";
import { User } from "../app/models/User";
import { BASE_URLS } from "../environment/environment";

@Injectable({providedIn: 'root'})
export class AuthApiService{
    private httpClient: HttpClient = inject(HttpClient);
    private API_URL = BASE_URLS.USER_BASE_URL;
    private route = inject(Router);
    private userSubject = new BehaviorSubject<User | null>(null);
    user$ =  this.userSubject.asObservable();

    constructor(){
        this.getUserDetails();
    }

    // To show the loading spinner, while waiting for the API response, made it async/await
    async logInUser(data: LogInData){
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const response =  this.httpClient.post<{email: string, userId: string, jwtToken: string}>(this.API_URL + '/login', data, {headers});

        return firstValueFrom(response);
    }

     // To show the loading spinner, while waiting for the API response, made it async/await
    registerUser(data: RegisterData){
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const response = this.httpClient.post<User>(this.API_URL + '/register', data, {headers})

        return firstValueFrom(response);
    }

    handleLogIn(jwtToken: string){
        this.saveJwtToken(jwtToken);
        this.getUserDetails();
    }

    getUserDetails(){
        const token = this.getToken();
        if(!token){
            return;
        }
        const email = this.getEmailFromToken();
        if(!email){
            return;
        }

        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

        this.httpClient.get<User>(`${this.API_URL}/email/${email}`, {headers}).subscribe({
            next: (user) => {
                this.userSubject.next(user)
            },
            error: (err) => {
                console.log(err)
                this.logOutUser()
            }
        })

    }

    getUserById(id: string){
        const token = this.getToken();
        if(!token){
            this.route.navigate(["/home"]);
            return;
        }

        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

        return this.httpClient.get<User>(`${this.API_URL}/${id}`, {headers});
    }

    saveJwtToken(token: string){
        localStorage.setItem('healthCareToken$', token);
    }

    getEmailFromToken(): string | null{
        const token = this.getToken();
        if(token != null){
           const payload = JSON.parse(atob(token.split(".")[1]));
           console.log("Inside service: " + payload)
           return payload.sub;
        }else{
            return null;
        }
    }

    removeJwtToken(){
        localStorage.removeItem('healthCareToken$');
    }

    getToken(){
        return localStorage.getItem('healthCareToken$');
    }

    logOutUser(){
        this.removeJwtToken();
        this.userSubject.next(null);
        this.route.navigate(["/login"], {replaceUrl: true})
    }

    isAuthenticated(){
        return !!this.getToken();
    }

}