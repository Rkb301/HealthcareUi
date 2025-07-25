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
import { MatTabsModule } from '@angular/material/tabs'
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
    MatExpansionModule,
    MatTabsModule
  ],
  templateUrl: './doctor-home.html',
  styleUrl: './doctor-home.scss'
})
export class DoctorHome {
  constructor(private router: Router) { }
  private http = inject(HttpClient);
  private loginService = inject(LoginService);

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
    this.loadAppointments(this.loginService.getDoctorID());
  }

  navToDashboard() {
    this.router.navigate(['/dashboard'])
  }

  private loadAppointments(doctorId?: number, statusFilter?: string): void {
    const params: any = {};
    if (doctorId != null)    params.doctorId     = doctorId;
    if (statusFilter) params.statusFilter = statusFilter;

    const headers = {'Authorization': `Bearer ${this.loginService.getToken()}`}

    this.http
      .get<CurrentAppointmentsDTO[]>(`${this.baseUrl}/proc`, { params, headers})
      .subscribe({
        next: appointments => {
          this.dataSource.data = appointments;
        },
        error: (error) => {
          if (error.statusText == "Unauthorized") {
            // return to login if signed out (by refresh action or similar)
            Swal.fire({
              title: 'Warning',
              text: 'Logged out! (Page refresh logs you out!)',
              icon: 'warning'
            }).then((result) => {
              if (result.isDismissed || result.isConfirmed) {
                this.logout()
                this.router.navigate(['/login'])
              }
            });
          }
          else {
            // regular error popup if signed in
            Swal.fire("Error", `Could not load upcoming appointments (${error.statusText})`, "error");
          }
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
