import { Admin } from './../../models/admin.model';
import { Patient } from './../../models/patient.model';
import { Component, Inject, inject, ViewEncapsulation } from '@angular/core';
import { NavigationStart, Router, RouterModule, RouterOutlet } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { MatSidenavModule }   from '@angular/material/sidenav';
import { MatToolbarModule }   from '@angular/material/toolbar';
import { MatIconModule }      from '@angular/material/icon';
import { MatListModule }      from '@angular/material/list';
import { MatButtonModule }    from '@angular/material/button';
import { PatientTable } from "../patient-table/patient-table";
import { CommonModule } from '@angular/common';
import { DoctorTable } from "../doctor-table/doctor-table";
import { AppointmentTable } from '../appointment-table/appointment-table';
import Swal from 'sweetalert2';
import { PatientDetailsService } from '../../services/patient-details.service';
import { DoctorDetailsService } from '../../services/doctor-details.service';
import { AdminDetailsService } from '../../services/admin-details.service';
import { Doctor } from '../../models/doctor.model';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatCardModule,
    // PatientTable,
    // DoctorTable,
    // AppointmentTable,
],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  encapsulation: ViewEncapsulation.None
})
export class Dashboard {
  constructor() { }

  private loginService = inject(LoginService);
  private router = inject(Router);
  private pdSvc = inject(PatientDetailsService);
  private ddSvc = inject(DoctorDetailsService);
  private adSvc = inject(AdminDetailsService);

  showPatient = false;
  showDoctor = false;
  showAppointment = false;

  role = this.loginService.getRole();
  patientUser: Patient = {};
  doctorUser: Doctor = {};
  adminUser: Admin = {};

  stats = [
    {
      name: '',
      icon: ''
    }
  ];

  renderStats() {
    if (this.role == 'Admin') {
      this.stats = [
        {
          name: 'Appointments',
          icon: '📅'
        },
        {
          name: 'Patients',
          icon: '🤵‍♂️'
        },
        {
          name: 'Doctors',
          icon: '👨‍⚕️'
        }
      ]
    } else if (this.role == 'Patient') {
      this.stats = [
        {
          name: 'Health Summary',
          icon: 'medical_services'
        },
        {
          name: 'Pending Payments',
          icon: '💳'
        },
        {
          name: 'New Patient',
          icon: '🕒'
        }
      ]
    } else if (this.role == 'Doctor') {
      this.stats = [
        {
          name: 'Urgent Appointments',
          icon: 'medical_services'
        },
        {
          name: 'Pending Payments',
          icon: '💳'
        },
        {
          name: 'New Doctor',
          icon: '🕒'
        }
      ]
    }
  }

  navToPatientHome() {
    // patient home page navigation
    if (this.role == 'Patient' || this.role == 'Admin') {
      this.router.navigate(['/patient'])
    }
  }

  navToDoctorHome() {
    // doctor home page navigation
    if (this.role == 'Doctor' || this.role == 'Admin') {
      this.router.navigate(['/doctor'])
    }
  }

  navToSupport() {
    // support page navigation
    Swal.fire({
      title: 'Support',
      text: `Confused? Get help via ticketing or look at Frequently Asked Questions in the FAQ section.
      (not implemented yet)
      `,
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  cardClick(s: { name: string, icon: string }) {
    // handle card click based on role
    if (this.role == 'Admin') {
      Swal.fire({
        title: 'Not implemented',
        text: `(not implemented yet)`,
        icon: 'info',
        confirmButtonText: 'OK'
      });
    }
    else if (this.role == 'Patient') {
      if (s.name == 'New Patient') {
        Swal.fire({
          title: 'Enter your details',
          text: `Newly registered patients will enter their details here before gaining access to the rest of the app.
          Currently sign up only adds user details to User table.
          (not implemented yet)
          `,
          icon: 'info',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          title: 'Not implemented',
          text: `(not implemented yet)`,
          icon: 'info',
          confirmButtonText: 'OK'
        });
      }
    }
    else if (this.role == 'Doctor') {
      if (s.name == 'New Doctor') {
        Swal.fire({
          title: 'Enter your details',
          text: `Newly registered doctors will enter their details here before gaining access to the rest of the app.
          Currently sign up only adds user details to User table.
          (not implemented yet)
          `,
          icon: 'info',
          confirmButtonText: 'OK'
        });
      } else {
        Swal.fire({
          title: 'Not implemented',
          text: `(not implemented yet)`,
          icon: 'info',
          confirmButtonText: 'OK'
        });
      }
    }
  }

  logout() {
    fetch('http://localhost:5122/api/auth/logout', {
      method: 'POST'
    })
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    // logout on refresh (local cookie storage not implemented)
    if (!this.loginService.isLoggedIn()) {
      this.logout()
      this.router.navigate(['/login'])
    }

    this.renderStats();
    if (this.role != 'Patient' && this.role != 'Doctor' && this.role != 'Admin') {
      Swal.fire({
        title: 'Logged Out',
        text: 'Refreshing the page will log you out.',
        icon: 'warning',
        confirmButtonText: 'OK'
      }).then(() => {
        this.logout();
        this.router.navigate(['/login']);
      });
    }

    // this.setCurrentUserDetails(this.role);
    // this.patientUser = {}
    // this.doctorUser = {}
    // this.adminUser = {}

    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationStart && (evt.url == "" || evt.navigationTrigger == "popstate" || evt.navigationTrigger == "hashchange")) {
        this.logout();
        this.router.navigate(['/login']);
      }
    })
  }

  // fix below function post demos
  // the details services for each role were causing a massive glitch in the UI
  // most probably due to null returns from the current user?
  // debug and fix later

  // setCurrentUserDetails(role: string) {
  //   switch (role) {
  //     case 'Patient':
  //       this.patientUser.firstName = this.loginService.getFirstName()
  //       this.patientUser.lastName = this.loginService.getLastName()
  //       this.doctorUser = {}
  //       this.adminUser = {}
  //       break;
  //     case 'Doctor':
  //       this.doctorUser.firstName = this.loginService.getFirstName()
  //       this.doctorUser.lastName = this.loginService.getLastName()
  //       this.patientUser = {}
  //       this.adminUser = {}
  //       break;
  //     case 'Admin':
  //       this.adminUser.username = this.loginService.getFirstName()
  //       // this.adminUser.username = this.loginService.getLastName()
  //       this.patientUser = {}
  //       this.doctorUser = {}
  //       break;
  //     default:
  //       break;
  //   }
  // }
}
