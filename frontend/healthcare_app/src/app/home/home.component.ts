import { Component, inject } from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import { AuthApiService } from '../../services/authapi.service';
@Component({
  selector: 'app-home',
  imports: [MatIconModule, MatButtonModule, MatDividerModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  doctors = "100+";
  patients = "500+";
  appointments = "1000+";
  support = "24 x 7";
}
