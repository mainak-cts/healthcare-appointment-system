import { Component, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { ConsultationApiService } from '../../services/consultationapi.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { AuthApiService } from '../../services/authapi.service';
import { ConsultationData } from '../models/ConsultationData';
import { Router } from '@angular/router';

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
  currentLoggedInUser: any = null;
  route = inject(Router);

  editable = signal(false);
  create = signal(false);
  consultation = signal<any>(null); 

  delete = output();

  form = new FormGroup({
    notes: new FormControl('', {
      validators: Validators.required,
    }),
    prescription: new FormControl('', {
      validators: Validators.required,
    }),
  })
  newConsultationForm = new FormGroup({
    newNotes: new FormControl('', {
      validators: Validators.required,
    }),
    newPrescription: new FormControl('', {
      validators: Validators.required,
    }),
  })

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
    
    effect(() => {
      this.form.controls.notes.setValue(this.consultation().notes);
      this.form.controls.prescription.setValue(this.consultation().prescription);
    })
  }

  ngOnInit(): void {
    this.authService.user$.subscribe((loggedInUser) => {
      this.currentLoggedInUser = loggedInUser;
    });
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

  onEditConsultation(){
    if(this.form.valid){
      const data: ConsultationData = {
        consultationId: this.consultation().consultationId,
        notes: this.form.controls.notes.value!,
        prescription: this.form.controls.prescription.value!,
      }
      this.consultationService.editConsultation(data).subscribe({
        next: (res) => {
          this.consultation.set(res);
          this.editable.set(false);
        },
        error: (err) => {
          console.log(err)
        }
      })
    }
  }

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
        },
        error: (err) => {
          console.log(err)
        }
      })
    }
  }

  onDelete(){
    const shouldDelete = confirm("Do you really want to delete the consultation?")
    if(shouldDelete){
      this.consultationService.deleteConsultationById(this.consultation().consultationId).subscribe({
        next: (res) => {
          this.consultation.set(null);
          this.delete.emit();

        },
        error: (err) => {
          console.log(err);
        }
      })
    }
  }
}
