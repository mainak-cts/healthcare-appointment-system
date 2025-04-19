import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { AuthApiService } from '../../services/authapi.service';
import { HttpClient } from '@angular/common/http';
import { AvailabilityApiService } from '../../services/availabilityapi.service';
import { AvailabilityComponent } from '../availability/availability.component';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AvailabilityData } from '../models/AvailabilityData';
import { AppointmentData } from '../models/AppointmentData';
import { AppointmentApiService } from '../../services/appointmentapi.service';
import { ToastrService } from 'ngx-toastr';
import { Availability } from '../models/Availability';
import { User } from '../models/User';
import {MatPaginatorModule, PageEvent} from '@angular/material/paginator'

@Component({
  selector: 'app-availabilities',
  imports: [AvailabilityComponent, MatInputModule, MatFormFieldModule, ReactiveFormsModule, MatPaginatorModule],
  templateUrl: './availabilities.component.html',
  styleUrl: './availabilities.component.css'
})
export class AvailabilitiesComponent implements OnInit{

  currentLoggedInUser = signal<User | null>(null);
  availabilities = signal<Availability[]>([]);
  formSubmitted = signal(false);

  pagedAvailabilities = signal<Availability[]>([]);
  pageSize = signal<number>(10);
  currentPage = signal<number>(0);

  authService = inject(AuthApiService);
  availabilityService = inject(AvailabilityApiService);
  appointmentService = inject(AppointmentApiService);
  httpClient = inject(HttpClient);
  toastr = inject(ToastrService);

  // Create availability form
  availabilityForm = new FormGroup({
    timeSlotStart: new FormControl('', {
      validators: [Validators.required]
    }),
    timeSlotEnd: new FormControl('', {
      validators: [Validators.required]
    }),
  })

  // Filter availabilities form
  filterAvailabilityForm = new FormGroup({
    doctorName: new FormControl(''),
    timeSlotStart: new FormControl(''),
    timeSlotEnd: new FormControl(''),
  })

  constructor(){
    // Whenever the apppointments array changes, update the paged appointments
    effect(() => {
      this.availabilities()
      this.updatePagedAvailabilities();
    })
  }

  // Set the current logged in user and fetch all the availabilities based on their ROLE
  // If, ROLE is DOCTOR, only fetch his/her slots
  // Else, Fetch all the 'available' slots
  ngOnInit(): void {
    this.authService.user$.subscribe((user) =>{
      this.currentLoggedInUser.set(user);
      if(this.currentLoggedInUser() != null && this.currentLoggedInUser()!.role == 'DOCTOR'){
        this.availabilityService.getAvailabilitiesByDoctorId(this.currentLoggedInUser()!.userId).subscribe({
          next: (data) => {
            this.availabilities.set(data);
          },
          error: (err) =>{
            console.log(err);
          }
        })
      }

      else if(this.currentLoggedInUser() != null && this.currentLoggedInUser()!.role == 'PATIENT'){
        this.availabilityService.getAvailabilities(null, null, null).subscribe({
          next: (data) => {
            this.availabilities.set(data);
          },
          error: (err) =>{
            console.log(err);
          }
        })
      }
    })
  }

  // For pagination, show only a chunk of appointments, based on page number
  updatePagedAvailabilities(){
    const startIndex = this.currentPage() * this.pageSize();
    const endIndex = startIndex + this.pageSize();
    this.pagedAvailabilities.set(this.availabilities().slice(startIndex, endIndex));
  }
  onPageChange(event: PageEvent){
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex);
    this.updatePagedAvailabilities();
  }


  // Getters to check whether the inputs are valid or not
  get isTimeSlotStartInvalid(){
    return this.availabilityForm.controls.timeSlotStart.touched && this.availabilityForm.controls.timeSlotStart.value == '';
  }
  get isTimeSlotEndInvalid(){
    return this.availabilityForm.controls.timeSlotEnd.touched && this.availabilityForm.controls.timeSlotEnd.value == '';
  }

  // When submit button is clicked, check whether some data is given, if not clicked, the input fields are just touched and focus goes off, check whether is it ''
  get slotStartInvalid(){
    return this.formSubmitted() ? this.availabilityForm.controls.timeSlotStart.invalid: this.isTimeSlotStartInvalid;
  }

  get slotEndInvalid(){
    return this.formSubmitted() ? this.availabilityForm.controls.timeSlotEnd.invalid: this.isTimeSlotEndInvalid;
  }

  // Create a new availability
  onCreateSubmit(){
    this.formSubmitted.set(true)
    if(this.availabilityForm.valid){

      // Request body to be sent
      const data: AvailabilityData = {
        doctorId: this.currentLoggedInUser()!.userId,
        timeSlotStart: this.availabilityForm.controls.timeSlotStart.value!,
        timeSlotEnd: this.availabilityForm.controls.timeSlotEnd.value!,
      }

      // Make the API call
      this.availabilityService.createAvailability(data).subscribe({
        next: (res) => {
          // Getting the newly created slot, and adding it in the array
          this.availabilities.set([res, ...this.availabilities()]);
          this.toastr.success("Availability slot created successfully", "Created")
          this.availabilityForm.reset();
          // This part is required, as we set the initital values as '', and written the logic in the getter based on it
          this.availabilityForm.controls.timeSlotStart.setValue('');
          this.availabilityForm.controls.timeSlotEnd.setValue('');
          this.formSubmitted.set(false)
        },
        error: (err) => {
          if(err.error.error){
            let errorMsg = '';
            for(let errKey in err.error){
              if(errKey != 'error' && errKey != 'statusCode'){
                errorMsg += `${err.error[errKey]}\n`
              }
            }
            this.toastr.error(errorMsg, "Creation Failed")
          }else{
            this.toastr.error("Something went wrong, please try again later", "Error")
          }
        }
      })
    }
  }

  // Book a new appointment using a selected availabililty
  onBook(data: {doctorId: string, timeSlotStart: string, timeSlotEnd: string, availabilityId: string}){

    // Request body to be sent
    const appointmentData: AppointmentData = {
      patientId: this.currentLoggedInUser()!.userId,
      doctorId: data.doctorId,
      timeSlotStart: data.timeSlotStart,
      timeSlotEnd: data.timeSlotEnd,
    }

    // Make the API call
    this.appointmentService.bookAppointment(appointmentData).subscribe({
      next: (res) => {
        this.availabilities.update(av => av.map(a => {
          return a.availabilityId == data.availabilityId ? {...a, available: false}: a;
        }));
        this.toastr.success(`New appointment booked with id: ${res.appointmentId}`, "Appointment Booked")
      },
      error: (err) => {
        this.toastr.error(err.error.message, "Appointment booking failed")
      }
    })
  }

  // Edit an availability
  onEdit(data: {availabilityId: string, timeSlotStart: string, timeSlotEnd: string}){

    // Request body to be sent
    const editAvailabilityData = {
      doctorId: this.currentLoggedInUser()!.userId,
      ...data
    }

    // Make the API call
    this.availabilityService.editAvailability(editAvailabilityData).subscribe({
      next: (res) => {
        this.availabilities.update(av => av.map(a => {
          return a.availabilityId == res.availabilityId ? {...a, timeSlotStart: res.timeSlotStart, timeSlotEnd : res.timeSlotEnd}: a;
        }))

        this.toastr.success("Availability slot updated successfully!", "Updated")
      }, 
      error: (err) => {
        if(err.error.error){
          let errorMsg = '';
          for(let errKey in err.error){
            if(errKey != 'error' && errKey != 'statusCode'){
              errorMsg += `${err.error[errKey]}\n`
            }
          }
          this.toastr.error(errorMsg, "Updation Failed")
        }else{
          this.toastr.error("Something went wrong, please try again later", "Error")
        }
      }
    })
  }

  // Delete an availability
  onDelete(id: string){
    // If 'OK' is chosen in the popup, delete, else not
    const confirmDelete = confirm("Do you really want to delete the slot?")

    if(confirmDelete){
      // Make the APi call
      this.availabilityService.deleteAvailabilityById(id).subscribe({
        next: (res) => {
          const updatedList = this.availabilities().filter((a) => a.availabilityId != res.availabilityId);

          this.availabilities.set(updatedList);

          this.toastr.success("Availability slot deleted successfully!", "Deleted")
        },
        error: (err) => {
          this.toastr.error(err.error.message, "Failed to delete")
        }
      })
    }
  }

  // Filter availabilities
  onFilterSubmit(){
    
    // Fetch the params, based on which filtering will be done
    const doctorName = this.filterAvailabilityForm.controls.doctorName.value!.trim();
    const timeSlotStart = this.filterAvailabilityForm.controls.timeSlotStart.value;
    const timeSlotEnd = this.filterAvailabilityForm.controls.timeSlotEnd.value;

    // Make the API call
    this.availabilityService.getAvailabilities(doctorName, timeSlotStart, timeSlotEnd).subscribe({
      next: (res) => {
        this.availabilities.set(res);
      },
      error: (err) => {
        this.availabilities.set([]);
      }
    })
  }

}
