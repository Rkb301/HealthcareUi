import { MatSelect, MatFormField, MatLabel, MatOption } from '@angular/material/select';
import { Component } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MatCard } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule }    from '@angular/material/select';
import { MatCardModule }      from '@angular/material/card';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatLabel,
    MatOption,
    MatCardModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login {
  rightPanelActive = false;

  fb = new FormBuilder();

  signInForm = this.fb.nonNullable.group({
    loginEmail:    ['', [Validators.required, Validators.email]],
    loginPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  signUpForm = this.fb.nonNullable.group({
    signUpName:     ['', Validators.required],
    signUpEmail:    ['', [Validators.required, Validators.email]],
    signUpPassword: ['', [Validators.required, Validators.minLength(6)]],
    signUpRole:     ['Patient', Validators.required],
  });

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  onSignIn() {
    if (this.signInForm.invalid) {
      this.signInForm.markAllAsTouched();
      return;
    }
    const { loginEmail, loginPassword } = this.signInForm.value;
    this.loginService
      .signIn(loginEmail!, loginPassword!)
      .then(() => {
        this.router.navigate(['/dashboard']);
      })
      .catch(err => {
        Swal.fire('Error', err.message || 'Login failed', 'error');
      });
  }

  onSignUp() {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }
    const { signUpName, signUpEmail, signUpPassword, signUpRole } = this.signUpForm.value;
    this.loginService
      .signUp(
        signUpName!,
        signUpEmail!,
        signUpPassword!,
        signUpRole!
      )
      .then(() => {
        Swal.fire('Success', 'Registration complete. Please log in.', 'success');
        this.showSignIn();
        this.signUpForm.reset({ signUpRole: 'Patient' });
      })
      .catch(err => {
        Swal.fire('Error', err.message || 'Registration failed', 'error');
      });
  }

  showSignUp() {
    this.rightPanelActive = true;
  }

  showSignIn() {
    this.rightPanelActive = false;
  }
}
