import { PatientCreate } from './../../models/patient.model';
import { OnInit } from '@angular/core';
import { Component, AfterViewInit, ViewChild, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, merge, of, Subject, combineLatest, Subscription } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { Patient } from '../../models/patient.model';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from "@angular/material/list";
import { NavigationStart, Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { TableShell } from "../table-shell/table-shell";
import { MatToolbarModule } from "@angular/material/toolbar";
import { CreatePatientDialog } from '../create-patient-dialog/create-patient-dialog';
import { MatDialog } from '@angular/material/dialog';
import { PatientHome } from '../patient-home/patient-home';

interface PagedResult<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

interface JsonPatchOperation {
  op: string;
  path: string;
  value: any;
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
    ReactiveFormsModule,
    MatSidenavModule,
    MatListModule,
    MatToolbarModule
],
  templateUrl: './patient-table.html',
  styleUrl: './patient-table.scss',
})
export class PatientTable implements OnInit, OnDestroy, PatientCreate {
  private http = inject(HttpClient);

  private destroy$ = new Subject<void>();

  private router = inject(Router);
  private loginService = inject(LoginService);

  private searchSubscription?: Subscription;

  private dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'firstName', 'lastName', 'dateOfBirth', 'gender',
    'contactNumber', 'address', 'medicalHistory', 'allergies', 'currentMedications',
    'actions'
  ];

  dataSource = new MatTableDataSource<Patient>();
  resultsLength = 0;
  isRateLimitReached = false;
  isLoadingResults = true;
  searchControl = new FormControl('');

  // state tracking variables
  currentPage = 1;
  pageSize = 10;
  currentQuery = '';
  sortField = '';
  sortDirection = '';

  private baseUrl = 'http://localhost:5122/api/patient';
  private headers = {'Authorization': `Bearer ${this.loginService.getToken()}`};

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    // logout on refresh (local cookie storage not implemented)
    if (!this.loginService.isLoggedIn()) {
      this.logout()
      this.router.navigate(['/login'])
    }

    // search debouncing rxjs (after 300ms of inactivity it refreshes the data)
    this.searchSubscription = this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(query => {
        this.handleSearchChange(query || '');
      });

    // initial data loading
    this.loadPatients();

    // prevent entry into app via browser back button or forward
    this.router.events.subscribe(evt => {
      if (evt instanceof NavigationStart && (evt.url == "" || evt.navigationTrigger == "popstate" || evt.navigationTrigger == "hashchange")) {
        this.logout();
        this.router.navigate(['/login']);
      }
    })
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.searchSubscription?.unsubscribe();
  }

  handleSearchChange(query: string) {
    console.log('Search query changed:', query);
    this.currentQuery = query;
    this.currentPage = 1; // Reset to first page on new search
    this.loadPatients();
  }

  onPageChange(event: PageEvent) {
    console.log('Page changed:', event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadPatients();
  }

  onSortChange(sort: Sort) {
    console.log('Sort changed:', sort);
    this.sortField = sort.active;
    this.sortDirection = sort.direction;
    this.currentPage = 1; // Reset to first page on sort change
    this.loadPatients();
  }

  private loadPatients() {
    this.isLoadingResults = true;
    this.isRateLimitReached = false;

    let params = new HttpParams()
      .set('pageNumber', this.currentPage.toString())
      .set('pageSize', this.pageSize.toString());

    // Add sorting to params
    if (this.sortField && this.sortDirection) {
      params = params
        .set('sort', this.sortField)
        .set('order', this.sortDirection);
    }

    // Add search query to params
    if (this.currentQuery.trim()) {
      params = params.set('query', this.currentQuery.trim());
    }

    this.http.get<PagedResult<Patient>>(`${this.baseUrl}/search-lucene`, {
      params,
      headers: this.headers
    }).subscribe({
      next: (data) => {
        this.isLoadingResults = false;
        this.dataSource.data = data.data;
        this.resultsLength = data.totalCount;

        // Update paginator (after view init)
        if (this.paginator) {
          this.paginator.pageIndex = this.currentPage - 1;
          this.paginator.pageSize = this.pageSize;
        }
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
          Swal.fire("Error", `Could not load patient data: ${error.statusText}`, "error");
        }

        // reset state
        this.isLoadingResults = false;
        this.isRateLimitReached = true;
        this.dataSource.data = [];
      }
    });
  }

  navToDashboard() {
    this.router.navigate(['/dashboard'])
  }

  clearFilter(): void {
    this.searchControl.setValue('');
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  getPatientID(row: Patient): Observable<number> {
    let params = new HttpParams()
      .set('pageNumber', this.currentPage.toString())
      .set('pageSize', this.pageSize.toString());

    if (this.sortField && this.sortDirection) {
      params = params
        .set('sort', this.sortField)
        .set('order', this.sortDirection);
    }

    params = params
      .set('firstName', row.firstName || '')
      .set('lastName', row.lastName || '')
      .set('contactNumber', row.contactNumber || '')
      .set('medicalHistory', row.medicalHistory || '')
      .set('allergies', row.allergies || '')
      .set('currentMedications', row.currentMedications || '');

    return this.http
      .get<PagedResult<Patient>>(`${this.baseUrl}/search`, { params, headers: this.headers })
      .pipe(
        map(data => {
          const match = data.data.find(p =>
            p.firstName === row.firstName &&
            p.lastName === row.lastName &&
            p.contactNumber === row.contactNumber &&
            p.medicalHistory === row.medicalHistory &&
            p.allergies === row.allergies &&
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
    this.getPatientID(row).subscribe({
      next: (patientId) => {
        this.http.delete(`${this.baseUrl}/${patientId}`, { headers: this.headers })
          .subscribe({
            next: () => {
              Swal.fire('Deleted', 'Patient removed successfully', 'success');
              this.loadPatients(); // Refresh the table
            },
            error: () => {
              Swal.fire('Error', 'Deletion failed', 'error');
            }
          });
      },
      error: (error) => {
        Swal.fire('Error', error.message || 'Could not retrieve patient ID', 'error');
      }
    });
  }

  editRow(row: any): void {
    const ref = this.dialog.open(CreatePatientDialog, {
      data: { mode: 'edit', patient: row }
    });

    ref.afterClosed().subscribe(result => {
      if (result) {
        // update logic
        const updatedDetails: PatientCreate = {
          firstName: result.firstName,
          lastName: result.lastName,
          dateOfBirth: result.dateOfBirth,
          gender: result.gender,
          contactNumber: result.contactNumber,
          address: result.address,
          medicalHistory: result.medicalHistory,
          currentMedications: result.currentMedications,
          allergies: result.allergies,
          createdAt: result.createdAt,
          modifiedAt: result.modifiedAt,
          isActive: result.isActive
        }

        this.updateRow(updatedDetails, row);
        console.log('Updated patient details:', result);
      }
    });
  }

  newPatient(): void {
    const ref = this.dialog.open(CreatePatientDialog);

    ref.afterClosed()
      .subscribe(result => {
        // result = {
        // patientID, userID, firstName, lastName, dateOfBirth, gender, contactNumber,
        // address, medicalHistory, currentMedications, allergies(array), createdAt, modifiedAt, isActive
        // }
        if (result) {
          this.createRow(result);
      }
    })
  }

  // make json string object for result to convert to body of request
  toString(patient: PatientCreate): string {
    const obj =
    `{
    "patientID": ${patient.patientID},
    "userID": ${patient.userID},
    "firstName": "${patient.firstName}",
    "lastName": "${patient.lastName}",
    "dateOfBirth": "${patient.dateOfBirth}",
    "gender": "${patient.gender}",
    "contactNumber": "${patient.contactNumber}",
    "address": "${patient.address}",
    "medicalHistory": "${patient.medicalHistory}",
    "currentMedications": "${patient.currentMedications}",
    "allergies": "${patient.allergies}",
    "createdAt": "${patient.createdAt}",
    "modifiedAt": "${patient.modifiedAt}",
    "isActive": "${patient.isActive}"
    }`
    return obj;
  }

  createRow(result: any): void {
    // patient creation dialog
    console.log(result);

    result.dateOfBirth = this.formatToSqlTimestamp(result.dateOfBirth, 'dateOnly');
    result.createdAt = this.formatToSqlTimestamp(result.createdAt, 'dateTime');
    result.modifiedAt = this.formatToSqlTimestamp(result.modifiedAt, 'dateTime');

    // convert allergies array to comma separated string
    result.allergies = result.allergies.toString();

    // cast result to PatientCreate
    const payload: PatientCreate = result;

    // console.log(result.toString())
    // console.log(this.toString(payload))
    // console.log('Final Patient Create Payload:- ', payload);

    const headers = {
      'Authorization': `Bearer ${this.loginService.getToken()}`,
      'Content-Type': 'application/json'
    };

    // post request
    const response = this.http.post(`${this.baseUrl}`, this.toString(payload), { headers });

    // handle response
    response.subscribe({
      next: (res) => {
        Swal.fire('Success', 'Patient created successfully!', 'success');
      },
      error: (err) => {
        Swal.fire('Error', 'Patient creation failed!', 'error');
      },
      complete: () => {
        this.loadPatients();
      }
    })
  }

  // update patient details
  updateRow(result: any, row: any): void {
    // alter result to match format to put in json patch request

    result.dateOfBirth = this.formatToSqlTimestamp(result.dateOfBirth, 'dateOnly');
    result.createdAt = this.formatToSqlTimestamp(result.createdAt, 'dateTime');
    result.modifiedAt = this.formatToSqlTimestamp(result.modifiedAt, 'dateTime');

    // convert allergies array to comma separated string
    result.allergies = result.allergies.toString();

    const operations = Object.keys(result).map<JsonPatchOperation>(key => ({
      op: 'replace',
      path: `/${key}`,
      value: result[key]
    }));

    // make the patch request and send it after making sure the patient is fetched and the format is correct
    this.getPatientID(row).subscribe({
      next: (patientID) => {
        this.http.patch(`${this.baseUrl}/${patientID}`, operations, {
          headers: {
            'Content-Type': 'application/json-patch+json',
            ...this.headers
          }
        }).subscribe({
          next: () => {
            Swal.fire('Saved', 'Patient updated', 'success');
            this.loadPatients();
          }, error(err) {
            Swal.fire('Error', 'Update failed', 'error');
          },
        })
        console.log('Editing patient:- ', row);
      },
      error: (error) => {
        Swal.fire('Error', `Could not retrieve patient details`, 'error');
      }
    });
  }

  logout() {
    fetch('http://localhost:5122/api/auth/logout', {
      method: 'POST'
    })
    this.router.navigate(['/login']);
  }

  formatToSqlTimestamp(dateInput: string, type: string): string {
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

    if (type == 'dateOnly') {
      return `${year}-${month}-${day}`;
    } else {
      return `${year}-${month}-${day} ${hours}:${mins}:${secs}.${millis}`;
    }
  }
}
