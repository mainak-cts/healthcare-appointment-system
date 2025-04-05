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


@Component({
  selector: 'app-availabilities',
  imports: [AvailabilityComponent, MatInputModule, MatFormFieldModule, ReactiveFormsModule],
  templateUrl: './availabilities.component.html',
  styleUrl: './availabilities.component.css'
})
export class AvailabilitiesComponent implements OnInit{

  currentLoggedInUser: any = null;
  authService = inject(AuthApiService);
  availabilityService = inject(AvailabilityApiService);
  appointmentService = inject(AppointmentApiService);
  availabilities: any[] = [];
  httpClient = inject(HttpClient);
  formSubmitted = signal(false);

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

  // Ensure, evem if the page reloads, logged in user details are fetched
  constructor(){
    this.currentLoggedInUser = this.authService.getUserDetails();
  }

  // Set the current logged in user and fetch all the availabilities
  ngOnInit(): void {
    this.authService.user$.subscribe((user) =>{
      this.currentLoggedInUser = user;
      if(this.currentLoggedInUser != null && this.currentLoggedInUser.role == 'DOCTOR'){
        this.availabilityService.getAvailabilitiesByDoctorId(this.currentLoggedInUser.userId).subscribe({
          next: (data) => {
            this.availabilities = data;
            console.log(data)
          },
          error: (err) =>{
            console.log(err);
          }
        })
      }
      // To be implemented (PATIENT can filter availabilities)
      else if(this.currentLoggedInUser != null && this.currentLoggedInUser.role == 'PATIENT'){
        this.availabilityService.getAvailabilities(null, null, null).subscribe({
          next: (data) => {
            this.availabilities = data;
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
        doctorId: this.currentLoggedInUser.userId,
        timeSlotStart: this.availabilityForm.controls.timeSlotStart.value!,
        timeSlotEnd: this.availabilityForm.controls.timeSlotEnd.value!,
      }
      this.availabilityService.createAvailability(data).subscribe({
        next: (res) => {
          this.availabilities.push(res);
        },
        error: (err) => {
          console.log(err)
        }
      })
      return;
    }
  }

  // Book a new appointment using a selected availabililty
  onBook(data: {doctorId: string, timeSlotStart: string, timeSlotEnd: string, availabilityId: string}){
    const appointmentData: AppointmentData = {
      patientId: this.currentLoggedInUser.userId,
      doctorId: data.doctorId,
      timeSlotStart: data.timeSlotStart,
      timeSlotEnd: data.timeSlotEnd,
    }

    this.appointmentService.bookAppointment(appointmentData).subscribe({
      next: (res) => {
        let bookedAvailability = this.availabilities.find((av) => {
          return av.availabilityId == data.availabilityId;
        })
        bookedAvailability.available = false;
      },
      error: (err) => {
        console.log(err)
      }
    })
  }

  // Edit an availability
  onEdit(data: {timeSlotStart: string, timeSlotEnd: string}){
    const editAvailabilityData = {
      doctorId: this.currentLoggedInUser.userId,
      ...data
    }
    this.availabilityService.editAvailability(editAvailabilityData).subscribe({
      next: (res) => {
        // Find the changed availability
        let changedAvailability = this.availabilities.find((av) => {
          return av.availabilityId == res.availabilityId;
        })

        changedAvailability.timeSlotStart = res.timeSlotStart;
        changedAvailability.timeSlotEnd = res.timeSlotEnd;
      }, 
      error: (err) => {
        console.log(err)
      }
    })
  }

  // Delete an availability
  onDelete(id: string){
    const confirmDelete = confirm("Do you really want to delete the slot?")
    if(confirmDelete){
      this.availabilityService.deleteAvailabilityById(id).subscribe({
        next: (res) => {
          this.availabilities = this.availabilities.filter((a) => a.availabilityId != res.availabilityId);
        },
        error: (err) => {
          console.log(err)
        }
      })
    }
  }

  onFilterSubmit(){
    const doctorName = this.filterAvailabilityForm.controls.doctorName.value;
    const timeSlotStart = this.filterAvailabilityForm.controls.timeSlotStart.value;
    const timeSlotEnd = this.filterAvailabilityForm.controls.timeSlotEnd.value;
    this.availabilityService.getAvailabilities(doctorName, timeSlotStart, timeSlotEnd).subscribe({
      next: (res) => {
        this.availabilities = res;
      },
      error: (err) => {
        this.availabilities = []
      }
    })
  }

}
