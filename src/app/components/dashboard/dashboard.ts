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

  navToPatientHome() {
    this.router.navigate(['/patient'])
  }

  navToDoctorHome() {
    this.router.navigate(['/doctor'])
  }

  showPatients() {
    if (this.showPatient == false) {
      this.showPatient = true;
      this.showAppointment = false;
      this.showDoctor = false;
      document.getElementById("patient-nav")!.style.backgroundColor = "#ff5722";
      document.getElementById("appointment-nav")!.style.backgroundColor = "transparent";
      document.getElementById("doctor-nav")!.style.backgroundColor = "transparent";
    } else if (this.showPatient == true) {
      this.showPatient = false;
      document.getElementById("patient-nav")!.style.backgroundColor = "transparent";
    }
  }

  showDoctors() {
    if (this.showDoctor == false) {
      this.showDoctor = true;
      this.showPatient = false;
      this.showAppointment = false;
      document.getElementById("doctor-nav")!.style.backgroundColor = "#ff5722";
      document.getElementById("appointment-nav")!.style.backgroundColor = "transparent";
      document.getElementById("patient-nav")!.style.backgroundColor = "transparent";
    } else if (this.showDoctor == true) {
      this.showDoctor = false;
      document.getElementById("doctor-nav")!.style.backgroundColor = "transparent";
    }
  }

  showAppointments() {
    if (this.showAppointment == false) {
      this.showAppointment = true;
      this.showPatient = false;
      this.showDoctor = false;
      document.getElementById("appointment-nav")!.style.backgroundColor = "#ff5722";
      document.getElementById("patient-nav")!.style.backgroundColor = "transparent";
      document.getElementById("doctor-nav")!.style.backgroundColor = "transparent";
    } else if (this.showAppointment == true) {
      this.showAppointment = false;
      document.getElementById("appointment-nav")!.style.backgroundColor = "transparent";
    }
  }

  logout() {
    fetch('http://localhost:5122/api/auth/logout', {
      method: 'POST'
    })
    this.router.navigate(['/login']);
  }

  ngOnInit() {
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationStart && (evt.url == "" || evt.navigationTrigger == "popstate" || evt.navigationTrigger == "hashchange")) {
        this.logout();
        this.router.navigate(['/login']);
      }
    })
  }

}
