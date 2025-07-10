import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationStart, Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-doctor-home',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule
  ],
  templateUrl: './doctor-home.html',
  styleUrl: './doctor-home.scss'
})
export class DoctorHome {
  constructor (private router: Router) {}

  displayedColumns = [

  ]

  dataSource = new MatTableDataSource();

  ngOnInit() {
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationStart && evt.navigationTrigger === 'popstate') {
        this.logout();
        this.router.navigate(['/login']);
      }
    })

    this.dataSource.data = [
      {
        AppointmentID: 101,
        PatientID: 201,
        DoctorID: 301,
        AppointmentDate: '2025-07-10T09:30:00',
        Reason: 'Routine Checkup',
        Status: 'Scheduled',
        Notes: 'Patient requested blood pressure check.',
        PatientFirstName: 'John',
        PatientLastName: 'Doe',
        PatientDateOfBirth: '1985-04-15',
        PatientGender: 'Male',
        PatientContactNumber: '+1-555-1234',
        PatientMedicalHistory: 'Hypertension',
        PatientAllergies: 'Penicillin',
        PatientCurrentMedications: 'Lisinopril'
      },
      {
        AppointmentID: 102,
        PatientID: 202,
        DoctorID: 301,
        AppointmentDate: '2025-07-10T10:15:00',
        Reason: 'Follow-up Visit',
        Status: 'Completed',
        Notes: 'Discussed lab results; all within normal range.',
        PatientFirstName: 'Mary',
        PatientLastName: 'Smith',
        PatientDateOfBirth: '1990-11-22',
        PatientGender: 'Female',
        PatientContactNumber: '+1-555-5678',
        PatientMedicalHistory: 'Asthma',
        PatientAllergies: 'None',
        PatientCurrentMedications: 'Albuterol'
      },
      {
        AppointmentID: 103,
        PatientID: 203,
        DoctorID: 302,
        AppointmentDate: '2025-07-10T11:00:00',
        Reason: 'New Patient Consultation',
        Status: 'Scheduled',
        Notes: 'Initial consult for knee pain.',
        PatientFirstName: 'Carlos',
        PatientLastName: 'Garcia',
        PatientDateOfBirth: '1978-02-05',
        PatientGender: 'Male',
        PatientContactNumber: '+1-555-9012',
        PatientMedicalHistory: 'None',
        PatientAllergies: 'Latex',
        PatientCurrentMedications: 'None'
      },
      {
        AppointmentID: 104,
        PatientID: 204,
        DoctorID: 301,
        AppointmentDate: '2025-07-10T13:30:00',
        Reason: 'Prescription Refill',
        Status: 'Cancelled',
        Notes: 'Patient cancelled due to travel.',
        PatientFirstName: 'Anita',
        PatientLastName: 'Kapoor',
        PatientDateOfBirth: '1965-07-30',
        PatientGender: 'Female',
        PatientContactNumber: '+1-555-3456',
        PatientMedicalHistory: 'Diabetes Type II',
        PatientAllergies: 'Sulfa Drugs',
        PatientCurrentMedications: 'Metformin'
      },
      {
        AppointmentID: 105,
        PatientID: 205,
        DoctorID: 302,
        AppointmentDate: '2025-07-10T14:15:00',
        Reason: 'Lab Work Review',
        Status: 'Scheduled',
        Notes: 'Review cholesterol panel.',
        PatientFirstName: 'Wei',
        PatientLastName: 'Zhang',
        PatientDateOfBirth: '1982-09-10',
        PatientGender: 'Female',
        PatientContactNumber: '+1-555-7890',
        PatientMedicalHistory: 'High Cholesterol',
        PatientAllergies: 'None',
        PatientCurrentMedications: 'Atorvastatin'
      }
    ];

  }

  logout() {
    fetch('http://localhost:5122/api/auth/logout', {
      method: 'POST'
    })
    this.router.navigate(['/login']);
  }

}
