import { Component, inject, OnInit, signal } from '@angular/core';
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


@Component({
  selector: 'app-availabilities',
  imports: [AvailabilityComponent, MatInputModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './availabilities.component.html',
  styleUrl: './availabilities.component.css'
})
export class AvailabilitiesComponent implements OnInit{

  currentLoggedInUser = signal<User | null>(null);
  availabilities = signal<Availability[]>([]);

  authService = inject(AuthApiService);
  availabilityService = inject(AvailabilityApiService);
  appointmentService = inject(AppointmentApiService);
  httpClient = inject(HttpClient);
  formSubmitted = signal(false);
  toastr = inject(ToastrService);

  availabilityForm = new FormGroup({
    timeSlotStart: new FormControl('', {
      validators: [Validators.required]
    }),
    timeSlotEnd: new FormControl('', {
      validators: [Validators.required]
    }),
  })

  filterAvailabilityForm = new FormGroup({
    doctorName: new FormControl(''),
    timeSlotStart: new FormControl(''),
    timeSlotEnd: new FormControl(''),
  })

  // Set the current logged in user and fetch all the availabilities
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

  // Getters to check whether the inputs are valid or not
  get isTimeSlotStartInvalid(){
    return this.availabilityForm.controls.timeSlotStart.touched && this.availabilityForm.controls.timeSlotStart.value == '';
  }
  get isTimeSlotEndInvalid(){
    return this.availabilityForm.controls.timeSlotEnd.touched && this.availabilityForm.controls.timeSlotEnd.value == '';
  }

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
      const data: AvailabilityData = {
        doctorId: this.currentLoggedInUser()!.userId,
        timeSlotStart: this.availabilityForm.controls.timeSlotStart.value!,
        timeSlotEnd: this.availabilityForm.controls.timeSlotEnd.value!,
      }
      this.availabilityService.createAvailability(data).subscribe({
        next: (res) => {
          this.availabilities.set([res, ...this.availabilities()]);
          this.toastr.success("Availability slot created successfully", "Created")
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
    const appointmentData: AppointmentData = {
      patientId: this.currentLoggedInUser()!.userId,
      doctorId: data.doctorId,
      timeSlotStart: data.timeSlotStart,
      timeSlotEnd: data.timeSlotEnd,
    }

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
    const editAvailabilityData = {
      doctorId: this.currentLoggedInUser()!.userId,
      ...data
    }

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
    const confirmDelete = confirm("Do you really want to delete the slot?")
    if(confirmDelete){
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
    const doctorName = this.filterAvailabilityForm.controls.doctorName.value!.trim();
    const timeSlotStart = this.filterAvailabilityForm.controls.timeSlotStart.value;
    const timeSlotEnd = this.filterAvailabilityForm.controls.timeSlotEnd.value;
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
