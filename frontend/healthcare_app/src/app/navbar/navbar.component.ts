import { Component, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthApiService } from '../../services/authapi.service';
import { ToastManagerService } from '../../services/toastr.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  authService = inject(AuthApiService);
  user = signal<any>(null);

  toastManagerService = inject(ToastManagerService);

  ngOnInit(){
    this.authService.user$.subscribe((user) => {
      this.user.set(user);
    });

  }
}
