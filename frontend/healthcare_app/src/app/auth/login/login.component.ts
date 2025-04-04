import { Component, inject, signal } from '@angular/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApiService } from '../../../services/authapi.service';
import { LogInData } from '../../models/LogInData';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, ReactiveFormsModule, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  authService:AuthApiService = inject(AuthApiService);
  route = inject(Router);
  isLoading = signal(false);

  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(20)]
    })
  })

  get isEmailInvalid(){
    return this.form.controls.email.touched && this.form.controls.email.invalid;
  }
  get isPasswordInvalid(){
    return this.form.controls.password.touched && this.form.controls.password.invalid;
  }
  onSubmit(){
    if(this.form.valid){
      this.isLoading.set(true);
      const body:LogInData = {
        email: this.form.controls.email.value!,
        password: this.form.controls.password.value!
      }
      this.authService.logInUser(body).subscribe({
        next: (data) => {
          this.authService.handleLogIn(data.jwtToken);
          this.form.reset();
          this.route.navigate(["/home"], {replaceUrl: true})
        },
        error: (err) => console.log(err)
      })
      this.isLoading.set(false);
      return;
    }
    console.log("Invalid form");
  }
}
