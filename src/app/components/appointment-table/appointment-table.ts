import { Component, AfterViewInit, ViewChild, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import Swal from 'sweetalert2';
import { AppointmentWithNamesDTO, Appointment } from '../../models/appointment.model';
import { MatIconModule } from '@angular/material/icon';
import { merge, of, combineLatest, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { LoginService } from '../../services/login.service';
import { BookAppointmentDialog } from '../book-appointment-dialog/book-appointment-dialog';
import { MatDialog } from '@angular/material/dialog';
import { TableShell } from "../table-shell/table-shell";

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
    ReactiveFormsModule,
    MatIconModule,
    TableShell
  ],
  templateUrl: './appointment-table.html',
  styleUrls: ['./appointment-table.scss']
})
export class AppointmentTable implements AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  private destroy$ = new Subject<void>();
  private loginService = inject(LoginService);
  private dialog = inject(MatDialog);

  displayedColumns = ['patientName','doctorName','appointmentDate','reason','status','notes','actions'];
  data: AppointmentWithNamesDTO[] = [];
  resultsLength = 0;
  isLoading = true;
  isRateLimitReached = false;
  searchControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private baseUrl = 'http://localhost:5122/api/appointment';
  private headers = { 'Authorization': `Bearer ${this.loginService.getToken()}` };

  ngAfterViewInit() {
    // Use setTimeout to ensure ViewChild elements are ready
    setTimeout(() => {
      this.initializeTable();
    }, 0);
  }

  private initializeTable() {
    // Set default paginator values if not set
    if (this.paginator) {
      this.paginator.pageSize = this.paginator.pageSize || 10;
      this.paginator.pageIndex = this.paginator.pageIndex || 0;
    }

    // Make initial HTTP call
    this.loadAppointments();

    // Setup reactive search and pagination
    this.setupReactiveTable();
  }

  private loadAppointments() {
    const pageNumber = this.paginator ? this.paginator.pageIndex + 1 : 1;
    const pageSize = this.paginator ? this.paginator.pageSize : 10;

    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    this.http.get(`${this.baseUrl}`, { params, headers: this.headers }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.data = res.data || [];
        this.resultsLength = res.totalCount || 0;
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.isLoading = false;
        this.isRateLimitReached = true;
      }
    });
  }

  private setupReactiveTable() {
    if (!this.paginator || !this.sort) {
      console.error('Paginator or Sort not initialized');
      return;
    }

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    const search$ = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      map(q => q?.trim())
    );

    const pageSort$ = merge(this.sort.sortChange, this.paginator.page).pipe(startWith({}));

    combineLatest([search$, pageSort$]).pipe(
      switchMap(([q]) => {
        this.isLoading = true;
        let params = new HttpParams()
          .set('pageNumber', (this.paginator.pageIndex + 1).toString())
          .set('pageSize', this.paginator.pageSize.toString());

        if (this.sort.active) {
          params = params.set('sort', this.sort.active)
            .set('order', this.sort.direction);
        }

        if (q) {
          params = params.set('query', q);
          return this.http.get(`${this.baseUrl}/search-lucene`, { params, headers: this.headers });
        }
        return this.http.get(`${this.baseUrl}`, { params, headers: this.headers });
      }),
      catchError((error) => {
        console.error('HTTP Error:', error);
        this.isRateLimitReached = true;
        return of(null);
      }),
      map((res: any) => {
        this.isLoading = false;
        if (!res) return [];
        this.resultsLength = res.totalCount || 0;
        return res.data || [];
      }),
      takeUntil(this.destroy$)
    ).subscribe((data: AppointmentWithNamesDTO[]) => this.data = data);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clearFilter() {
    this.searchControl.setValue('');
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
  }

  createRow() {
    const fields = [
      { key: 'patientID', label: 'Patient ID', type: 'number' },
      { key: 'doctorID', label: 'Doctor ID', type: 'number' },
      { key: 'appointmentDate', label: 'Date', type: 'date' },
      { key: 'reason', label: 'Reason', type: 'text' },
      { key: 'status', label: 'Status', type: 'text' },
      { key: 'notes', label: 'Notes', type: 'text' },
    ];
    const html = fields.map(f => `
      <label>${f.label}</label>
      <input id="${f.key}" class="swal2-input" type="${f.type}">
    `).join('');

    Swal.fire({
      title: 'New Appointment',
      html,
      showCancelButton: true,
      confirmButtonText: 'Create',
      focusConfirm: false,
      preConfirm: () => {
        const dto: any = {};
        for (const f of fields) {
          const el = (Swal.getPopup()!.querySelector(`#${f.key}`) as HTMLInputElement);
          if (!el.value) {
            Swal.showValidationMessage(`${f.label} is required`);
            return;
          }
          dto[f.key] = f.type === 'number' ? +el.value : el.value;
        }
        return dto;
      }
    }).then(res => {
      if (res.isConfirmed && res.value) {
        this.http.post(this.baseUrl, res.value, { headers: this.headers }).subscribe({
          next: () => {
            Swal.fire('Created','Appointment added','success');
            this.loadAppointments();
          },
          error: () => Swal.fire('Error','Creation failed','error')
        });
      }
    });
  }

  editRow(row: AppointmentWithNamesDTO) {
    const fields = [
      { key: 'appointmentDate', label: 'Date', type: 'date', value: row.appointmentDate },
      { key: 'reason', label: 'Reason', type: 'text', value: row.reason },
      { key: 'status', label: 'Status', type: 'text', value: row.status },
      { key: 'notes', label: 'Notes', type: 'text', value: row.notes }
    ];
    const html = fields.map(f => `
      <label>${f.label}</label>
      <input id="${f.key}" class="swal2-input" type="${f.type}" value="${f.value}">
    `).join('');

    Swal.fire({
      title: 'Edit Appointment',
      html,
      showCancelButton: true,
      confirmButtonText: 'Save',
      focusConfirm: false,
      preConfirm: () => {
        const obj: any = {};
        for (const f of fields) {
          const el = (Swal.getPopup()!.querySelector(`#${f.key}`) as HTMLInputElement);
          if (!el.value) {
            Swal.showValidationMessage(`${f.label} is required`);
            return;
          }
          obj[f.key] = el.value;
        }
        return obj;
      }
    }).then(res => {
      if (res.isConfirmed && res.value) {
        const ops = Object.keys(res.value).map(k => ({
          op: 'replace', path: `/${k}`, value: res.value[k]
        }));
        this.http.patch(`${this.baseUrl}/${row.appointmentID}`, ops, {
          headers: { 'Content-Type': 'application/json-patch+json', ...this.headers }
        }).subscribe({
          next: () => {
            Swal.fire('Saved','Appointment updated','success');
            this.loadAppointments();
          },
          error: () => Swal.fire('Error','Update failed','error')
        });
      }
    });
  }

  deleteRow(row: AppointmentWithNamesDTO) {
    Swal.fire({
      title: 'Confirm Delete',
      text: 'This will soft-delete the appointment.',
      icon: 'warning',
      showCancelButton: true
    }).then(r => {
      if (r.isConfirmed) {
        this.http.delete(`${this.baseUrl}/${row.appointmentID}`, { headers: this.headers }).subscribe({
          next: () => {
            Swal.fire('Deleted','Appointment removed','success');
            this.loadAppointments();
          },
          error: () => Swal.fire('Error','Deletion failed','error')
        });
      }
    });
  }

  openDialog(appointment?: AppointmentWithNamesDTO) {
    // Get specializations for the dialog
    this.http.get(`${this.baseUrl.replace('/appointment', '')}/doctor/specializations`, { headers: this.headers }).subscribe({
      next: (response: any) => {
        const specializations = response.data || [];

        const ref = this.dialog.open(BookAppointmentDialog, {
          width: '600px',
          data: {
            specialistOptions: specializations,
            appointment: appointment,
            isAdmin: true // Always admin context in this component
          }
        });

        ref.afterClosed().subscribe(result => {
          if (result) {
            if (appointment) {
              this.updateAppointment(appointment.appointmentID, result);
            } else {
              this.createAppointment(result);
            }
          }
        });
      },
      error: (error) => {
        console.error('Error loading specializations:', error);
      }
    });
  }

  createAppointment(data: any) {
    this.http.post(this.baseUrl, data, { headers: this.headers }).subscribe({
      next: () => {
        Swal.fire('Created', 'Appointment added', 'success');
        this.loadAppointments();
      },
      error: () => Swal.fire('Error', 'Creation failed', 'error')
    });
  }

  updateAppointment(id: number, data: any) {
    const ops = Object.keys(data).map(k => ({
      op: 'replace', path: `/${k}`, value: data[k]
    }));

    this.http.patch(`${this.baseUrl}/${id}`, ops, {
      headers: { 'Content-Type': 'application/json-patch+json', ...this.headers }
    }).subscribe({
      next: () => {
        Swal.fire('Saved', 'Appointment updated', 'success');
        this.loadAppointments();
      },
      error: () => Swal.fire('Error', 'Update failed', 'error')
    });
  }
}
