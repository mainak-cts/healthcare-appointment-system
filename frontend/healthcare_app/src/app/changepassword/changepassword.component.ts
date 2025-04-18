import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ToastManagerService } from '../../services/toastr.service';
import { ValidationService } from '../../services/validation.service';
import { ChangeUserPassword } from '../models/ChnageUserPassword';
import { UserApiService } from '../../services/userapi.service';

@Component({
  selector: 'app-changepassword',
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './changepassword.component.html',
  styleUrl: './changepassword.component.css'
})
export class ChangepasswordComponent {
  hidePassword = signal(true);
  confirmHidePassword = signal(true);
  isLoading = signal(false);
  
  route = inject(Router);
  toastr = inject(ToastrService);
  userService = inject(UserApiService);
  toastManagerService = inject(ToastManagerService);
  validatorService = inject(ValidationService);

  // Change password form
  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(20), Validators.pattern("^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@#$%^&+=!])[A-Za-z\\d@#$%^&+=!]{8,20}$"), this.validatorService.noWhiteSpaceMinLengthValidator(8)],
    }),
    confirm_password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(20)]
    })
  })

  // Getters to check the inputs are valid or not (To show error message in DOM)
  get isEmailInvalid(){
    return this.form.controls.email.touched && this.form.controls.email.invalid;
  }
  get isPasswordInvalid(){
    return this.form.controls.password.touched && this.form.controls.password.invalid;
  }

  get isConfirmPasswordInvalid(){
    if(this.form.controls.password.touched && this.form.controls.confirm_password.touched){
      return this.form.controls.password!.value !== this.form.controls.confirm_password!.value;
    }
    return false;
  }

  // Submit the change password data
  async onSubmit(){
    this.form.markAllAsTouched();
    if(this.form.valid && !this.isConfirmPasswordInvalid){
      this.isLoading.set(true);

      // Request body to be sent
      const body: ChangeUserPassword = {
        email: this.form.controls.email.value!.trim().toLowerCase(),
        newPassword: this.form.controls.password.value!.trim()
      }
      
      try{
        // Make the API call
        const data = await this.userService.changeUserPassword(body);
        this.form.reset();

        this.toastManagerService.setRedirectToLoginMessage(`Hi, ${data.name}, please log in with your updated password`);

        this.route.navigate(["/login"], {replaceUrl: true})
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

  // Show/hide password and confirm password
  togglePasswordShow(event: MouseEvent) {
    this.hidePassword.set(!this.hidePassword());
    event.stopPropagation();
  }

  toggleConfirmPasswordShow(event: MouseEvent) {
    this.confirmHidePassword.set(!this.confirmHidePassword());
    event.stopPropagation();
  }
}
