// src/app/components/patients/patient-table/patient-table.ts
import { Component, AfterViewInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, merge, of } from 'rxjs';
import { catchError, filter, map, startWith, switchMap } from 'rxjs/operators';
import { Patient } from '../../models/patient.model';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

interface PagedResult<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

@Component({
  selector: 'app-patient-table',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './patient-table.html',
  styleUrl: './patient-table.scss',
})
export class PatientTable implements AfterViewInit {
  private http = inject(HttpClient);

  displayedColumns: string[] = [
    'firstName', 'lastName', 'dateOfBirth', 'gender',
    'contactNumber', 'address', 'medicalHistory', 'allergies', 'currentMedications',
    'actions'
  ];

  dataSource = new MatTableDataSource<Patient>();

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;


  private baseUrl = 'http://localhost:5122/api/patient';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('filterInput') filterInput!: any;

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.getPatients(
            this.paginator.pageIndex + 1,
            this.paginator.pageSize,
            this.sort.active,
            this.sort.direction,
            this.getFilterValue()
          ).pipe(catchError(() => of(null)));
        }),
        map(data => {
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;

          if (data === null) {
            return [];
          }

          this.resultsLength = data.totalCount;
          return data.data;
        })
      )
      .subscribe(data => this.dataSource.data = data);
  }

  getPatients(pageNumber: number, pageSize: number, sort?: string, order: string = "asc", query?: string): Observable<PagedResult<Patient>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    if (sort && order) {
      params = params.set('sort', sort).set('order', order);
    }

    if (query && query.trim()) {
      params = params.set('query', query.trim());
    }

    return this.http.get<PagedResult<Patient>>(`${this.baseUrl}/search-lucene`, { params });
  }

  applyFilter() {
    this.paginator.pageIndex = 0;
    this.loadData();
  }

  clearFilter(): void {
    if (this.filterInput) {
      this.filterInput.nativeElement.value = '';
      this.paginator.pageIndex = 0;
      this.loadData();
    }
  }

  private getFilterValue(): string {
    return this.filterInput?.nativeElement?.value || '';
  }

  // onSort() {
  //   this.sort._stateChange
  // }

  private loadData(): void {
    this.isLoadingResults = true;
    this.getPatients(
      this.paginator.pageIndex + 1,
      this.paginator.pageSize,
      this.sort.active,
      this.sort.direction,
      this.getFilterValue()
    ).subscribe({
      next: (data) => {
        this.isLoadingResults = false;
        this.resultsLength = data.totalCount;
        this.dataSource.data = data.data;
      },
      error: () => {
        this.isLoadingResults = false;
        this.isRateLimitReached = true;
      }
    });
  }

  editRow(row: any) {
    //
  }

  confirmDelete(row: any) {
    Swal.fire({
      title: 'Confirm Deletion',
      text: 'This will permanently remove the patient record.',
      icon: 'warning',

      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',

    }).then(result => {
      if (result.isConfirmed) {
        this.deleteRow(row);
      }
    });
  }

  deleteRow(row: Patient) {
    let params = new HttpParams()
      .set('pageNumber', (this.paginator.pageIndex + 1).toString())
      .set('pageSize',   this.paginator.pageSize.toString());

    if (this.sort.active && this.sort.direction) {
      params = params
        .set('sort', this.sort.active)
        .set('order', this.sort.direction);
    }

    params = params
      .set('firstName',        row.firstName)
      .set('lastName',         row.lastName)
      .set('dateOfBirth',      row.dateOfBirth)
      .set('contactNumber',    row.contactNumber)
      .set('medicalHistory',   row.medicalHistory)
      .set('allergies',        row.allergies)
      .set('currentMedications', row.currentMedications);

    this.http
      .get<PagedResult<Patient>>(`${this.baseUrl}/search`, { params })
      .subscribe({
        next: (data): void => {
          const match = data.data.find(p =>
            p.firstName        === row.firstName       &&
            p.lastName         === row.lastName        &&
            p.dateOfBirth      === row.dateOfBirth     &&
            p.contactNumber    === row.contactNumber  &&
            p.medicalHistory   === row.medicalHistory &&
            p.allergies        === row.allergies      &&
            p.currentMedications === row.currentMedications
          );

          if (!match) {
            Swal.fire('Error', 'Patient not found for deletion', 'error');
            return;
          }

          const id = match?.patientID ?? (match as any).PatientID;
          if (!id) {
            Swal.fire('Error', 'No ID available to delete', 'error');
            return;
          }

          this.http.delete(`http://localhost:5122/api/patient/${id}`)
            .subscribe({
              next: () => {
                Swal.fire('Deleted', 'Patient removed successfully', 'success');
                this.loadData();
              },
              error: () => {
                Swal.fire('Error', 'Deletion failed', 'error')
              }
            });
        },
        error: () => {
          Swal.fire('Error', 'Failed to fetch for delete', 'error')
        }
      });
  }

}

