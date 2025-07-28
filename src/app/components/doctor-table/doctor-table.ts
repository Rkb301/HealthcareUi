import { AppointmentWithNamesDTO } from './../../models/AppointmentNamesWithDTO';
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
import { Doctor } from '../../models/doctor.model';
import { MatIconModule } from '@angular/material/icon';
import { merge, of, combineLatest, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap, takeUntil } from 'rxjs/operators';
import { TableShell } from "../table-shell/table-shell";
import { LoginService } from '../../services/login.service';

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
    ReactiveFormsModule,
    MatIconModule,
    TableShell
  ],
  templateUrl: './doctor-table.html',
  styleUrls: ['./doctor-table.scss']
})
export class DoctorTable implements AfterViewInit, OnDestroy {
  private http = inject(HttpClient);
  private loginService = inject(LoginService);
  private destroy$ = new Subject<void>();

  displayedColumns = ['firstName','lastName','specialization','contactNumber','email','schedule','actions'];
  data: Doctor[] = [];
  resultsLength = 0;
  isLoading = true;
  isRateLimitReached = false;
  searchControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private baseUrl = 'http://localhost:5122/api/doctor';
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
    this.loadDoctors();

    // Setup reactive search and pagination
    this.setupReactiveTable();
  }

  private loadDoctors() {
    const pageNumber = this.paginator ? this.paginator.pageIndex + 1 : 1;
    const pageSize = this.paginator ? this.paginator.pageSize : 10;

    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    this.http.get(`${this.baseUrl}`, { params, headers: this.headers }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.data = res.data || res || [];
        this.resultsLength = res.totalCount || 0;
      },
      error: (error) => {
        console.error('Error loading doctors:', error);
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
    ).subscribe((data: Doctor[]) => this.data = data);
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
      { key: 'firstName', label: 'First Name', type: 'text' },
      { key: 'lastName', label: 'Last Name', type: 'text' },
      { key: 'specialization', label: 'Specialization', type: 'text' },
      { key: 'contactNumber', label: 'Contact Number', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'schedule', label: 'Schedule', type: 'text' }
    ];
    const html = fields.map(f => `
      <label>${f.label}</label>
      <input id="${f.key}" class="swal2-input" type="${f.type}">
    `).join('');

    Swal.fire({
      title: 'New Doctor',
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
          dto[f.key] = el.value;
        }
        return dto;
      }
    }).then(res => {
      if (res.isConfirmed && res.value) {
        this.http.post(this.baseUrl, res.value, { headers: this.headers }).subscribe({
          next: () => {
            Swal.fire('Created','Doctor added','success');
            this.loadDoctors();
          },
          error: () => Swal.fire('Error','Creation failed','error')
        });
      }
    });
  }

  editRow(row: Doctor) {
    const fields = [
      { key: 'firstName', label: 'First Name', type: 'text', value: row.firstName },
      { key: 'lastName', label: 'Last Name', type: 'text', value: row.lastName },
      { key: 'specialization', label: 'Specialization', type: 'text', value: row.specialization },
      { key: 'contactNumber', label: 'Contact Number', type: 'text', value: row.contactNumber },
      { key: 'email', label: 'Email', type: 'email', value: row.email },
      { key: 'schedule', label: 'Schedule', type: 'text', value: row.schedule }
    ];
    const html = fields.map(f => `
      <label>${f.label}</label>
      <input id="${f.key}" class="swal2-input" type="${f.type}" value="${f.value}">
    `).join('');

    Swal.fire({
      title: 'Edit Doctor',
      html,
      showCancelButton: true,
      confirmButtonText: 'Save',
      focusConfirm: false,
      preConfirm: () => {
        const dto: any = {};
        for (const f of fields) {
          const el = (Swal.getPopup()!.querySelector(`#${f.key}`) as HTMLInputElement);
          if (!el.value) {
            Swal.showValidationMessage(`${f.label} is required`);
            return;
          }
          dto[f.key] = el.value;
        }
        return dto;
      }
    }).then(res => {
      if (res.isConfirmed && res.value) {
        const ops = Object.keys(res.value).map(k => ({
          op: 'replace', path: `/${k}`, value: res.value[k]
        }));
        this.http.patch(`${this.baseUrl}/${row.doctorID}`, ops, {
          headers: { 'Content-Type': 'application/json-patch+json', ...this.headers }
        }).subscribe({
          next: () => {
            Swal.fire('Saved','Doctor updated','success');
            this.loadDoctors();
          },
          error: () => Swal.fire('Error','Update failed','error')
        });
      }
    });
  }

  deleteRow(row: Doctor) {
    Swal.fire({
      title: 'Confirm Delete',
      text: 'This will soft-delete the doctor.',
      icon: 'warning',
      showCancelButton: true
    }).then(r => {
      if (r.isConfirmed) {
        this.http.delete(`${this.baseUrl}/${row.doctorID}`, { headers: this.headers }).subscribe({
          next: () => {
            Swal.fire('Deleted','Doctor removed','success');
            this.loadDoctors();
          },
          error: () => Swal.fire('Error','Deletion failed','error')
        });
      }
    });
  }
}
