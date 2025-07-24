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

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
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
  patientUser: Patient = {firstName:'Test'};
  doctorUser: Doctor = {firstName:'Test'};
  adminUser: Admin = {};

  stats = [
    {
      name: 'Patients',
      icon: '👨‍💼',
      route: '/patients',
    },
    {
      name: 'Doctors',
      icon: '👨‍⚕️',
      route: '/doctors',
    },
    {
      name: 'Appointments',
      icon: '📅',
      route: '/appointments',
    }
  ];


  // navToPatients() {
  //   this.router.navigateByUrl('/patients')
  // }

  // navToDoctors() {
  //   this.router.navigate(['/doctors'])
  // }

  // navToAppointments() {
  //   this.router.navigate(['/appointments'])
  // }

  navToPatientHome() {
    if (this.role == 'Patient' || this.role == 'Admin') {
      this.router.navigate(['/patient'])
    }
  }

  navToDoctorHome() {
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

  setCurrentUserDetails(role: string) {
    switch (role) {
      case 'Patient':
        this.patientUser = this.pdSvc.currentUser!
        break;
      case 'Doctor':
        this.doctorUser = this.ddSvc.currentUser!
        break;
      case 'Admin':
        this.adminUser = this.adSvc.currentUser!
        break;
      default:
        break;
    }
  }

  // showPatients() {
  //   if (this.showPatient == false) {
  //     this.showPatient = true;
  //     this.showAppointment = false;
  //     this.showDoctor = false;
  //     document.getElementById("patient-nav")!.style.backgroundColor = "#ff5722";
  //     document.getElementById("appointment-nav")!.style.backgroundColor = "transparent";
  //     document.getElementById("doctor-nav")!.style.backgroundColor = "transparent";
  //   } else if (this.showPatient == true) {
  //     this.showPatient = false;
  //     document.getElementById("patient-nav")!.style.backgroundColor = "transparent";
  //   }
  // }

  // showDoctors() {
  //   if (this.showDoctor == false) {
  //     this.showDoctor = true;
  //     this.showPatient = false;
  //     this.showAppointment = false;
  //     document.getElementById("doctor-nav")!.style.backgroundColor = "#ff5722";
  //     document.getElementById("appointment-nav")!.style.backgroundColor = "transparent";
  //     document.getElementById("patient-nav")!.style.backgroundColor = "transparent";
  //   } else if (this.showDoctor == true) {
  //     this.showDoctor = false;
  //     document.getElementById("doctor-nav")!.style.backgroundColor = "transparent";
  //   }
  // }

  // showAppointments() {
  //   if (this.showAppointment == false) {
  //     this.showAppointment = true;
  //     this.showPatient = false;
  //     this.showDoctor = false;
  //     document.getElementById("appointment-nav")!.style.backgroundColor = "#ff5722";
  //     document.getElementById("patient-nav")!.style.backgroundColor = "transparent";
  //     document.getElementById("doctor-nav")!.style.backgroundColor = "transparent";
  //   } else if (this.showAppointment == true) {
  //     this.showAppointment = false;
  //     document.getElementById("appointment-nav")!.style.backgroundColor = "transparent";
  //   }
  // }

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

    this.setCurrentUserDetails(this.role);

    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationStart && (evt.url == "" || evt.navigationTrigger == "popstate" || evt.navigationTrigger == "hashchange")) {
        this.logout();
        this.router.navigate(['/login']);
      }
    })
  }

}
