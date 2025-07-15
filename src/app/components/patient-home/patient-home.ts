import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

// Models
interface PatientAppointment {
  appointmentID: number;
  date: string;
  doctorName: string;
  reason: string;
  status: string;
  time: string;
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
    MatChipsModule
  ],
  templateUrl: './patient-home.html',
  styleUrl: './patient-home.scss'
})
export class PatientHome implements OnInit {
  constructor(private router: Router) {}
  private http = inject(HttpClient);

  // Data sources
  upcomingAppointments: PatientAppointment[] = [];
  activePrescriptions: Prescription[] = [];
  recentLabResults: LabResult[] = [];
  primaryDoctor: Doctor | null = null;
  notifications: Notification[] = [];

  // API endpoints
  baseUrl = "http://localhost:5122/api/patient";

  // Display columns for tables
  appointmentColumns: string[] = ['date', 'time', 'doctorName', 'reason', 'status', 'actions'];
  prescriptionColumns: string[] = ['medicationName', 'dosage', 'frequency', 'refillsRemaining', 'actions'];
  labResultColumns: string[] = ['testName', 'result', 'normalRange', 'date', 'status'];

  // Data sources for tables
  appointmentDataSource = new MatTableDataSource<PatientAppointment>([]);
  prescriptionDataSource = new MatTableDataSource<Prescription>([]);
  labResultDataSource = new MatTableDataSource<LabResult>([]);

  ngOnInit(): void {
    this.loadPatientData();
  }

  private loadPatientData(): void {
    this.loadUpcomingAppointments();
    this.loadActivePrescriptions();
    this.loadRecentLabResults();
    this.loadPrimaryDoctor();
    this.loadNotifications();
  }

  // Load upcoming appointments
  private loadUpcomingAppointments(): void {
    this.http.get<PatientAppointment[]>(`${this.baseUrl}/appointments/upcoming`)
      .subscribe({
        next: appointments => {
          this.upcomingAppointments = appointments;
          this.appointmentDataSource.data = appointments;
        },
        error: err => {
          console.error('Error loading appointments:', err);
          // Mock data for development
          this.upcomingAppointments = [
            {
              appointmentID: 1,
              date: '2025-01-20',
              time: '10:00 AM',
              doctorName: 'Dr. Smith',
              reason: 'Regular Checkup',
              status: 'Confirmed'
            },
            {
              appointmentID: 2,
              date: '2025-01-25',
              time: '2:30 PM',
              doctorName: 'Dr. Johnson',
              reason: 'Follow-up',
              status: 'Pending'
            }
          ];
          this.appointmentDataSource.data = this.upcomingAppointments;
        }
      });
  }

  // Load active prescriptions
  private loadActivePrescriptions(): void {
    this.http.get<Prescription[]>(`${this.baseUrl}/prescriptions/active`)
      .subscribe({
        next: prescriptions => {
          this.activePrescriptions = prescriptions;
          this.prescriptionDataSource.data = prescriptions;
        },
        error: err => {
          console.error('Error loading prescriptions:', err);
          // Mock data for development
          this.activePrescriptions = [
            {
              prescriptionID: 1,
              medicationName: 'Lisinopril',
              dosage: '10mg',
              frequency: 'Once daily',
              startDate: '2025-01-01',
              endDate: '2025-04-01',
              refillsRemaining: 2,
              status: 'Active'
            },
            {
              prescriptionID: 2,
              medicationName: 'Metformin',
              dosage: '500mg',
              frequency: 'Twice daily',
              startDate: '2025-01-01',
              endDate: '2025-06-01',
              refillsRemaining: 0,
              status: 'Refill Needed'
            }
          ];
          this.prescriptionDataSource.data = this.activePrescriptions;
        }
      });
  }

  // Load recent lab results
  private loadRecentLabResults(): void {
    this.http.get<LabResult[]>(`${this.baseUrl}/lab-results/recent`)
      .subscribe({
        next: results => {
          this.recentLabResults = results;
          this.labResultDataSource.data = results;
        },
        error: err => {
          console.error('Error loading lab results:', err);
          // Mock data for development
          this.recentLabResults = [
            {
              labID: 1,
              testName: 'Blood Glucose',
              result: '95 mg/dL',
              normalRange: '70-100 mg/dL',
              date: '2025-01-10',
              status: 'Normal'
            },
            {
              labID: 2,
              testName: 'Cholesterol',
              result: '220 mg/dL',
              normalRange: '<200 mg/dL',
              date: '2025-01-10',
              status: 'High'
            }
          ];
          this.labResultDataSource.data = this.recentLabResults;
        }
      });
  }

  // Load primary doctor info
  private loadPrimaryDoctor(): void {
    this.http.get<Doctor>(`${this.baseUrl}/primary-doctor`)
      .subscribe({
        next: doctor => {
          this.primaryDoctor = doctor;
        },
        error: err => {
          console.error('Error loading primary doctor:', err);
          // Mock data for development
          this.primaryDoctor = {
            doctorID: 1,
            firstName: 'Dr. Sarah',
            lastName: 'Smith',
            specialty: 'Family Medicine',
            officeHours: 'Mon-Fri 8:00 AM - 5:00 PM',
            phone: '(555) 123-4567',
            email: 'dr.smith@healthcare.com'
          };
        }
      });
  }

  // Load notifications
  private loadNotifications(): void {
    this.http.get<Notification[]>(`${this.baseUrl}/notifications`)
      .subscribe({
        next: notifications => {
          this.notifications = notifications.filter(n => !n.dismissed);
        },
        error: err => {
          console.error('Error loading notifications:', err);
          // Mock data for development
          this.notifications = [
            {
              notificationID: 1,
              message: 'Annual physical exam due',
              type: 'reminder',
              date: '2025-01-15',
              priority: 'medium',
              dismissed: false
            },
            {
              notificationID: 2,
              message: 'Prescription refill needed for Metformin',
              type: 'prescription',
              date: '2025-01-16',
              priority: 'high',
              dismissed: false
            }
          ];
        }
      });
  }

  // Action methods
  bookNewAppointment(): void {
    // Placeholder for booking functionality
    Swal.fire({
      title: 'Book New Appointment',
      text: 'Appointment booking functionality will be implemented here.',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  rescheduleAppointment(appointmentID: number): void {
    Swal.fire({
      title: 'Reschedule Appointment',
      text: `Rescheduling appointment ${appointmentID}`,
      icon: 'info',
      confirmButtonText: 'OK'
    });
  }

  cancelAppointment(appointmentID: number): void {
    Swal.fire({
      title: 'Cancel Appointment',
      text: `Are you sure you want to cancel appointment ${appointmentID}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No'
    }).then((result) => {
      if (result.isConfirmed) {
        // API call to cancel appointment
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

  dismissNotification(notificationID: number): void {
    this.notifications = this.notifications.filter(n => n.notificationID !== notificationID);
  }

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

  logout(): void {
    fetch('http://localhost:5122/api/auth/logout', {
      method: 'POST'
    });
    this.router.navigate(['/login']);
  }
}
