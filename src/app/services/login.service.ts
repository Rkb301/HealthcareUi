import { inject, Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { PatientDetailsService } from './patient-details.service';
import { DoctorDetailsService } from './doctor-details.service';

// export interface LoginResponse {
//   accessToken: string;
//   expiryTime: string;
// }

@Injectable({ providedIn: 'root' })
export class LoginService {
  private authUrl = 'http://localhost:5122/api/auth';
  private baseUrl = 'http://localhost:5122/api'
  private token = '';
  private role = '';
  private patientService = inject(PatientDetailsService);
  private doctorService = inject(DoctorDetailsService);

  // Retrieve stored token
  getToken(): string {
    return this.token;
  }

  getRole(): string {
    return this.role;
  }

  // Sign In
  async signIn(email: string, password: string): Promise<void> {
    const response = await fetch(`${this.authUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Email: email, Password: password })
    });

    if (response.ok) {
      await response.text()
        .then((data) => {
          const obj = JSON.parse(data);
          this.token = obj.accessToken;
          this.role = obj.role;
      })
    } else if (response.status === 401) {
      throw new Error('Invalid login details');
    } else {
      throw new Error('Login request failed');
    }
  }

  // Sign Up
  async signUp(
    username: string,
    email:    string,
    password: string,
    role:     string
  ): Promise<void> {
    const nameRegex = /^[a-zA-Z ]*$/;

    if (!email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }

    if (!nameRegex.test(username)) {
      throw new Error('Invalid Name');
    }

    const response = await fetch(`${this.authUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Registration failed');
    }
  }

  async getDetails() {
    switch (this.role) {
      case 'Patient':
        const response = await fetch(`${this.baseUrl}/patient/search-lucene`)
        break;

      default:
        break;
    }
  }
}
