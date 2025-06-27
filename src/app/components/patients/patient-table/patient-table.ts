// src/app/patient-dashboard/patient-dashboard.component.ts
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../../services/patient.service';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

export interface Patient {
  patientID: number;
  userID: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  contactNumber: string;
  address: string;
  medicalHistory: string;
  allergies: string;
  currentMedications: string;
  createdAt: string;
  modifiedAt: string;
  isActive: boolean;
}

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatSortModule,
    MatPaginatorModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './patient-table.html',
  styleUrls: ['./patient-table.scss']
})
export class PatientTable implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'patientID',
    'userID',
    'firstName',
    'lastName',
    'dateOfBirth',
    'gender',
    'contactNumber',
    'address',
    'medicalHistory',
    'allergies',
    'currentMedications',
    'createdat',
    'modifiedat',
    'isactive',
    'actions'
  ];

  dataSource = new MatTableDataSource<Patient>([]);
  isLoading = true;
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  currentSortField = 'PatientID'; // Match backend column name
  currentSortDirection: 'asc' | 'desc' = 'asc';

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private patientService: PatientService) {}

  ngOnInit() {
    this.loadPatients();
  }

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => {
      if (this.paginator) {
        this.paginator.firstPage();
      }
      this.onSortChange(this.sort);
    });
  }

  loadPatients() {
    this.isLoading = true;
    this.patientService.getPatients(
      [this.currentSortField],
      this.currentSortDirection,
      this.currentPage + 1,
      this.pageSize
    ).subscribe({
      next: (response) => {
        console.log(response.data);
        this.dataSource.data = response.data;
        console.log(this.dataSource.data);
        this.totalItems = response.totalCount;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load patients', err);
        this.isLoading = false;
      }
    });
  }

  onSortChange(sortState: Sort) {
    // Map frontend column names to backend column names
    const columnMapping: { [key: string]: string } = {
      'patientID': 'PatientID',
      'userID': 'UserID',
      'firstName': 'FirstName',
      'lastName': 'LastName',
      'dateOfBirth': 'DateOfBirth',
      'gender': 'Gender',
      'contactNumber': 'ContactNumber',
      'address': 'Address',
      'medicalHistory': 'MedicalHistory',
      'allergies': 'Allergies',
      'currentMedications': 'CurrentMedications',
      'createdat': 'CreatedAt',
      'modifiedat': 'ModifiedAt',
      'isactive': 'isActive',
    };

    this.currentSortField = columnMapping[sortState.active] || sortState.active;
    this.currentSortDirection = sortState.direction as 'asc' | 'desc';
    this.loadPatients();
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPatients();
  }

  editPatient(patientID: number) {
    console.log('Edit patient:', patientID);
    // Navigate to edit page
    // this.router.navigate(['/patients/edit', patientID]);
  }

  deletePatient(patientID: number) {
    if (confirm('Are you sure you want to delete this patient?')) {
      this.isLoading = true;
      this.patientService.deletePatient(patientID).subscribe({
        next: () => {
          this.loadPatients();
          console.log('Patient deleted successfully');
        },
        error: (err) => {
          console.error('Failed to delete patient', err);
          this.isLoading = false;
        }
      });
    }
  }

  viewPatientDetails(patientID: number) {
    console.log('View patient details:', patientID);
    // Navigate to patient details page
    // this.router.navigate(['/patients/details', patientID]);
  }
}
