import { Component, effect, inject, OnInit, signal } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApiService } from '../../../services/authapi.service';
import { LogInData } from '../../models/LogInData';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ToastManagerService } from '../../../services/toastr.service';
import { ValidationService } from '../../../services/validation.service';

@Component({
  selector: 'app-login',
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule, MatProgressSpinnerModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  authService:AuthApiService = inject(AuthApiService);
  route = inject(Router);
  isLoading = signal(false);
  hide = signal(true);

  toastr = inject(ToastrService);
  toastManagerService = inject(ToastManagerService);
  validationService = inject(ValidationService);

  // For cross component notifications
  ngOnInit(): void {
    if(this.toastManagerService.redirectToLogInMessage() != ''){
      this.toastr.success(this.toastManagerService.redirectToLogInMessage(), "Login")
      this.toastManagerService.resetRedirectToLoginMessage();
    }
    if(this.toastManagerService.logOutMessage() != ''){
      this.toastr.success(this.toastManagerService.logOutMessage(), "Logout")
      this.toastManagerService.resetLogOutMessage();
    }
    if(this.toastManagerService.unauthRedirectToLoginMessage() != ''){
      this.toastr.warning(this.toastManagerService.unauthRedirectToLoginMessage(), 'Login');
      this.toastManagerService.resetUnauthRedirectToLoginMessage();
    }
  }

  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(20), this.validationService.noWhiteSpaceMinLengthValidator(8)]
    })
  })

  get isEmailInvalid(){
    return this.form.controls.email.touched && this.form.controls.email.invalid;
  }
  get isPasswordInvalid(){
    return this.form.controls.password.touched && this.form.controls.password.invalid;
  }

  async onSubmit(){
    if(this.form.valid){
      this.isLoading.set(true);
      const body:LogInData = {
        email: this.form.controls.email.value!.trim().toLowerCase(),
        password: this.form.controls.password.value!.trim()
      }

      try{
        const data = await this.authService.logInUser(body);
        this.authService.handleLogIn(data.jwtToken);
        this.form.reset();
        // While registering, setting welcome message differently, if not set, set from here
        if(this.toastManagerService.logInMessage() == ''){
          this.toastManagerService.setLogInMessage("Welcome back, " + data.email);
        }
        this.route.navigate(["/home"], {replaceUrl: true})
      }catch(err: any){
          // If server is not running, sending meaningful error message
          if(err.error.message){
            this.toastr.error(err.error.message, err.error.error);
          }else{
            this.toastr.error("Something went wrong, please try again later", "Error")
          }
      }finally{
        this.isLoading.set(false);
      }
    }
  }

  togglePasswordShow(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}
