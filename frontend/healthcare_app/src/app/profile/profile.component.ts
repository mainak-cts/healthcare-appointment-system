import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { AuthApiService } from '../../services/authapi.service';
import { AppointmentApiService } from '../../services/appointmentapi.service';
import { AppointmentComponent } from '../appointment/appointment.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { UserData } from '../models/UserData';
import { UserApiService } from '../../services/userapi.service';
import { ToastrService } from 'ngx-toastr';
import { ToastManagerService } from '../../services/toastr.service';
import { ValidationService } from '../../services/validation.service';


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
  toastr = inject(ToastrService);
  toastManagerService = inject(ToastManagerService);
  validationService = inject(ValidationService);

  currentLoggedInUser = signal<any>(null);

  editProfile = signal(false);

  user = signal<any>(null);
  appointments = signal<any[]>([]);

  form = new FormGroup({
    patientName : new FormControl(''),
    doctorName : new FormControl(''),
    status : new FormControl('')
  })

  editProfileForm = new FormGroup({
    name : new FormControl('', {
      validators: [Validators.required, Validators.minLength(2), this.validationService.noWhiteSpaceMinLengthValidator(2)]
    }),
    password : new FormControl('', {
      validators: [Validators.required, Validators.minLength(8), Validators.maxLength(20), this.validationService.noWhiteSpaceMinLengthValidator(8)]
    }),
    phone : new FormControl('', {
      validators: [Validators.required, Validators.pattern("\\d{10}")]
    })
  })

  // Fetching the details of the user, whose profile is visited
  constructor() {
      effect(() => {
        this.authService.getUserById(this.userId())?.subscribe({
          next: (user) => {
            this.user.set(user);
            if(this.user() != null){
              this.appointmentService.getAppointmentByUserId(this.user().userId, this.user().role, this.form.controls.status.value!, this.form.controls.patientName.value!, this.form.controls.doctorName.value!).subscribe({
                next: (appointments) => this.appointments.set(appointments),
                error: (err) => console.log(err)
              })
            }
          },
          error: (err) =>{
            this.toastr.error("No user found!", "Error")
          }
        })
      })

      effect(() => {
        this.editProfileForm.controls.name.setValue(this.currentLoggedInUser().name);
        this.editProfileForm.controls.phone.setValue(this.currentLoggedInUser().phone);
      })
  }

  ngOnInit(): void {
    this.authService.user$.subscribe((loggedInUser) => {
      this.currentLoggedInUser.set(loggedInUser);
    });
  }

  get isItYourProfile(){
    return this.userId() == this.currentLoggedInUser().userId;
  }

  // Get appointments by user id
  onSubmit(){
    this.appointmentService.getAppointmentByUserId(this.user().userId, this.user().role, this.form.controls.status.value!, this.form.controls.patientName.value!, this.form.controls.doctorName.value!).subscribe({
      next: (appointments) => this.appointments.set(appointments),
      error: (err) => {
        this.appointments.set([])
      }
    })
  }

  // Cancel an appointment
  onCancel(id: string){
    const toCancel = confirm("Do you really want to cancel the appointment?")
    if(toCancel){
      this.appointmentService.cancelAppointment(id).subscribe({
        next: (res) => {
          this.toastr.success("Appointment cancelled successfully!", "Cancelled")
          // Traversing through the list, if the id matches, changing the status and returning it
          this.appointments.update((ap) => ap.map((a) => {
            return a.appointmentId == id ? {...a, status: 'CANCELLED'}: a;
          }))
        },
        error: (err) => {
          this.toastr.error(err.error.message, "Cancellation Failed");
        }
      })
    }
  }

  // Complete an appointment
  onComplete(id: string){
    this.appointmentService.completeAppointment(id).subscribe({
      next: (res) => {
        this.toastr.success("Appointment completed successfully!", "Completed")
        // Traversing through the list, if the id matches, changing the status and returning it
        this.appointments.update((ap) => ap.map((a) => {
          return a.appointmentId == id ? {...a, status: 'COMPLETED'}: a;
        }))
      },
      error: (err) => {
        this.toastr.error(err.error.message, "Completion Failed");
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

  // Edit Profile
  onEditProfileSubmitForm(){
    this.editProfileForm.markAllAsTouched()
    if(this.editProfileForm.valid){
      const data: UserData = {
        userId: this.currentLoggedInUser().userId,
        name: this.editProfileForm.controls.name.value!,
        password: this.editProfileForm.controls.password.value!,
        phone: this.editProfileForm.controls.phone.value!,
      }

      this.userService.editUserProfile(data).subscribe({
        next: (res) =>{
          this.user.set(res);    // Set the updated user details
          this.authService.getUserDetails();  // Update the state of the app by loading the updated user
          this.editProfile.set(false);
          this.toastr.success("Profile updated successfully!", "Success")
        },
        error: (err) => {
          if(err.error.error){
            let errorMsg = '';
            for(let errKey in err.error){
              if(errKey != 'error' && errKey != 'statusCode'){
                errorMsg += `${err.error[errKey]}\n`
              }
            }
            this.toastr.error(errorMsg, "Failed")
          }else{
            this.toastr.error("Something went wrong, please try again later", "Error")
          }
        }
      })
    }
  }

  // Delete profile
  onDeleteProfile(){
    const toDelete = window.confirm("Do you really want to delete your profile?")

    if(toDelete){
      this.userService.deleteUserById(this.currentLoggedInUser().userId).subscribe({
        next: (res) => {
          this.authService.logOutUser();
          this.toastManagerService.setLogOutMessage("Profile deleted successfully!");
        },
        error: (err) => {
          this.toastr.error(err.error.message, "Something went wrong!")
        }
      })
    }
  }

  logOut(){
    this.authService.logOutUser();
    this.toastManagerService.setLogOutMessage("Logout successful!");
  }
}
