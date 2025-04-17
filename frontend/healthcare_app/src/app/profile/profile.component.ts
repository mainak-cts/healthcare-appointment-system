import { Component, effect, inject, input, OnInit, signal, ViewEncapsulation } from '@angular/core';
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
import { TitleCasePipe } from '@angular/common';
import { User } from '../models/User';
import { Appointment } from '../models/Appointment';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator'


@Component({
  selector: 'app-profile',
  imports: [AppointmentComponent, ReactiveFormsModule, MatSelectModule, MatInputModule, MatIconModule,TitleCasePipe, MatButtonModule, MatPaginatorModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  encapsulation: ViewEncapsulation.None
})
export class ProfileComponent implements OnInit{
  hide = signal(true);
  currentLoggedInUser = signal<User | null>(null);
  user = signal<User | null>(null);
  appointments = signal<Appointment[]>([]);
  editProfile = signal(false);
  pagedAppointments = signal<Appointment[]>([]);
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);

  userId = input.required<string>();

  authService = inject(AuthApiService);
  appointmentService = inject(AppointmentApiService);
  userService = inject(UserApiService);
  toastr = inject(ToastrService);
  toastManagerService = inject(ToastManagerService);
  validationService = inject(ValidationService);

  // Filter appointments form
  filterForm = new FormGroup({
    appointmentId : new FormControl(''),
    patientName : new FormControl(''),
    doctorName : new FormControl(''),
    status : new FormControl('')
  })

  // Edit user profile form
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

  // Fetching the details of the user, whose profile is visited, and fetching the corresponding appointments of that user
  constructor() {
      effect(() => {
        this.authService.getUserById(this.userId())?.subscribe({
          next: (user) => {
            this.user.set(user);
            if(this.user() != null){
              this.appointmentService.getAppointmentByUserId(this.user()!.userId, this.user()!.role, this.filterForm.controls.status.value!, this.filterForm.controls.patientName.value!, this.filterForm.controls.doctorName.value!).subscribe({
                next: (appointments) => {
                  this.appointments.set(appointments)
                },
                error: (err) => console.log(err)
              })
            }
          },
          error: (err) =>{
            this.toastr.error("No user found!", "Error")
          }
        })
      })

      // Update the fields of the edit profile form, with the details of the current logged in user
      effect(() => {
        if(this.currentLoggedInUser() != null){
          this.editProfileForm.controls.name.setValue(this.currentLoggedInUser()!.name);
          this.editProfileForm.controls.phone.setValue(this.currentLoggedInUser()!.phone);
        }
      })

      // Whenever the apppointments array changes, update the paged appointments
      effect(() => {
        this.appointments()
        this.updatePagedAppointments();
      })
  }

  // Fetch the details of the currently logged in user
  ngOnInit(): void {
    this.authService.user$.subscribe((loggedInUser) => {
      this.currentLoggedInUser.set(loggedInUser);
    });
  }

  // Update the appointments data, for pagination
  updatePagedAppointments(){
    const startIndex = this.currentPage() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    this.pagedAppointments.set(this.appointments().slice(startIndex, endIndex));
  }
  onPageChange(event: PageEvent){
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex);
    this.updatePagedAppointments();
  }

  // To check the profile belongs to the currently logged in user, or not
  get isItYourProfile(){
    if(this.currentLoggedInUser() != null)
      return this.userId() == this.currentLoggedInUser()!.userId;
    return false;
  }

  // Getters to check the inputs are valid or not (To show error message in DOM)
  get isNameValid(){
    return this.editProfileForm.controls.name.touched && this.editProfileForm.controls.name.invalid;
  }
  get isPasswordInvalid(){
    return this.editProfileForm.controls.password.touched && this.editProfileForm.controls.password.invalid;
  }
  get isPhoneInvalid(){
    return this.editProfileForm.controls.phone.touched && this.editProfileForm.controls.phone.invalid;
  }

  // Get appointments by user id
  onFilterSubmit(){

    // Make the API call
    this.appointmentService.getAppointmentByUserId(this.user()!.userId, this.user()!.role, this.filterForm.controls.status.value!, this.filterForm.controls.patientName.value!.trim(), this.filterForm.controls.doctorName.value!.trim()).subscribe({
      next: (appointments) => {
        let appointmentWithId: Appointment | undefined;
        const appointmentId = this.filterForm.controls.appointmentId.value!.trim();
        
        // Filter appointment based on id, if provided
        if(appointmentId != ''){
          appointmentWithId = appointments.find((a) => a.appointmentId == appointmentId);
        }

        // If some value for id is entered
        if(appointmentId != ''){
          if(appointmentWithId)   // if any appointment found with that id
            this.appointments.set([appointmentWithId])
          else   // else set empty array
            this.appointments.set([])
        }else{
          this.appointments.set(appointments);  
        }
      },
      error: (err) => {
        this.appointments.set([])
      }
    })
  }

  // Cancel an appointment
  onCancel(id: string){
    // If user chose 'OK' in the popup, cancel, else not
    const toCancel = confirm("Do you really want to cancel the appointment?")

    if(toCancel){
      // Make API call
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

    // Make API call
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

  // Show edit profile form
  onEditProfile(){
    this.toastr.info("If you don't want to change your password, type your existing password.", "Password")
    this.editProfile.set(true);
  }

  // Hide edit profile form
  onEditProfileCancel(){
    this.editProfile.set(false);
    this.editProfileForm.controls.password.reset();
  }

  // Edit Profile from submit
  onEditProfileSubmitForm(){
    this.editProfileForm.markAllAsTouched()
    if(this.editProfileForm.valid){

      // Request body to be sent
      const data: UserData = {
        userId: this.currentLoggedInUser()!.userId,
        name: this.editProfileForm.controls.name.value!.trim(),
        password: this.editProfileForm.controls.password.value!.trim(),
        phone: this.editProfileForm.controls.phone.value!,
      }

      // Make the API call
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
    // If user chose 'OK' in the popup, delete, else not
    const toDelete = window.confirm("Do you really want to delete your profile?")

    if(toDelete){

      // Make the API call
      this.userService.deleteUserById(this.currentLoggedInUser()!.userId).subscribe({
        next: (res) => {
          this.authService.logOutUser();  //logout the user
          this.toastManagerService.setLogOutMessage("Profile deleted successfully!");
        },
        error: (err) => {
          this.toastr.error(err.error.message, "Something went wrong!")
        }
      })
    }
  }

  // Logout the user
  logOut(){
    this.authService.logOutUser();
    this.toastManagerService.setLogOutMessage("Logout successful!");
  }

  // Show/hide password
  togglePasswordShow(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }
}
