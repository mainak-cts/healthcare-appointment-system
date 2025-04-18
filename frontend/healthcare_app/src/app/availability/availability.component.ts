import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, effect, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Availability } from '../models/Availability';

@Component({
  selector: 'app-availability',
  imports: [DatePipe, RouterLink, ReactiveFormsModule, TitleCasePipe],
  templateUrl: './availability.component.html',
  styleUrl: './availability.component.css'
})
export class AvailabilityComponent {
  isEditing = signal(false);
  formSubmitted = signal(false);

  availability = input.required<Availability>();
  userRole = input.required<string>();

  book = output<{doctorId: string, timeSlotStart: string, timeSlotEnd: string, availabilityId: string}>();
  edit = output<{availabilityId: string, timeSlotStart: string, timeSlotEnd: string}>();
  delete = output<string>();

  // Form to edit the availability slot
  editForm = new FormGroup({
    timeSlotStart: new FormControl('', {
      validators: [Validators.required]
    }),
    timeSlotEnd: new FormControl('', {
      validators: [Validators.required]
    }),
  })

  // To, set the date-time in the form, after the 'availabilty' data is fetched
  constructor(){
    effect(() => {
      this.editForm.get('timeSlotStart')?.setValue(this.availability().timeSlotStart);
      this.editForm.get('timeSlotEnd')?.setValue(this.availability().timeSlotEnd);
    })
  }

  // Getters to check the inputs are valid or not (To show error message in DOM)
  get isTimeSlotStartInvalid(){
    return this.editForm.controls.timeSlotStart.touched && this.editForm.controls.timeSlotStart.value == '';
  }
  get isTimeSlotEndInvalid(){
    return this.editForm.controls.timeSlotEnd.touched && this.editForm.controls.timeSlotEnd.value == '';
  }

  get slotStartInvalid(){
    return this.formSubmitted() ? this.editForm.controls.timeSlotStart.invalid: this.isTimeSlotStartInvalid;
  }

  get slotEndInvalid(){
    return this.formSubmitted() ? this.editForm.controls.timeSlotEnd.invalid: this.isTimeSlotEndInvalid;
  }

  // Send to be booked availbility id to parent
  onBook(){
    // Emit the data, which is obtained by the parent component (availabilities), to make API call
    const data = {
      doctorId: this.availability().doctor!.userId,
      timeSlotStart: this.availability().timeSlotStart,
      timeSlotEnd: this.availability().timeSlotEnd,
      availabilityId: this.availability().availabilityId
    }
    this.book.emit(data);
  }

  // When clicked, show the edit availbility form
  onEditClick(){
    this.isEditing.set(true);
  }

  // Hide edit availbility form
  onEditCancel(){
    this.isEditing.set(false);
  }

  // Submit the edit availbility data to parent (availabilities)
  onEditSubmit(){
    this.formSubmitted.set(true);
    this.isEditing.set(false);
    if(this.editForm.valid){
        const data = {
          availabilityId: this.availability().availabilityId,
          timeSlotStart: this.editForm.controls.timeSlotStart.value!,
          timeSlotEnd: this.editForm.controls.timeSlotEnd.value!,
        }
        this.edit.emit(data);
    }

  }

  // Send the 'to be deleted availbility id' to parent (availabilities)
  onDeleteAvailability(){
    this.delete.emit(this.availability().availabilityId);
  }
}
