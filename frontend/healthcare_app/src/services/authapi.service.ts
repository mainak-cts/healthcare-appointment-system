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
    private API_URL = BASE_URLS.USER_BASE_URL;

    private httpClient: HttpClient = inject(HttpClient);
    private route = inject(Router);

    private userSubject = new BehaviorSubject<User | null>(null);
    user$ =  this.userSubject.asObservable();

    // Fetch currently logged in user details, when page is reloaded
    constructor(){
        this.getUserDetails();
    }

    // Login a user
    // POST http://localhost:9090/users/login
    // To show the loading spinner, while waiting for the API response, made it async/await
    async logInUser(data: LogInData){
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const response =  this.httpClient.post<{email: string, userId: string, jwtToken: string}>(this.API_URL + '/login', data, {headers});

        return firstValueFrom(response);
    }

    // Register a new user
    // POST http://localhost:9090/users
    // To show the loading spinner, while waiting for the API response, made it async/await
    registerUser(data: RegisterData){
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        const response = this.httpClient.post<User>(this.API_URL + '/register', data, {headers})

        return firstValueFrom(response);
    }

    // Save the JWT token in the localStorage and fetch the currently logged in user details
    handleLogIn(jwtToken: string){
        this.saveJwtToken(jwtToken);
        this.getUserDetails();
    }

    // Fetch the currently logged in user details
    // GET http://localhost:9090/users/email/{email}
    getUserDetails(){
        // Get the JWT
        const token = this.getToken();
        if(!token){
            return;
        }

        // Get the email from the JWT
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

    // Get an user by id
    // GET http://localhost:9090/users/{id}
    getUserById(id: string){
        const token = this.getToken();
        if(!token){
            this.route.navigate(["/home"]);
            return;
        }

        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });

        return this.httpClient.get<User>(`${this.API_URL}/${id}`, {headers});
    }

    // Save the JWT token in localStorage
    saveJwtToken(token: string){
        localStorage.setItem('healthCareToken$', token);
    }

    // Fetch email from JWT
    getEmailFromToken(): string | null{
        // Get the JWT
        const token = this.getToken();
        if(token != null){
            // JWT => <header>.<payload>.<signature>
           const payload = JSON.parse(atob(token.split(".")[1]));   // fetching the payload part and then decoding it from the base64 format
           return payload?.sub;  // return email
        }else{
            return null;
        }
    }

    // Remove JWT from localStorage
    removeJwtToken(){
        localStorage.removeItem('healthCareToken$');
    }

    // Get JWT from localStorage
    getToken(){
        return localStorage.getItem('healthCareToken$');
    }

    // Logout the user
    logOutUser(){
        this.removeJwtToken();
        this.userSubject.next(null);
        this.route.navigate(["/login"], {replaceUrl: true})
    }

    // Check if the user is authenticated
    isAuthenticated(){
        return !!this.getToken();
    }

}