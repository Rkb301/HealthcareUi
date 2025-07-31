import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LoginService } from '../../services/login.service';
import { TableShell } from '../table-shell/table-shell';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-appointment-table',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatIconModule,
    ReactiveFormsModule,
    TableShell
  ],
  templateUrl: './appointment-table.html',
  styleUrls: ['./appointment-table.scss']
})
export class AppointmentTable implements OnInit {
  private http = inject(HttpClient);
  private loginService = inject(LoginService);

  // Simple properties
  displayedColumns = ['patientName', 'doctorName', 'appointmentDate', 'reason', 'status', 'actions'];
  dataSource = new MatTableDataSource<any>([]);
  searchControl = new FormControl('');
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private baseUrl = 'http://localhost:5122/api/appointment';
  private headers = { 'Authorization': `Bearer ${this.loginService.getToken()}` };

  ngOnInit() {
    this.loadData();
    this.setupSearch();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // Simple data loading
  loadData() {
    this.isLoading = true;
    this.http.get<any>(this.baseUrl, { headers: this.headers }).subscribe({
      next: (response) => {
        this.dataSource.data = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.isLoading = false;
      }
    });
  }

  // Simple search
  setupSearch() {
    this.searchControl.valueChanges.subscribe(value => {
      this.dataSource.filter = (value || '').trim().toLowerCase();
    });
  }

  clearSearch() {
    this.searchControl.setValue('');
  }

  // Simple CRUD operations
  createAppointment() {
    Swal.fire({
      title: 'New Appointment',
      html: `
        <input id="patientID" class="swal2-input" placeholder="Patient ID" type="number">
        <input id="doctorID" class="swal2-input" placeholder="Doctor ID" type="number">
        <input id="appointmentDate" class="swal2-input" placeholder="Date" type="date">
        <input id="reason" class="swal2-input" placeholder="Reason">
        <input id="status" class="swal2-input" placeholder="Status" value="Scheduled">
      `,
      showCancelButton: true,
      confirmButtonText: 'Create',
      preConfirm: () => {
        const patientID = (document.getElementById('patientID') as HTMLInputElement).value;
        const doctorID = (document.getElementById('doctorID') as HTMLInputElement).value;
        const appointmentDate = (document.getElementById('appointmentDate') as HTMLInputElement).value;
        const reason = (document.getElementById('reason') as HTMLInputElement).value;
        const status = (document.getElementById('status') as HTMLInputElement).value;

        if (!patientID || !doctorID || !appointmentDate || !reason) {
          Swal.showValidationMessage('Please fill all required fields');
          return false;
        }

        return { patientID: +patientID, doctorID: +doctorID, appointmentDate, reason, status };
      }
    }).then(result => {
      if (result.isConfirmed) {
        this.http.post(this.baseUrl, result.value, { headers: this.headers }).subscribe({
          next: () => {
            Swal.fire('Success', 'Appointment created', 'success');
            this.loadData();
          },
          error: () => Swal.fire('Error', 'Failed to create appointment', 'error')
        });
      }
    });
  }

  editAppointment(row: any) {
    Swal.fire({
      title: 'Edit Appointment',
      html: `
        <input id="appointmentDate" class="swal2-input" value="${row.appointmentDate}">
        <input id="reason" class="swal2-input" value="${row.reason}">
        <input id="status" class="swal2-input" value="${row.status}">
      `,
      showCancelButton: true,
      confirmButtonText: 'Save',
      preConfirm: () => {
        const appointmentDate = (document.getElementById('appointmentDate') as HTMLInputElement).value;
        const reason = (document.getElementById('reason') as HTMLInputElement).value;
        const status = (document.getElementById('status') as HTMLInputElement).value;

        return { appointmentDate, reason, status };
      }
    }).then(result => {
      if (result.isConfirmed) {
        this.http.put(`${this.baseUrl}/${row.appointmentID}`, result.value, { headers: this.headers }).subscribe({
          next: () => {
            Swal.fire('Success', 'Appointment updated', 'success');
            this.loadData();
          },
          error: () => Swal.fire('Error', 'Failed to update appointment', 'error')
        });
      }
    });
  }

  deleteAppointment(row: any) {
    Swal.fire({
      title: 'Delete Appointment',
      text: 'Are you sure you want to delete this appointment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`${this.baseUrl}/${row.appointmentID}`, { headers: this.headers }).subscribe({
          next: () => {
            Swal.fire('Deleted', 'Appointment deleted', 'success');
            this.loadData();
          },
          error: () => Swal.fire('Error', 'Failed to delete appointment', 'error')
        });
      }
    });
  }
}
