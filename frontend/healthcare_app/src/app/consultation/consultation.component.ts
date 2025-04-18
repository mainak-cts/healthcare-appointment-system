import { Component, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { ConsultationApiService } from '../../services/consultationapi.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { AuthApiService } from '../../services/authapi.service';
import { ConsultationData } from '../models/ConsultationData';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ValidationService } from '../../services/validation.service';
import { User } from '../models/User';
import { Consultation } from '../models/Consultation';

@Component({
  selector: 'app-consultation',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './consultation.component.html',
  styleUrl: './consultation.component.css'
})
export class ConsultationComponent implements OnInit{
  editable = signal(false);
  create = signal(false);
  consultation = signal<Consultation | null>(null); 
  currentLoggedInUser = signal<User | null>(null);

  appointmentId = input.required<string>();
  status = input.required<"COMPLETED" | "CANCELLED" | "BOOKED">();
  delete = output();

  consultationService = inject(ConsultationApiService);
  authService = inject(AuthApiService);
  route = inject(Router);
  toastr = inject(ToastrService);
  validationService = inject(ValidationService);

  // New consultation form
  newConsultationForm = new FormGroup({
    newNotes: new FormControl('', {
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(500), this.validationService.noWhiteSpaceMinLengthValidator(5)]
    }),
    newPrescription: new FormControl('', {
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(1000), this.validationService.noWhiteSpaceMinLengthValidator(5)]
    }),
  })

  // Edit consultation form
  editConsultationForm = new FormGroup({
    notes: new FormControl('', {
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(500), this.validationService.noWhiteSpaceMinLengthValidator(5)]
    }),
    prescription: new FormControl('', {
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(1000), this.validationService.noWhiteSpaceMinLengthValidator(5)]
    }),
  })

  // Fetch the associated consultation, for the given appointment
  constructor(){
    effect(() => {
      this.consultationService.getConsultationByAppointmentId(this.appointmentId()).subscribe({
        next: (res) => {
          this.consultation.set(res);
        },
        error: (err) => {
          console.log(err.error?.message);
        }
      })
    })

    // When the consultation is loaded (signal changes), set the values in the edit consultation form
    effect(() => {
      if (this.consultation() != null) {
        this.editConsultationForm.controls.notes.setValue(this.consultation()!.notes);
        this.editConsultationForm.controls.prescription.setValue(this.consultation()!.prescription);
      }
    })
  }

  // Fetch the current logged in user details
  ngOnInit(): void {
    this.authService.user$.subscribe((loggedInUser) => {
      this.currentLoggedInUser.set(loggedInUser);
    });
  }

  // Getters to check the inputs are valid or not (To show error message in DOM)
  get isEditedNotesValid(){
    return this.editConsultationForm.controls.notes.touched && this.editConsultationForm.controls.notes.invalid;
  }

  get isEditedPrescriptionValid(){
    return this.editConsultationForm.controls.prescription.touched && this.editConsultationForm.controls.prescription.invalid;
  }

  get isNewNotesValid(){
    return this.newConsultationForm.controls.newNotes.touched && this.newConsultationForm.controls.newNotes.invalid;
  }

  get isNewPrescriptionValid(){
    return this.newConsultationForm.controls.newPrescription.touched && this.newConsultationForm.controls.newPrescription.invalid;
  }

  // Show edit form
  onEdit(){
    this.editable.set(true)
  }

  // Hide edit form
  onCancel(){
    this.editable.set(false)
  }
  
  // Show create form
  onCreate(){
    this.create.set(true)
  }

  // Hide create form
  onCancelCreate(){
    this.create.set(false)
    this.newConsultationForm.reset()
  }

  // Edit consultation
  onEditConsultation(){
    this.editConsultationForm.markAllAsTouched()
    if(this.editConsultationForm.valid){

      // Request body to be sent
      const data: ConsultationData = {
        consultationId: this.consultation()!.consultationId,
        notes: this.editConsultationForm.controls.notes.value!,
        prescription: this.editConsultationForm.controls.prescription.value!,
      }

      // Make the API call
      this.consultationService.editConsultation(data).subscribe({
        next: (res) => {
          this.consultation.set(res);
          this.editable.set(false);
          this.toastr.success("Consultation updated successfully!", "Updated");
        },
        error: (err) => {
          this.toastr.error(err.error.message, "Failed");
        }
      })
    }
  }

  // Create new consultation
  onCreateConsultation(){
    this.newConsultationForm.markAllAsTouched()
    if(this.newConsultationForm.valid){

      // Request body to be sent
      const data: {appointmentId: string, notes: string, prescription: string} = {
        appointmentId: this.appointmentId(),
        notes: this.newConsultationForm.controls.newNotes.value!,
        prescription: this.newConsultationForm.controls.newPrescription.value!,
      }

      // Make the API call
      this.consultationService.createConsultation(data).subscribe({
        next: (res) => {
          this.consultation.set(res);
          this.create.set(false);
          this.toastr.success("Consultation created successfully!", "Created");
        },
        error: (err) => {
          if(err.error.error){
            this.toastr.error(err.error.message, "Failed")
          }else{
            this.toastr.error("Something went wrong, please try again later", "Error")
          }
        }
      })
    }
  }

  // Delete consultation
  onDelete(){
    // If user chose 'OK', then delete, else not
    const shouldDelete = confirm("Do you really want to delete the consultation?")
    if(shouldDelete){

      // Make the API call
      this.consultationService.deleteConsultationById(this.consultation()!.consultationId).subscribe({
        next: (res) => {
          this.consultation.set(null);
          this.toastr.success("Consultation deleted successfully", "Deleted")
          // To hide the consultation, emit the event to parent (appointment)
          this.delete.emit();
        },
        error: (err) => {
          this.toastr.error("Failed to delete the consultation", "Failed")
        }
      })
    }
  }
}
