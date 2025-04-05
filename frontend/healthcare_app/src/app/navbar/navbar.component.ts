import { Component, inject, input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthApiService } from '../../services/authapi.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit{
  authService = inject(AuthApiService);
  user: any = null;

  ngOnInit(){
    this.authService.user$.subscribe((user) => {
      this.user = user;
    });

  }

  logout(){
      this.authService.logOutUser();
  }


}
