import { LoginService } from './../../services/login.service';
import { JsonPipe } from '@angular/common';
import { JsonpInterceptor } from '@angular/common/http';
import { Component, input } from '@angular/core';
import { FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSelect, MatLabel, MatOption, MatFormField } from '@angular/material/select';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    MatSelect,
    MatLabel,
    MatOption,
    MatFormField,
    ReactiveFormsModule,
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

  fb = new FormBuilder();

  signUp = this.fb.nonNullable.group({
    signUpName: '',
    signUpEmail: '',
    signUpPassword: ''
  }).addValidators([
    Validators.required
  ])

  user = new User("", "", "", "");

  onSubmit() {

  }



  showSignUp(): void {
    this.rightPanelActive = true;
  }

  showSignIn(): void {
    this.rightPanelActive = false;
  }

  activateSignIn() {
    // this.loginService.signIn(
    //   this.name,
    //   this.password
    // );
  }

  activateSignUp() {
    // this.loginService.signUp(
    //   this.name,
    //   this.email,
    //   this.password,
    //   this.role
    // );
  }
}
