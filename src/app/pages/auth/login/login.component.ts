import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-login',
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(private readonly router: Router) {}

  login() {
    console.log('login');
    this.router.navigate(['/dashboard']);  
  }
}