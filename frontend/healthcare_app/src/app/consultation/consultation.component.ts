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
  appointmentId = input.required<string>();
  consultationService = inject(ConsultationApiService);
  authService = inject(AuthApiService);
  currentLoggedInUser = signal<User | null>(null);
  route = inject(Router);
  toastr = inject(ToastrService);
  validationService = inject(ValidationService);
  status = input.required<"COMPLETED" | "CANCELLED" | "BOOKED">();

  editable = signal(false);
  create = signal(false);
  consultation = signal<Consultation | null>(null); 

  delete = output();

  editConsultationForm = new FormGroup({
    notes: new FormControl('', {
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(500), this.validationService.noWhiteSpaceMinLengthValidator(5)]
    }),
    prescription: new FormControl('', {
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(1000), this.validationService.noWhiteSpaceMinLengthValidator(5)]
    }),
  })

  newConsultationForm = new FormGroup({
    newNotes: new FormControl('', {
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(500), this.validationService.noWhiteSpaceMinLengthValidator(5)]
    }),
    newPrescription: new FormControl('', {
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
          console.log(err);
        }
      })
    })
    
    // When the consultation is loaded (signal changes), set the values in the edit consultation form
    effect(() => {
      this.editConsultationForm.controls.notes.setValue(this.consultation()!.notes);
      this.editConsultationForm.controls.prescription.setValue(this.consultation()!.prescription);
    })
  }

  // Fetch the current logged in user details
  ngOnInit(): void {
    this.authService.user$.subscribe((loggedInUser) => {
      this.currentLoggedInUser.set(loggedInUser);
    });
  }

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

  onEdit(){
    this.editable.set(true)
  }

  onCancel(){
    this.editable.set(false)
  }
  onCancelCreate(){
    this.create.set(false)
    this.newConsultationForm.reset()
  }

  onCreate(){
    this.create.set(true)
  }

  // Edit consultation
  onEditConsultation(){
    if(this.editConsultationForm.valid){
      const data: ConsultationData = {
        consultationId: this.consultation()!.consultationId,
        notes: this.editConsultationForm.controls.notes.value!,
        prescription: this.editConsultationForm.controls.prescription.value!,
      }
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
    if(this.newConsultationForm.valid){
      const data: {appointmentId: string, notes: string, prescription: string} = {
        appointmentId: this.appointmentId(),
        notes: this.newConsultationForm.controls.newNotes.value!,
        prescription: this.newConsultationForm.controls.newPrescription.value!,
      }
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

  onDelete(){
    const shouldDelete = confirm("Do you really want to delete the consultation?")
    if(shouldDelete){
      this.consultationService.deleteConsultationById(this.consultation()!.consultationId).subscribe({
        next: (res) => {
          this.consultation.set(null);
          this.toastr.success("Consultation deleted successfully", "Deleted")
          this.delete.emit();
        },
        error: (err) => {
          this.toastr.error("Failed to delete the consultation", "Failed")
        }
      })
    }
  }
}
