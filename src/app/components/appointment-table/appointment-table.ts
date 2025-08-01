import { AppointmentCreate } from './../../models/appointment.model';
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
import { Appointment, AppointmentWithNamesDTO } from '../../models/appointment.model';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from "@angular/material/list";
import { NavigationStart, Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { TableShell } from "../table-shell/table-shell";
import { MatToolbarModule } from "@angular/material/toolbar";
import { CreateAppointmentDialog } from '../create-appointment-dialog/create-appointment-dialog';
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
  selector: 'app-appointment-table',
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
  templateUrl: './appointment-table.html',
  styleUrl: './appointment-table.scss',
})
export class AppointmentTable implements OnInit, OnDestroy, AppointmentCreate {
  private http = inject(HttpClient);

  private destroy$ = new Subject<void>();

  private router = inject(Router);
  private loginService = inject(LoginService);

  private searchSubscription?: Subscription;

  private dialog = inject(MatDialog);

  displayedColumns: string[] = [
    'patientName', 'doctorName', 'appointmentDate', 'reason',
    'status', 'notes', 'actions'
  ];

  dataSource = new MatTableDataSource<AppointmentWithNamesDTO>([]);
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

  private baseUrl = 'http://localhost:5122/api/appointment';
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
    this.loadAppointments();

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
    // console.log('Search query changed:', query);
    this.currentQuery = query;
    this.currentPage = 1; // Reset to first page on new search
    this.loadAppointments();
  }

  onPageChange(event: PageEvent) {
    // console.log('Page changed:', event);
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadAppointments();
  }

  onSortChange(sort: Sort) {
    // console.log('Sort changed:', sort);
    this.sortField = sort.active;
    this.sortDirection = sort.direction;
    this.currentPage = 1; // Reset to first page on sort change
    this.loadAppointments();
  }

  private loadAppointments() {
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
    if (this.currentQuery) {
      params = params.set('query', this.currentQuery);
    }

    this.http.get<PagedResult<AppointmentWithNamesDTO>>(`${this.baseUrl}/search-lucene`, {
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
          Swal.fire("Error", `Could not load appointment data: ${error.statusText}`, "error");
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

  getAppointmentID(row: AppointmentWithNamesDTO): Observable<number> {
    let params = new HttpParams()
      .set('pageNumber', this.currentPage.toString())
      .set('pageSize', this.pageSize.toString());

    if (this.sortField && this.sortDirection) {
      params = params
        .set('sort', this.sortField)
        .set('order', this.sortDirection);
    }

    params = params
      .set('patientName', row.patientName || '')
      .set('doctorName', row.doctorName || '')
      .set('appointmentDate', row.appointmentDate || '')
      .set('reason', row.reason || '')
      .set('status', row.status || '')
      .set('notes', row.notes || '');

    return this.http
      .get<PagedResult<AppointmentWithNamesDTO>>(`${this.baseUrl}`, { params, headers: this.headers })
      .pipe(
        map(data => {
          const match = data.data.find(a =>
            a.patientName === row.patientName &&
            a.doctorName === row.doctorName &&
            a.appointmentDate === row.appointmentDate &&
            a.reason === row.reason &&
            a.status === row.status &&
            a.notes === row.notes
          );
          if (!match) {
            throw new Error('Appointment not found');
          }
          if (!match.appointmentID) {
            throw new Error('No appointmentID available');
          }
          return match.appointmentID;
        })
      );
  }

  confirmDelete(row: any) {
    Swal.fire({
      title: 'Confirm Deletion',
      text: 'This will permanently remove the appointment record.',
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

  deleteRow(row: AppointmentWithNamesDTO): void {
    this.getAppointmentID(row).subscribe({
      next: (appointmentId) => {
        this.http.delete(`${this.baseUrl}/${appointmentId}`, { headers: this.headers })
          .subscribe({
            next: () => {
              Swal.fire('Deleted', 'Appointment removed successfully', 'success');
              this.loadAppointments(); // Refresh the table
            },
            error: () => {
              Swal.fire('Error', 'Deletion failed', 'error');
            }
          });
      },
      error: (error) => {
        Swal.fire('Error', error.message || 'Could not retrieve appointment ID', 'error');
      }
    });
  }

  editRow(row: any): void {
    const ref = this.dialog.open(CreateAppointmentDialog, {
      data: { mode: 'edit', appointment: row }
    });

    // console.log('Editing:- ', row);

    ref.afterClosed().subscribe(result => {
      if (result) {
        // change data to necessary form
        const updatedDetails: AppointmentCreate = {
          patientID: result.patientID,
          doctorID: result.doctorID,
          appointmentDate: result.appointmentDate,
          reason: result.reason,
          status: result.status,
          notes: result.notes,
          createdAt: result.createdAt,
          modifiedAt: result.modifiedAt,
          isActive: result.isActive
        }

        this.updateRow(updatedDetails, row);
        console.log('Updated appointment details:', updatedDetails);
      }
    });
  }

  newAppointment(): void {
    const ref = this.dialog.open(CreateAppointmentDialog);

    ref.afterClosed()
      .subscribe(result => {
        if (result) {
          this.createRow(result);
        }
      })
  }

  // make json string object for result to convert to body of request
  toString(appointment: AppointmentCreate): string {
    const obj =
      `{
        "patientID": ${appointment.patientID},
        "doctorID": ${appointment.doctorID},
        "appointmentDate": "${appointment.appointmentDate}",
        "reason": "${appointment.reason}",
        "status": "${appointment.status}",
        "notes": "${appointment.notes}",
        "isActive": "${appointment.isActive}"
      }`
    return obj;
  }

  createRow(result: any): void {
    // console.log(result);

    result.appointmentDate = this.formatToSqlTimestamp(result.appointmentDate.toString(), 'dateTime');

    // cast result to AppointmentCreate
    const payload: AppointmentCreate = result;

    const headers = {
      'Authorization': `Bearer ${this.loginService.getToken()}`,
      'Content-Type': 'application/json'
    };

    // post request
    const response = this.http.post(`${this.baseUrl}`, this.toString(payload), { headers });

    // handle response
    response.subscribe({
      next: (res) => {
        Swal.fire('Success', 'Appointment created successfully!', 'success');
      },
      error: (err) => {
        Swal.fire('Error', 'Appointment creation failed!', 'error');
      },
      complete: () => {
        this.loadAppointments();
      }
    })
  }

  // update appointment details
  updateRow(result: any, row: any): void {
    result.appointmentDate = this.formatToSqlTimestamp(result.appointmentDate.toString(), 'dateTime');
    result.modifiedAt = this.formatToSqlTimestamp(result.modifiedAt, 'dateTime');

    const operations = Object.keys(result).map((key) => ({
      op: 'replace',
      path: `/${key}`,
      value: result[key]
    }));

    // filter and remove the isActive and createdAt operations from the JSONPatchDoc
    const filteredOperations = operations.filter((op) => {
      return op.path !== '/createdAt' && op.path !== '/isActive'
    })

    // console.log('unfiltered operations:- ', operations)
    // console.log('filtered operations:- ', filteredOperations)

    // make the patch request and send it after making sure the appointment is fetched and the format is correct
    this.getAppointmentID(row).subscribe({
      next: (appointmentID) => {
        this.http.patch(`${this.baseUrl}/${appointmentID}`, filteredOperations, {
          headers: {
            'Content-Type': 'application/json-patch+json',
            ...this.headers
          }
        }).subscribe({
          next: () => {
            Swal.fire('Saved', 'Appointment updated', 'success');
            this.loadAppointments();
          }, error(err) {
            Swal.fire('Error', 'Update failed', 'error');
          },
        })
      },
      error: (error) => {
        Swal.fire('Error', `Could not retrieve appointment details`, 'error');
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
