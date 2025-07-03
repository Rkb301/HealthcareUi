import { Component, Inject, inject, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
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

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    PatientTable,
    DoctorTable,
    AppointmentTable,
],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  encapsulation: ViewEncapsulation.None
})
export class Dashboard {
  constructor(private loginService: LoginService) { }

  showPatient = false;
  showDoctor = false;
  showAppointment = false;

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

  private router = inject(Router);

  navToPatients() {
    this.router.navigateByUrl('/patients')
  }

  navToDoctors() {
    this.router.navigate(['/doctors'])
  }

  navToAppointments() {
    this.router.navigate(['/appointments'])
  }

  showPatients() {
    if (this.showPatient == false) {
      this.showPatient = true;
    } else if (this.showPatient == true) {
      this.showPatient = false;
    }
  }

  showDoctors() {
    if (this.showDoctor == false) {
      this.showDoctor = true;
    } else if (this.showDoctor == true) {
      this.showDoctor = false;
    }
  }

  showAppointments() {
    if (this.showAppointment == false) {
      this.showAppointment = true;
    } else if (this.showAppointment == true) {
      this.showAppointment = false;
    }
  }

  logout() {
    fetch('http://localhost:5122/api/auth/logout', {
      method: 'POST'
    })
    this.router.navigate(['/login']);
  }

}
