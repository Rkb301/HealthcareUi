import { inject, Injectable } from '@angular/core';
import Swal from 'sweetalert2';
import { PatientDetailsService } from './patient-details.service';
import { DoctorDetailsService } from './doctor-details.service';
import { AdminDetailsService } from './admin-details.service';
import { Router } from '@angular/router';

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
  private userEmail = '';
  private username = '';

  private patientID = '';
  private doctorID = '';
  private adminID = '';

  private firstName = '';
  private lastName = '';

  private patientService = inject(PatientDetailsService);
  private doctorService = inject(DoctorDetailsService);
  private adminService = inject(AdminDetailsService);

  private router = inject(Router);

  getToken(): string {
    return this.token;
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  getRole(): string {
    return this.role;
  }

  getPatientID(): number {
    return parseInt(this.patientID);
  }

  getDoctorID(): number {
    return parseInt(this.doctorID);
  }

  getAdminID(): number {
    return parseInt(this.adminID);
  }

  getUsername(): string {
    return this.username;
  }

  getUserEmail(): string {
    return this.userEmail;
  }

  isLoggedIn() {
    if (this.token == null) {
      return false;
    }
    else {
      return true;
    }
  }

  logout() {
    this.token = '';
    this.role = '';
    this.userEmail = '';
    this.username = '';
    this.patientID = '';
    this.doctorID = '';
    this.adminID = '';
    this.firstName = '';
    this.lastName = '';

    this.patientService.clearUser();
    this.doctorService.clearUser();
    this.adminService.clearUser();

    fetch('http://localhost:5122/api/auth/logout', {
      method: 'POST'
    });
    this.router.navigate(['/login']);
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
          if (obj.isActive) {
            this.token = obj.accessToken;
            this.role = obj.role;
            this.userEmail = obj.email;
            this.username = obj.username;
          } else {
            throw new Error('Invalid login details');
          }
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

  async getUserDetails(role: string) {
    const response = await
      fetch(`${this.baseUrl}/user/search?username=${this.username}&email=${this.userEmail}`, {
        method: "GET",
        headers: {
        'Authorization': `Bearer ${this.token}`
        }
      })
    var id = 0;
    if (response.ok) {
      await response.text()
        .then((data) => {
          const obj = JSON.parse(data);
          id = obj.data[0].userID;
          // console.log('user ID:- ' + id);
        })

      if (role == 'Patient') {
        await fetch(`${this.baseUrl}/patient/search?uid=${id}`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        }).then((response) => {
          if (response.ok) {
            response.text()
              .then((data) => {
                const obj = JSON.parse(data);
                this.patientID = obj.data[0].patientID;
                this.firstName = obj.data[0].firstName;
                this.lastName = obj.data[0].lastName;
                // console.log('patient id:- ' + this.patientID);
                this.patientService.setUser(obj.data[0])
            })
          }
        })
      } else if (role == 'Doctor') {
        await fetch(`${this.baseUrl}/doctor/search?uid=${id}`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        }).then((response) => {
          if (response.ok) {
            response.text()
              .then((data) => {
                const obj = JSON.parse(data);
                this.doctorID = obj.data[0].doctorID;
                this.firstName = obj.data[0].firstName;
                this.lastName = obj.data[0].lastName;
                // console.log('doctor ID:- ' + this.doctorID);
                this.doctorService.setUser(obj.data[0])
            })
          }
        })
      } else if (role == 'Admin') {
        await fetch(`${this.baseUrl}/user/search?uid=${id}`, {
          method: "GET",
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        }).then((response) => {
          if (response.ok) {
            response.text()
              .then((data) => {
                const obj = JSON.parse(data);
                this.adminID = obj.data[0].userID;
                this.firstName = obj.data[0].username;
                // console.log('admin id:- ' + this.adminID);
                this.adminService.setUser(obj.data[0])
            })
          };
        })
      };
    };
  };

  async getDetails() {
    switch (this.role) {
      case 'Patient':
        this.getUserDetails('Patient');
        break;
      case 'Doctor':
        this.getUserDetails('Doctor');
        break;
      case 'Admin':
        this.getUserDetails('Admin');
        break;

      default:
        Swal.fire("Not Found", "User not found", "error");
        break;
    }
  }
}
