import { Component, inject, signal } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApiService } from '../../../services/authapi.service';
import { RegisterData } from '../../models/RegisterData';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule, MatProgressSpinnerModule, MatSelectModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  isLoading = signal(false);
  authService = inject(AuthApiService);

  form = new FormGroup({
    name: new FormControl('', {
      validators: [Validators.required, Validators.minLength(2)]
    }),
    email: new FormControl('', {
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(20)]
    }),
    role: new FormControl('', {
      validators: [Validators.required]
    }),
    phone: new FormControl('', {
      validators: [Validators.required, Validators.pattern("\\d{10}")]
    })
  })

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

  onSubmit(){
    if(this.form.valid){
      const registerData: RegisterData = {
        name: this.form.controls.name.value!,
        email: this.form.controls.email.value!,
        password: this.form.controls.password.value!,
        role: this.form.controls.role.value!,
        phone: this.form.controls.phone.value!,
      }
      this.authService.registerUser(registerData).subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (err) => {
          console.log(err)
        }
      })
    }

  }
}
