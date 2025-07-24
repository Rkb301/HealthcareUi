import { AppointmentCreationDTO } from './../../models/appointment.model';
import { Specialization } from './../book-appointment-dialog/book-appointment-dialog';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { NavigationStart, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule } from '@angular/material/dialog'
import { BookAppointmentDialog } from '../book-appointment-dialog/book-appointment-dialog';
import { LoginService } from '../../services/login.service';
import { Appointment } from '../../models/appointment.model';
import { PatientDetailsService } from '../../services/patient-details.service';

// Models
interface PatientAppointment {
  date: string;
  time: string;
  doctor: string;
  reason: string;
  status: string;
}

interface Prescription {
  prescriptionID: number;
  medicationName: string;
  dosage: string;
  frequency: string;
  startDate: string;
  endDate: string;
  refillsRemaining: number;
  status: string;
}

interface LabResult {
  labID: number;
  testName: string;
  result: string;
  normalRange: string;
  date: string;
  status: string;
}

interface Doctor {
  doctorID: number;
  firstName: string;
  lastName: string;
  specialty: string;
  officeHours: string;
  phone: string;
  email: string;
}

interface Notification {
  notificationID: number;
  message: string;
  type: string;
  date: string;
  priority: string;
  dismissed: boolean;
}

@Component({
  selector: 'app-patient-home',
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatTabsModule,
    MatBadgeModule,
    MatChipsModule,
    MatDialogModule
  ],
  templateUrl: './patient-home.html',
  styleUrl: './patient-home.scss'
})
export class PatientHome implements OnInit {
  constructor(
    private router: Router,
    private dialog: MatDialog
  ) {}

  private readonly http = inject(HttpClient);
  private readonly loginService = inject(LoginService);
  private readonly patientDetailsService = inject(PatientDetailsService);

  // data sources
  upcomingAppointments: PatientAppointment[] = [];
  activePrescriptions: Prescription[] = [];
  recentLabResults: LabResult[] = [];
  primaryDoctor: Doctor | null = null;
  notifications: Notification[] = [];

  // API endpoints (more to be added as needed)
  patientUrl = "http://localhost:5122/api/patient";
  appointmentUrl = "http://localhost:5122/api/appointment";

  // display columns for tables
  appointmentColumns: string[] = ['date', 'time', 'doctor', 'reason', 'status', 'actions'];
  prescriptionColumns: string[] = ['medicationName', 'dosage', 'frequency', 'refillsRemaining', 'actions'];
  labResultColumns: string[] = ['testName', 'result', 'normalRange', 'date', 'status'];


  specialistOptions: Specialization[] = [
    {specialization: 'Cardiology' },
    {specialization: 'Dermatology' },
    {specialization: 'General Medicine' },
    {specialization: 'Neurology' },
    {specialization: 'Orthopedics' },
    {specialization: 'Pediatrics' },
  ]

  // data sources for tables
  appointmentDataSource = new MatTableDataSource<PatientAppointment>([]);
  prescriptionDataSource = new MatTableDataSource<Prescription>([]);
  labResultDataSource = new MatTableDataSource<LabResult>([]);

  ngOnInit(): void {
    this.loadPatientData();

    // logout on refresh (local cookie storage not implemented)
    if (!this.loginService.isLoggedIn()) {
      this.logout()
      this.router.navigate(['/login'])
    }

    // prevent entry into app via browser back button or forward
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationStart && (evt.url == "" || evt.navigationTrigger == "popstate" || evt.navigationTrigger == "hashchange")) {
        this.logout();
        this.router.navigate(['/login']);
      }
    })
  }

    // Swal.fire({
    //   title: 'Leaving page',
    //   text: 'This will log you out!',
    //   icon: 'warning',
    //   showCancelButton: true,
    //   confirmButtonText: 'Yes, log out',
    //   cancelButtonText: 'No, take me back'
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     event.preventDefault()
    //     this.logout()
    //     this.router.navigate(['/login'])
    //   }
    // });

  /* data loading methods */
  private loadPatientData(): void {
    this.loadUpcomingAppointments();
    // this.loadActivePrescriptions();
    // this.loadRecentLabResults();
    // this.loadPrimaryDoctor();
    // this.loadNotifications();
  }

  private loadUpcomingAppointments(): void {
    const headers = {'Authorization': `Bearer ${this.loginService.getToken()}`}
    this.http.get<PatientAppointment[]>(`${this.patientUrl}/proc`, {headers})
      .subscribe({
        next: (response) => {
          this.upcomingAppointments = response;
          this.appointmentDataSource.data = response;
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
          } else {
            // regular error popup if signed in
            Swal.fire("Error", `Could not load upcoming appointments (${error.statusText})`, "error");
          }
        }
      })
  };

  /* action methods */
  bookNewAppointment(): void {
    const ref = this.dialog.open(BookAppointmentDialog, {
      width: '400px',
      data: this.specialistOptions
    });

    ref.afterClosed()
      .subscribe(result => {
        // result = {date, doctorChoice, reason, specialization, time}
        if (result) {
          this.createAppointment(result);
      }
    })
  }

  createAppointment(result: any) {
    console.log(result);

    this.patientDetailsService.currentPatientId // patient id, to be sent in req
    result.doctorChoice // doctor id, to be sent in req

    const newAppointmentDate = this.formatToSqlTimestamp(result.date); // appointment date, to be sent in req
    console.log(newAppointmentDate);

    result.reason // reason, to be sent in req
    const notes = "None"; // notes, for after appointment by doctor, to be sent in req as blank/ N/A / None
    const status = "Scheduled"; // status, to be sent in req
    const isActive = "true"; // deletion check (isActive field), to be sent in req

    const newAppointment: AppointmentCreationDTO = {
      patientID: this.patientDetailsService.currentPatientId!,
      doctorID: result.doctorChoice,
      appointmentDate: newAppointmentDate,
      reason: result.reason,
      notes: notes,
      status: status,
      isActive: isActive
    }

    console.log(newAppointment);

    const headers = {'Authorization': `Bearer ${this.loginService.getToken()}`}
    const response = this.http.post(`${this.appointmentUrl}`, newAppointment, { headers })

    response.subscribe({
      next: (res) => {
        Swal.fire('Success', 'Appointment booking confirmed!', 'success');
      },
      error: (err) => {
        Swal.fire('Error', 'Appointment booking failed!', 'error');
      },
      complete: () => {
        this.loadUpcomingAppointments();
      }
    })
  }

  navToDashboard() {
    this.router.navigate(['/dashboard'])
  }

  healthRecordsNav() {
    Swal.fire({
      title: 'Health Records',
      text: `View your past appointments and prescriptions
      (not implemented yet)
      `,
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  billingNav() {
    Swal.fire({
      title: 'Billing',
      text: `View your leftover payments or make a payment for your latest visit
      (not implemented yet)
      `,
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  rescheduleAppointment(appointmentID: number): void {
    Swal.fire({
      title: 'Reschedule Appointment',
      text: `Rescheduling appointment ${appointmentID}
      (not implemented yet)
      `,
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  cancelAppointment(appointmentID: number): void {
    Swal.fire({
      title: 'Cancel Appointment',
      text: `Are you sure you want to cancel appointment ${appointmentID}?
      (not implemented yet)
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        // cancel appointment requires changes to API (to be implemented next)
        // this.cancelRequest();
        Swal.fire('Cancelled!', 'Your appointment has been cancelled.', 'success');
      }
    });
  }

  requestRefill(prescriptionID: number): void {
    Swal.fire({
      title: 'Request Refill',
      text: `Requesting refill for prescription ${prescriptionID}`,
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  messageDoctor(): void {
    Swal.fire({
      title: 'Message Doctor',
      text: 'Secure messaging functionality will be implemented here.',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  contactDoctor(): void {
    if (this.primaryDoctor) {
      Swal.fire({
        title: 'Contact Information',
        html: `
          <div style="text-align: left;">
            <p><strong>Phone:</strong> ${this.primaryDoctor.phone}</p>
            <p><strong>Email:</strong> ${this.primaryDoctor.email}</p>
            <p><strong>Office Hours:</strong> ${this.primaryDoctor.officeHours}</p>
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'OK'
      });
    }
  }

  // notifications have been put off for now
  dismissNotification(notificationID: number): void {
    this.notifications = this.notifications.filter(n => n.notificationID !== notificationID);
  }

  // for the mat components color themeing
  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'primary';
      case 'pending': return 'warn';
      case 'completed': return 'accent';
      case 'normal': return 'primary';
      case 'high': return 'warn';
      case 'low': return 'warn';
      default: return 'primary';
    }
  }

  formatToSqlTimestamp(dateInput: string): string {
    const dt = new Date(dateInput);

    const pad = (num: number, size = 2) =>
      num.toString().padStart(size, '0');

    const year   = dt.getFullYear();
    const month  = pad(dt.getMonth() + 1);
    const day    = pad(dt.getDate());
    const hours  = pad(dt.getHours());
    const mins   = pad(dt.getMinutes());
    const secs   = pad(dt.getSeconds());
    const millis = pad(dt.getMilliseconds(), 3);

    return `${year}-${month}-${day} ${hours}:${mins}:${secs}.${millis}`;
  }

  async cancelRequest() {
    const response = await fetch(`${this.appointmentUrl}/`, {
      method: "DELETE",
      headers: {
        'Authorization': `Bearer ${this.loginService.getToken()}`
      }
    })
  }

  logout(): void {
    fetch('http://localhost:5122/api/auth/logout', {
      method: 'POST'
    });
    this.router.navigate(['/login']);
  }
}
