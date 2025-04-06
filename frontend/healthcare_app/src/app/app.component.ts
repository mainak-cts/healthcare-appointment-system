import { Component, inject, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./navbar/navbar.component";
import { FooterComponent } from "./footer/footer.component";
import { AuthApiService } from '../services/authapi.service';

@Component({
  selector: '.root',
  imports: [NavbarComponent, FooterComponent, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent{
  title = 'healthcare_app';
  authService = inject(AuthApiService);
}
