import { Component, AfterViewInit, ViewChild, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatButtonModule }     from '@angular/material/button';
import { MatTableModule }      from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort }           from '@angular/material/sort';
import { MatProgressSpinnerModule }         from '@angular/material/progress-spinner';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { HttpClient, HttpParams }           from '@angular/common/http';
import Swal                                 from 'sweetalert2';
import { Doctor }                           from '../../models/doctor.model';
import { MatIconModule }                    from '@angular/material/icon';
import { merge, of, combineLatest, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

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
    MatIconModule
  ],
  templateUrl: './doctor-table.html',
  styleUrls: ['./doctor-table.scss']
})
export class DoctorTable implements AfterViewInit, OnDestroy {
  private http        = inject(HttpClient);
  private destroy$    = new Subject<void>();
  displayedColumns   = ['firstName','lastName','specialization','contactNumber','email','schedule','actions'];
  data: Doctor[]     = [];
  resultsLength      = 0;
  isLoading          = true;
  isRateLimitReached = false;
  searchControl      = new FormControl('');
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort)       sort!: MatSort;
  private baseUrl = 'http://localhost:5122/api/doctor';

  ngAfterViewInit() {
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
    const search$   = this.searchControl.valueChanges.pipe(
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
          .set('pageSize',   this.paginator.pageSize.toString());
        if (this.sort.active) {
          params = params.set('sort', this.sort.active)
                         .set('order', this.sort.direction);
        }
        if (q) {
          params = params.set('query', q);
          return this.http.get<any>(`${this.baseUrl}/search-lucene`, { params });
        }
        return this.http.get<any>(`${this.baseUrl}`, { params });
      }),
      catchError(() => { this.isRateLimitReached = true; return of(null); }),
      map(res => {
        this.isLoading = false;
        if (!res) return [];
        this.resultsLength = res.totalCount;
        return res.data ?? res;
      }),
      takeUntil(this.destroy$)
    ).subscribe(data => this.data = data);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clearFilter() {
    this.searchControl.setValue('');
    this.paginator.pageIndex = 0;
  }

  createRow() {
    const fields = [
      { key: 'firstName', label: 'First Name', type: 'text' },
      { key: 'lastName',  label: 'Last Name',  type: 'text' },
      { key: 'specialization', label: 'Specialization', type: 'text' },
      { key: 'contactNumber', label: 'Contact Number', type: 'text' },
      { key: 'email', label: 'Email', type: 'email' },
      { key: 'schedule', label: 'Schedule', type: 'text' }
    ];
    const html = fields.map(f => `
      <label>${f.label}</label>
      <input id="${f.key}" type="${f.type}" class="swal2-input">
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
        this.http.post(this.baseUrl, res.value).subscribe({
          next: () => { Swal.fire('Created','Doctor added','success'); this.ngAfterViewInit(); },
          error: () => Swal.fire('Error','Creation failed','error')
        });
      }
    });
  }

  editRow(row: Doctor) {
    const fields = [
      { key: 'firstName', label: 'First Name', type: 'text', value: row.firstName },
      { key: 'lastName',  label: 'Last Name',  type: 'text', value: row.lastName },
      { key: 'specialization', label: 'Specialization', type: 'text', value: row.specialization },
      { key: 'contactNumber', label: 'Contact Number', type: 'text', value: row.contactNumber },
      { key: 'email', label: 'Email', type: 'email', value: row.email },
      { key: 'schedule', label: 'Schedule', type: 'text', value: row.schedule }
    ];
    const html = fields.map(f => `
      <label>${f.label}</label>
      <input id="${f.key}" type="${f.type}" class="swal2-input" value="${f.value||''}">
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
          headers: { 'Content-Type': 'application/json-patch+json' }
        }).subscribe({
          next: () => { Swal.fire('Saved','Doctor updated','success'); this.ngAfterViewInit(); },
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
        this.http.delete(`${this.baseUrl}/${row.doctorID}`).subscribe({
          next: () => { Swal.fire('Deleted','Doctor removed','success'); this.ngAfterViewInit(); },
          error: () => Swal.fire('Error','Deletion failed','error')
        });
      }
    });
  }
}
