import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthApiService } from '../../services/authapi.service';
import { ToastManagerService } from '../../services/toastr.service';
import {MatTooltipModule} from '@angular/material/tooltip';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, MatTooltipModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  authService = inject(AuthApiService);
  user = signal<any>(null);

  // Fetch the details of the currently logged in user
  ngOnInit(){
    this.authService.user$.subscribe((user) => {
      this.user.set(user);
    });

  }
}
