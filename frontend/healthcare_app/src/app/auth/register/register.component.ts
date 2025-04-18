import { Component, inject, signal } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApiService } from '../../../services/authapi.service';
import { RegisterData } from '../../models/RegisterData';
import { ToastrService } from 'ngx-toastr';
import { ToastManagerService } from '../../../services/toastr.service';
import { Router, RouterLink } from '@angular/router';
import { ValidationService } from '../../../services/validation.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule, MatProgressSpinnerModule, MatSelectModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  isLoading = signal(false);
  hidePassword = signal(true);
  confirmHidePassword = signal(true);

  authService = inject(AuthApiService);
  toastr = inject(ToastrService);
  toastManagerService = inject(ToastManagerService);
  validationService = inject(ValidationService);
  route = inject(Router);

  // Form to submit user data for registration
  form = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required, Validators.minLength(2), this.validationService.noWhiteSpaceMinLengthValidator(2)]
    }),
    email: new FormControl('', {
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(20), this.validationService.noWhiteSpaceMinLengthValidator(8), Validators.pattern("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@#$%^&+=!])[A-Za-z\\d@#$%^&+=!]{8,20}$")]
    }),
    confirm_password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(20)]
    }),
    role: new FormControl('', {
      validators: [Validators.required]
    }),
    phone: new FormControl('', {
      validators: [Validators.required, Validators.pattern("\\d{10}")]
    })
  })

  // Getters to check the inputs are valid or not (To show error message in DOM)
  get isNameInvalid(){
    return this.form.controls.name.touched && this.form.controls.name.invalid;
  }
  get isEmailInvalid(){
    return this.form.controls.email.touched && this.form.controls.email.invalid;
  }
  get isPasswordInvalid(){
    return this.form.controls.password.touched && this.form.controls.password.invalid;
  }
  get isRoleInvalid(){
    return this.form.controls.role.touched && this.form.controls.role.invalid;
  }
  get isPhoneInvalid(){
    return this.form.controls.phone.touched && this.form.controls.phone.invalid;
  }

  get isConfirmPasswordInvalid(){
    if(this.form.controls.password.touched && this.form.controls.confirm_password.touched){
      return this.form.controls.password!.value !== this.form.controls.confirm_password!.value;
    }
    return false;
  }

  // Submit registration form
  async onSubmit(){
    this.form.markAllAsTouched()
    if(this.form.valid && !this.isConfirmPasswordInvalid){
      this.isLoading.set(true);

      // Request body to be sent
      const registerData: RegisterData = {
        name: this.form.controls.name.value!.trim(),
        email: this.form.controls.email.value!.trim().toLowerCase(),
        password: this.form.controls.password.value!.trim(),
        role: this.form.controls.role.value!,
        phone: this.form.controls.phone.value!,
      }

      try{
        // Make the API call
        const res = await this.authService.registerUser(registerData);

        // If API call succeeds, show success notification
        this.toastManagerService.setRedirectToLoginMessage(`Hi, ${res.name}, please log in with your credentials`)
        this.toastManagerService.setLogInMessage(`Hi, ${res.name}, welcome to our app!`)
        this.route.navigate(["/login"]);

      }catch(err: any){
        // If API call fails, show error notification
        if(err.error.error){
          let errorMsg = '';
          for(let errKey in err.error){
            if(errKey != 'error' && errKey != 'statusCode'){
              errorMsg += `${err.error[errKey]}\n`
            }
          }
          this.toastr.error(errorMsg, err.error.error)
        }else{
          this.toastr.error("Something went wrong, please try again later", "Error")
        }
      }finally{
        this.isLoading.set(false);
      }
    }
  }

  // Show/hide password & confirm password
  togglePasswordShow(event: MouseEvent) {
    this.hidePassword.set(!this.hidePassword());
    event.stopPropagation();
  }
  toggleConfirmPasswordShow(event: MouseEvent) {
    this.confirmHidePassword.set(!this.confirmHidePassword());
    event.stopPropagation();
  }
}
