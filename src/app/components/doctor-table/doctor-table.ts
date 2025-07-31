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
  selector: 'app-doctor-table',
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
  templateUrl: './doctor-table.html',
  styleUrls: ['./doctor-table.scss']
})
export class DoctorTable implements OnInit {
  private http = inject(HttpClient);
  private loginService = inject(LoginService);

  displayedColumns = ['firstName', 'lastName', 'specialization', 'contactNumber', 'email', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  searchControl = new FormControl('');

  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  private baseUrl = 'http://localhost:5122/api/doctor';
  private headers = { 'Authorization': `Bearer ${this.loginService.getToken()}` };

  ngOnInit() {
    this.loadData();
    this.setupSearch();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  // data loading
  loadData() {
    this.isLoading = true;
    this.http.get<any>(this.baseUrl, { headers: this.headers }).subscribe({
      next: (response) => {
        this.dataSource.data = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
        this.isLoading = false;
      }
    });
  }

  // search
  setupSearch() {
    this.searchControl.valueChanges.subscribe(value => {
      this.dataSource.filter = (value || '').trim().toLowerCase();
    });
  }

  clearSearch() {
    this.searchControl.setValue('');
  }

  // CRUD operations
  createDoctor() {
    Swal.fire({
      title: 'New Doctor',
      html: `
        <input id="firstName" class="swal2-input" placeholder="First Name">
        <input id="lastName" class="swal2-input" placeholder="Last Name">
        <input id="specialization" class="swal2-input" placeholder="Specialization">
        <input id="contactNumber" class="swal2-input" placeholder="Contact Number">
        <input id="email" class="swal2-input" type="email" placeholder="Email">
        <input id="schedule" class="swal2-input" placeholder="Schedule">
      `,
      showCancelButton: true,
      confirmButtonText: 'Create',
      preConfirm: () => {
        const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
        const lastName = (document.getElementById('lastName') as HTMLInputElement).value;
        const specialization = (document.getElementById('specialization') as HTMLInputElement).value;
        const contactNumber = (document.getElementById('contactNumber') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const schedule = (document.getElementById('schedule') as HTMLInputElement).value;

        if (!firstName || !lastName || !specialization || !contactNumber || !email) {
          Swal.showValidationMessage('Please fill all required fields');
          return false;
        }

        return { firstName, lastName, specialization, contactNumber, email, schedule };
      }
    }).then(result => {
      if (result.isConfirmed) {
        this.http.post(this.baseUrl, result.value, { headers: this.headers }).subscribe({
          next: () => {
            Swal.fire('Success', 'Doctor created', 'success');
            this.loadData();
          },
          error: () => Swal.fire('Error', 'Failed to create doctor', 'error')
        });
      }
    });
  }

  editDoctor(row: any) {
    Swal.fire({
      title: 'Edit Doctor',
      html: `
        <input id="firstName" class="swal2-input" value="${row.firstName}">
        <input id="lastName" class="swal2-input" value="${row.lastName}">
        <input id="specialization" class="swal2-input" value="${row.specialization}">
        <input id="contactNumber" class="swal2-input" value="${row.contactNumber}">
        <input id="email" class="swal2-input" type="email" value="${row.email}">
        <input id="schedule" class="swal2-input" value="${row.schedule || ''}">
      `,
      showCancelButton: true,
      confirmButtonText: 'Save',
      preConfirm: () => {
        const firstName = (document.getElementById('firstName') as HTMLInputElement).value;
        const lastName = (document.getElementById('lastName') as HTMLInputElement).value;
        const specialization = (document.getElementById('specialization') as HTMLInputElement).value;
        const contactNumber = (document.getElementById('contactNumber') as HTMLInputElement).value;
        const email = (document.getElementById('email') as HTMLInputElement).value;
        const schedule = (document.getElementById('schedule') as HTMLInputElement).value;

        return { firstName, lastName, specialization, contactNumber, email, schedule };
      }
    }).then(result => {
      if (result.isConfirmed) {
        this.http.put(`${this.baseUrl}/${row.doctorID}`, result.value, { headers: this.headers }).subscribe({
          next: () => {
            Swal.fire('Success', 'Doctor updated', 'success');
            this.loadData();
          },
          error: () => Swal.fire('Error', 'Failed to update doctor', 'error')
        });
      }
    });
  }

  deleteDoctor(row: any) {
    Swal.fire({
      title: 'Delete Doctor',
      text: 'Are you sure you want to delete this doctor?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete'
    }).then(result => {
      if (result.isConfirmed) {
        this.http.delete(`${this.baseUrl}/${row.doctorID}`, { headers: this.headers }).subscribe({
          next: () => {
            Swal.fire('Deleted', 'Doctor deleted', 'success');
            this.loadData();
          },
          error: () => Swal.fire('Error', 'Failed to delete doctor', 'error')
        });
      }
    });
  }
}
