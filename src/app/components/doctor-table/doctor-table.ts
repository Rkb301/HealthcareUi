import { DoctorCreate } from './../../models/doctor.model';
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
import { Doctor } from '../../models/doctor.model';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from "@angular/material/list";
import { NavigationStart, Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { TableShell } from "../table-shell/table-shell";
import { MatToolbarModule } from "@angular/material/toolbar";
import { CreateDoctorDialog } from '../create-doctor-dialog/create-doctor-dialog';
import { MatDialog } from '@angular/material/dialog';

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
  selector: 'app-doctor-table',
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
    MatToolbarModule,
    MatSidenavModule
  ],
  templateUrl: './doctor-table.html',
  styleUrl: './doctor-table.scss',
})
export class DoctorTable implements OnInit, OnDestroy, DoctorCreate {
  private http = inject(HttpClient);

  private destroy$ = new Subject<void>();

  private router = inject(Router);
  private loginService = inject(LoginService);

  private searchSubscription?: Subscription;

  private dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'firstName', 'lastName', 'specialization', 'contactNumber',
    'email', 'schedule', 'actions'
  ];

  dataSource = new MatTableDataSource<Doctor>([]);
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

  private baseUrl = 'http://localhost:5122/api/doctor';
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
    this.loadDoctors();

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
    this.loadDoctors();
  }

  onPageChange(event: PageEvent) {
    console.log('Page changed:', event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadDoctors();
  }

  onSortChange(sort: Sort) {
    console.log('Sort changed:', sort);
    this.sortField = sort.active;
    this.sortDirection = sort.direction;
    this.currentPage = 1; // Reset to first page on sort change
    this.loadDoctors();
  }

  private loadDoctors() {
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

    this.http.get<PagedResult<Doctor>>(`${this.baseUrl}/search-lucene`, {
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
          Swal.fire("Error", `Could not load doctor data: ${error.statusText}`, "error");
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

  getDoctorID(row: Doctor): Observable<number> {
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
      .set('specialization', row.specialization || '')
      .set('contactNumber', row.contactNumber || '')
      .set('email', row.email || '')
      .set('schedule', row.schedule || '');

    return this.http
      .get<PagedResult<Doctor>>(`${this.baseUrl}/search`, { params, headers: this.headers })
      .pipe(
        map(data => {
          const match = data.data.find(d =>
            d.firstName === row.firstName &&
            d.lastName === row.lastName &&
            d.specialization === row.specialization &&
            d.contactNumber === row.contactNumber &&
            d.email === row.email &&
            d.schedule === row.schedule
          );
          if (!match) {
            throw new Error('Doctor not found');
          }
          if (!match.doctorID) {
            throw new Error('No doctorID available');
          }
          console.log('Doctor ID found:- ', match.doctorID);
          return match.doctorID;
        })
      );
  }

  confirmDelete(row: any) {
    Swal.fire({
      title: 'Confirm Deletion',
      text: 'This will remove the doctor record.',
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

  deleteRow(row: Doctor): void {
    this.getDoctorID(row).subscribe({
      next: (doctorId) => {
        this.http.delete(`${this.baseUrl}/${doctorId}`, { headers: this.headers })
          .subscribe({
            next: () => {
              Swal.fire('Deleted', 'Doctor removed successfully', 'success');
              this.loadDoctors(); // refresh the table
            },
            error: (error) => {
              Swal.fire('Error', 'Deletion failed', 'error');
              console.log(error);
            }
          });
      },
      error: (error) => {
        Swal.fire('Error', 'Could not retrieve doctor details', 'error');
        console.log(error);
      }
    });
  }

  editRow(row: any): void {
    const ref = this.dialog.open(CreateDoctorDialog, {
      data: { mode: 'edit', doctor: row }
    });

    ref.afterClosed().subscribe(result => {
      if (result) {
        // update logic
        const updatedDetails: DoctorCreate = {
          firstName: result.firstName,
          lastName: result.lastName,
          specialization: result.specialization,
          contactNumber: result.contactNumber,
          email: result.email,
          schedule: result.schedule,
          createdAt: result.createdAt,
          modifiedAt: result.modifiedAt,
          isActive: result.isActive
        }

        this.updateRow(updatedDetails, row);
        console.log('Updated doctor details:', result);
      }
    });
  }

  newDoctor(): void {
    const ref = this.dialog.open(CreateDoctorDialog);

    ref.afterClosed()
      .subscribe(result => {
        if (result) {
          this.createRow(result);
        }
      })
  }

  // make json string object for result to convert to body of request
  toString(doctor: DoctorCreate): string {
    const obj =
      `{
        "doctorID": ${doctor.doctorID},
        "userID": ${doctor.userID},
        "firstName": "${doctor.firstName}",
        "lastName": "${doctor.lastName}",
        "specialization": "${doctor.specialization}",
        "contactNumber": "${doctor.contactNumber}",
        "email": "${doctor.email}",
        "schedule": "${doctor.schedule}",
        "createdAt": "${doctor.createdAt}",
        "modifiedAt": "${doctor.modifiedAt}",
        "isActive": "${doctor.isActive}"
      }`
    return obj;
  }

  createRow(result: any): void {
    console.log(result);

    result.createdAt = this.formatToSqlTimestamp(result.createdAt, 'dateTime');
    result.modifiedAt = this.formatToSqlTimestamp(result.modifiedAt, 'dateTime');

    // cast result to DoctorCreate
    const payload: DoctorCreate = result;

    const headers = {
      'Authorization': `Bearer ${this.loginService.getToken()}`,
      'Content-Type': 'application/json'
    };

    // post request
    const response = this.http.post(`${this.baseUrl}`, this.toString(payload), { headers });

    // handle response
    response.subscribe({
      next: (res) => {
        Swal.fire('Success', 'Doctor created successfully!', 'success');
      },
      error: (err) => {
        Swal.fire('Error', 'Doctor creation failed!', 'error');
      },
      complete: () => {
        this.loadDoctors();
      }
    })
  }

  // update doctor details
  updateRow(result: any, row: any): void {
    result.createdAt = this.formatToSqlTimestamp(result.createdAt, 'dateTime');
    result.modifiedAt = this.formatToSqlTimestamp(result.modifiedAt, 'dateTime');

    const operations = Object.keys(result).map(key => ({
      op: 'replace',
      path: `/${key}`,
      value: result[key]
    }));

    // make the patch request and send it after making sure the doctor is fetched and the format is correct
    this.getDoctorID(row).subscribe({
      next: (doctorID) => {
        this.http.patch(`${this.baseUrl}/${doctorID}`, operations, {
          headers: {
            'Content-Type': 'application/json-patch+json',
            ...this.headers
          }
        }).subscribe({
          next: () => {
            Swal.fire('Saved', 'Doctor updated', 'success');
            this.loadDoctors();
          }, error(err) {
            Swal.fire('Error', 'Update failed', 'error');
          },
        })
        console.log('Editing doctor:- ', row);
      },
      error: (error) => {
        Swal.fire('Error', `Could not retrieve doctor details`, 'error');
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

    const year = dt.getFullYear();
    const month = pad(dt.getMonth() + 1);
    const day = pad(dt.getDate());
    const hours = pad(dt.getHours());
    const mins = pad(dt.getMinutes());
    const secs = pad(dt.getSeconds());
    const millis = pad(dt.getMilliseconds(), 3);

    if (type == 'dateOnly') {
      return `${year}-${month}-${day}`;
    } else {
      return `${year}-${month}-${day} ${hours}:${mins}:${secs}.${millis}`;
    }
  }
}
