import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ConsultationComponent } from "../consultation/consultation.component";
import { Appointment } from '../models/Appointment';

@Component({
  selector: 'app-appointment',
  imports: [DatePipe, RouterLink, ConsultationComponent, TitleCasePipe],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css'
})
export class AppointmentComponent {

  appointment = input.required<Appointment>();
  isYou = input.required<boolean>();
  showConsultation = signal(false);
  userRole = input.required<string>();

  cancel = output<string>();
  complete = output<string>();

  onCancelAppointment(){
    this.cancel.emit(this.appointment().appointmentId);
  }

  onCompleteAppointment(){
    this.complete.emit(this.appointment().appointmentId);
  }

  toggleConsultation() {
    this.showConsultation.update((prev) => !prev);
  }
}
