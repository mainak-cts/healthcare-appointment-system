import { Component, inject, OnInit } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { AuthApiService } from '../../services/authapi.service';
import { ToastManagerService } from '../../services/toastr.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-home',
  imports: [MatIconModule, MatButtonModule, MatDividerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  doctors = 0;
  patients = 0;
  appointments = 0;
  support = "24 x 7";

  doctorInterval = setInterval(()=>{
    if(this.doctors < 100){
      this.doctors++;
    }else{
      clearInterval(this.doctorInterval)
    }
  }, 10)

  patientInterval = setInterval(()=>{
    if(this.patients < 500){
      this.patients++;
    }else{
      clearInterval(this.patientInterval)
    }
  }, 5)

  appointmentInterval = setInterval(()=>{
    if(this.appointments < 1000){
      this.appointments++;
    }else{
      clearInterval(this.appointmentInterval)
    }
  }, 1)

  toastManagerService = inject(ToastManagerService);
  toastr = inject(ToastrService);

  ngOnInit(): void {
      if(this.toastManagerService.logInMessage() != ''){
        this.toastr.success(this.toastManagerService.logInMessage(), "Welcome");
        this.toastManagerService.resetLogInMessage();
      }
  }

}
