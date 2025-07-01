import { LoginService } from './../../services/login.service';
import { JsonPipe } from '@angular/common';
import { JsonpInterceptor } from '@angular/common/http';
import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSelect, MatLabel, MatOption, MatFormField } from '@angular/material/select';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    MatSelect,
    MatLabel,
    MatOption,
    MatFormField
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  constructor (private loginService: LoginService) {}

  rightPanelActive = false;

  name: string = "";
  email: string = "";
  password: string = "";
  role: string = "";

  showSignUp(): void {
    this.rightPanelActive = true;
  }

  showSignIn(): void {
    this.rightPanelActive = false;
  }

  activateSignIn() {
    this.loginService.signIn(
      this.email,
      this.password
    );
  }

  activateSignUp() {
    this.loginService.signUp(
      this.name,
      this.email,
      this.password,
      this.role
    );
  }
}
