import { Component, Inject, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  stats = [
    {
      name: 'Patients',
      icon: '👨‍💼',
      route: '/patients',
      description: 'Manage patient records'
    },
    {
      name: 'Doctors',
      icon: '👨‍⚕️',
      route: '/doctors',
      description: 'View and edit doctor information'
    },
    {
      name: 'Appointments',
      icon: '📅',
      route: '/appointments',
      description: 'Schedule and view appointments'
    }
  ];

  private router = inject(Router);

  navToPatients() {
    this.router.navigate(['/patients'])
  }

  navToDoctors() {
    this.router.navigate(['/doctors'])
  }

  navToAppointments() {
    this.router.navigate(['/appointments'])
  }

}
