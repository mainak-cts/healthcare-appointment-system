import { Injectable, signal } from "@angular/core";

// For cross component notifications
@Injectable({providedIn: 'root'})
export class ToastManagerService{
    logInMessage = signal<string>('');
    redirectToLogInMessage = signal<string>('');
    logOutMessage = signal<string>('');
    unauthRedirectToLoginMessage = signal<string>('');

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

    // To set/reset logout message
    setLogOutMessage(message: string){
        this.logOutMessage.set(message)
    }

    resetLogOutMessage(){
        this.logOutMessage.set('');
    }

    // To set/reset unauth redirect to login message
    setUnauthRedirectToLoginMessage(message: string){
        this.unauthRedirectToLoginMessage.set(message);
    }
    resetUnauthRedirectToLoginMessage(){
        this.unauthRedirectToLoginMessage.set('');
    }

}