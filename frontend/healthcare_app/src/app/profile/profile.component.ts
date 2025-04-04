import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { AuthApiService } from '../../services/authapi.service';
import { AppointmentApiService } from '../../services/appointmentapi.service';
import { AppointmentComponent } from '../appointment/appointment.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { UserData } from '../models/UserData';
import { UserApiService } from '../../services/userapi.service';


@Component({
  selector: 'app-profile',
  imports: [AppointmentComponent, ReactiveFormsModule, MatSelectModule, MatInputModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{
  userId = input.required<string>();
  authService = inject(AuthApiService);
  appointmentService = inject(AppointmentApiService);
  userService = inject(UserApiService);
  currentLoggedInUser: any = null;

  editProfile = signal(false);

  user: any = null;
  appointments: any[] = [];

  form = new FormGroup({
    patientName : new FormControl(''),
    doctorName : new FormControl(''),
    status : new FormControl('')
  })

  editProfileForm = new FormGroup({
    name : new FormControl('', {
      validators: [Validators.required, Validators.minLength(2)]
    }),
    password : new FormControl('', {
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(20)]
    }),
    phone : new FormControl('', {
      validators: [Validators.required, Validators.pattern("\\d{10}")]
    })
  })

  constructor() {
      effect(() => {
        this.authService.getUserById(this.userId())?.subscribe({
          next: (user) => {
            this.user = user;
            if(this.user != null){
              this.appointmentService.getAppointmentByUserId(this.user.userId, this.user.role, this.form.controls.status.value!, this.form.controls.patientName.value!, this.form.controls.doctorName.value!).subscribe({
                next: (appointments) => this.appointments = appointments,
                error: (err) => console.log(err)
              })
            }
          },
          error: (err) =>{
            console.log(err)
          }
        })
      })
  }

  ngOnInit(): void {
    this.authService.user$.subscribe((loggedInUser) => {
      this.currentLoggedInUser = loggedInUser;

      this.editProfileForm.controls.name.setValue(this.currentLoggedInUser.name);
      this.editProfileForm.controls.phone.setValue(this.currentLoggedInUser.phone);
    });
  }

  get isItYourProfile(){
    return this.userId() == this.currentLoggedInUser.userId;
  }

  onSubmit(){
    this.appointmentService.getAppointmentByUserId(this.user.userId, this.user.role, this.form.controls.status.value!, this.form.controls.patientName.value!, this.form.controls.doctorName.value!).subscribe({
      next: (appointments) => this.appointments = appointments,
      error: (err) => {
        this.appointments = []
      }
    })
  }

  onCancel(id: string){
    this.appointmentService.cancelAppointment(id).subscribe({
      next: (res) => {
        const cancelledAppointment = this.appointments.find((ap) => {
          return ap.appointmentId == id;
        })
        cancelledAppointment.status = 'CANCELLED'
      },
      error: (err) => {
        console.log(err);
      }
    })
  }
  onComplete(id: string){
    this.appointmentService.completeAppointment(id).subscribe({
      next: (res) => {
        const completedAppointment = this.appointments.find((ap) => {
          return ap.appointmentId == id;
        })

        completedAppointment.status = 'COMPLETED'
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  onEditProfile(){
    this.editProfile.set(true);
  }

  onEditProfileCancel(){
    this.editProfile.set(false);
    this.editProfileForm.controls.password.reset();
  }

  onEditProfileSubmitForm(){
    this.editProfileForm.markAllAsTouched()
    if(this.editProfileForm.valid){
      const data: UserData = {
        userId: this.currentLoggedInUser.userId,
        name: this.editProfileForm.controls.name.value!,
        password: this.editProfileForm.controls.password.value!,
        phone: this.editProfileForm.controls.phone.value!,
      }

      this.userService.editUserProfile(data).subscribe({
        next: (res) =>{
          this.currentLoggedInUser = res;
          this.editProfile.set(false);
          window.location.reload();
        },
        error: (err) => {
          console.log(err)
        }
      })
    }
  }
}
