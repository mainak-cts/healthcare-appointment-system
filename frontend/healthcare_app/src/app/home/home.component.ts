import { Component, inject, OnInit, signal } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { ToastManagerService } from '../../services/toastr.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-home',
  imports: [MatIconModule, MatButtonModule, MatDividerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  doctors = signal(100);
  patients = signal(500);
  appointments = signal(1000);
  support = signal("24 x 7");

  toastManagerService = inject(ToastManagerService);
  toastr = inject(ToastrService);

  ngOnInit(): void {
      if(this.toastManagerService.logInMessage() != ''){
        this.toastr.success(this.toastManagerService.logInMessage(), "Welcome");
        this.toastManagerService.resetLogInMessage();
      }
  }

}
