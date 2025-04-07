import { Injectable, signal } from "@angular/core";

@Injectable({providedIn: 'root'})
export class ToastManagerService{
    logInMessage = signal<string>('');
    redirectToLogInMessage = signal<string>('');
    logOutMessage = signal<string>('');

    // login to home page
    setLogInMessage(message: string){
        this.logInMessage.set(message);
    }

    resetLogInMessage(){
        this.logInMessage.set('');
    }

    // register to login page
    setRedirectToLoginMessage(message: string){
        this.redirectToLogInMessage.set(message);
    }

    resetRedirectToLoginMessage(){
        this.redirectToLogInMessage.set('');
    }

    // To set logout message
    setLogOutMessage(message: string){
        this.logOutMessage.set(message)
    }

    resetLogOutMessage(){
        this.logOutMessage.set('');
    }

}