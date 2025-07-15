import { CommonModule } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationStart, Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CurrentAppointmentsDTO } from '../../models/CurrentAppointmentsDTO';
import { MatExpansionModule } from '@angular/material/expansion'
import Swal from 'sweetalert2';

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
    MatTableModule,
    MatExpansionModule
  ],
  templateUrl: './doctor-home.html',
  styleUrl: './doctor-home.scss'
})
export class DoctorHome {
  constructor(private router: Router) { }
  private http = inject(HttpClient);

  displayedColumns: string[] = [
    'appointmentID',
    'date',
    'patientName',
    'reason',
    'status',
    'dob',
    'gender',
    'contact',
    'medicalHistory',
    'allergies',
    'currentMedications',
    'notes',
  ];

  baseUrl = "http://localhost:5122/api/doctor"

  dataSource = new MatTableDataSource<CurrentAppointmentsDTO>([]);

  ngOnInit(): void {
    this.loadAppointments();
  }

  private loadAppointments(doctorId?: number, statusFilter?: string): void {
    const params: any = {};
    if (doctorId != null)    params.doctorId     = doctorId;
    if (statusFilter)        params.statusFilter = statusFilter;

    this.http
      .get<CurrentAppointmentsDTO[]>(`${this.baseUrl}/proc`, { params })
      .subscribe({
        next: appointments => {
          this.dataSource.data = appointments;
        },
        error: err => {
          Swal.fire('Error', err || 'Failed data fetch', 'error')
        }
      });
  }

  logout() {
    fetch('http://localhost:5122/api/auth/logout', {
      method: 'POST'
    })
    this.router.navigate(['/login']);
  }

}
