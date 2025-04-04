import { inject, Injectable } from "@angular/core";
import { LogInData } from "../app/models/LogInData";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Route, Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { RegisterData } from "../app/models/RegisterData";

@Injectable({providedIn: 'root'})
export class AuthApiService{
    private httpClient: HttpClient = inject(HttpClient);
    private API_URL = "http://localhost:9090/api/users"
    private route = inject(Router);
    private userSubject = new BehaviorSubject<any>(null);
    user$ =  this.userSubject.asObservable();

    constructor(){
        this.getUserDetails();
    }

    logInUser(data: LogInData){
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.httpClient.post<{email: string, userId: string, jwtToken: string}>(this.API_URL + '/login', data, {headers})
    }

    registerUser(data: RegisterData){
        const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        return this.httpClient.post<any>(this.API_URL + '/register', data, {headers})
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

        this.httpClient.get(`${this.API_URL}/email/${email}`, {headers}).subscribe({
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

        return this.httpClient.get(`${this.API_URL}/${id}`, {headers});
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