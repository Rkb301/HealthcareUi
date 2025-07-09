// src/app/components/patients/patient-table/patient-table.ts
import { Component, AfterViewInit, ViewChild, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, merge, of, Subject, combineLatest } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
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
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './patient-table.html',
  styleUrl: './patient-table.scss',
})
export class PatientTable implements AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  private destroy$ = new Subject<void>();

  displayedColumns: string[] = [
    'firstName', 'lastName', 'dateOfBirth', 'gender',
    'contactNumber', 'address', 'medicalHistory', 'allergies', 'currentMedications',
    'actions'
  ];

  dataSource = new MatTableDataSource<Patient>();

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  searchControl = new FormControl('');

  private baseUrl = 'http://localhost:5122/api/patient';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.setupDynamicSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupDynamicSearch() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    const searchChanges$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      map(query => query || '')
    );

    const paginationChanges$ = merge(
      this.sort.sortChange,
      this.paginator.page
    ).pipe(startWith({}));

    combineLatest([searchChanges$, paginationChanges$])
      .pipe(
        switchMap(([query]) => {
          this.isLoadingResults = true;
          return this.getPatients(
            this.paginator.pageIndex + 1,
            this.paginator.pageSize,
            this.sort.active,
            this.sort.direction,
            query
          ).pipe(catchError(() => of(null)));
        }),
        map(data => {
          this.isLoadingResults = false;
          this.isRateLimitReached = data === null;
          if (data === null) return [];
          this.resultsLength = data.totalCount;
          return data.data;
        }),
        takeUntil(this.destroy$)
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

  clearFilter(): void {
    this.searchControl.setValue('');
    this.paginator.pageIndex = 0;
  }

  getPatientID(row: Patient): Observable<number> {
    let params = new HttpParams()
      .set('pageNumber', (this.paginator.pageIndex + 1).toString())
      .set('pageSize',    this.paginator.pageSize.toString());

    if (this.sort.active && this.sort.direction) {
      params = params
        .set('sort',  this.sort.active)
        .set('order', this.sort.direction);
    }

    params = params
      .set('firstName',         row.firstName         || '')
      .set('lastName',          row.lastName          || '')
      .set('contactNumber',     row.contactNumber     || '')
      .set('medicalHistory',    row.medicalHistory    || '')
      .set('allergies',         row.allergies         || '')
      .set('currentMedications',row.currentMedications|| '');

    return this.http
      .get<PagedResult<Patient>>(`${this.baseUrl}/search`, { params })
      .pipe(
        map(data => {
          const match = data.data.find(p =>
            p.firstName          === row.firstName &&
            p.lastName           === row.lastName  &&
            p.contactNumber      === row.contactNumber &&
            p.medicalHistory     === row.medicalHistory &&
            p.allergies          === row.allergies &&
            p.currentMedications === row.currentMedications
          );
          if (!match) {
            throw new Error('Patient not found');
          }
          if (!match.patientID) {
            throw new Error('No patientID available');
          }
          return match.patientID;
        })
      );
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

  deleteRow(row: Patient): void {
    const delID = this.getPatientID(row);
    this.http.delete(`${this.baseUrl}/${delID}`)
      .subscribe({
        next: () => {
          Swal.fire('Deleted', 'Patient removed successfully', 'success');
          this.setupDynamicSearch();
        },
        error: () => {
          Swal.fire('Error', 'Deletion failed', 'error');
        }
      });
  }

  private openPatientModal(existing?: Patient): Promise<Patient> {
    const fields = [
      // { key: 'userID', label: 'User ID', type: 'number'},
      { key: 'firstName', label: 'First Name', type: 'text' },
      { key: 'lastName',  label: 'Last Name',  type: 'text' },
      { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
      { key: 'gender',    label: 'Gender',       type: 'text' },
      { key: 'contactNumber', label: 'Contact Number', type: 'text' },
      { key: 'address',   label: 'Address',      type: 'text' },
      { key: 'medicalHistory', label: 'Medical History', type: 'text' },
      { key: 'allergies', label: 'Allergies',    type: 'text' },
      { key: 'currentMedications', label: 'Current Medications', type: 'text' }
    ];

    // Generate HTML string with inputs
    const html = fields.map(f => `
      <label for="${f.key}" style="display:block; margin:0.5em 0 0.2em">${f.label}</label>
      <input id="${f.key}" class="swal2-input" type="${f.type}"
       value="${existing ? (existing as any)[f.key] ?? '' : ''}">
    `).join('');

    return Swal.fire({
      title: existing ? 'Edit Patient' : 'New Patient',
      html,
      showCancelButton: true,
      confirmButtonText: existing ? 'Save' : 'Create',
      focusConfirm: false,
      width: '600px',
      preConfirm: () => {
        // On confirm, read values back from DOM
        const result: any = {};

        for (const f of fields) {
          const el = (Swal.getPopup()!.querySelector(`#${f.key}`) as HTMLInputElement);

          if (!el || !el.value) {
            Swal.showValidationMessage(`${f.label} is required`);
            return;
          }

          let value: any = el.value;
          if (f.key === 'userID') {
            const num = parseInt(el.value, 10);
            if (isNaN(value)) {
              Swal.showValidationMessage('User ID must be a number');
              return;
            }
            value = num;
          }
          if (f.key === 'userID') {
            result[f.key] = parseInt(el.value, 10);
          } else {
            result[f.key] = el.value;
          }
        }

        return result as Patient;
      }
    }).then(res => {
      if (res.isConfirmed && res.value) {
        return Promise.resolve(res.value);
      }

      return Promise.reject('cancelled');
    });
  }

  editRow(row: Patient) {
    this.openPatientModal(row)
      .then(edited => {
        // Build JSON-Patch operations
        const ops = Object.keys(edited).map< JsonPatchOperation >(key => ({
          op: 'replace',
          path: `/${key}`,
          value: (edited as any)[key]
        }));

        this.getPatientID(row).subscribe({
          next: id => {
            this.http.patch(`${this.baseUrl}/${id}`, ops, {
              headers: { 'Content-Type': 'application/json-patch+json' }
            }).subscribe({
              next: () => {
                Swal.fire('Saved','Patient updated','success');
                this.setupDynamicSearch();
              },
              error: e => Swal.fire('Error','Update failed','error')
            });
          },
          error: e => Swal.fire('Error', e.message,'error')
        });
      })
      .catch(() => {/* cancelled */});
  }

  createRow() {
    this.openPatientModal()
      .then(newData => {
        this.http.post<Patient>(this.baseUrl, newData).subscribe({
          next: p => {
            Swal.fire('Created','Patient added','success');
            this.setupDynamicSearch();
          },
          error: e => Swal.fire('Error','Creation failed','error')
        });
      })
      .catch(() => {/* cancelled */});
  }

}

