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
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Patient } from '../../models/patient.model';
import { MatIconModule } from '@angular/material/icon';

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
    'contactNumber', 'address', 'medicalHistory', 'allergies', 'currentMedications'
  ];

  dataSource = new MatTableDataSource<Patient>();

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;


  private baseUrl = 'http://localhost:5122/api/patient/search-lucene';

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

    return this.http.get<PagedResult<Patient>>(this.baseUrl, { params });
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
}



// import { HttpClient } from '@angular/common/http';
// // src/app/components/patients/patient-table/patient-table.ts
// import {
//   Component,
//   AfterViewInit,
//   ViewChild,
//   ElementRef,
//   inject
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule }     from '@angular/material/input';
// import { MatButtonModule }    from '@angular/material/button';
// import { TabulatorFull as Tabulator } from 'tabulator-tables';
// import { MatTableModule } from '@angular/material/table';
// import { using, Observable } from 'rxjs';
// import { Patient } from '../../models/patient.model';

// @Component({
//   selector: 'app-patient-table',
//   standalone: true,
//   imports: [
//     CommonModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatButtonModule,
//     MatTableModule
//   ],
//   templateUrl: './patient-table.html',
//   styleUrl: './patient-table.scss',
// })
// export class PatientTable implements AfterViewInit {
//   constructor (private http: HttpClient) {}
//   public tabulator!: Tabulator;
//   url = "http:localhost:5122/api/patient/search-lucene";
//   matData = [];


//   @ViewChild('filterInput',  { static: true }) filterInput!: ElementRef<HTMLInputElement>;
//   @ViewChild('patientTableContainer', { static: true }) tableContainer!: ElementRef<HTMLDivElement>;

//   ngAfterViewInit() {
//     this.getData();
//     this.tabulator = new Tabulator(this.tableContainer.nativeElement, {
//       ajaxURL: 'http://localhost:5122/api/patient/search-lucene',
//       ajaxConfig: 'GET',

//       pagination: true,
//       paginationMode: 'remote',
//       paginationSize: 10,
//       paginationSizeSelector: [5, 10, 20, 100],
//       ajaxFiltering: true,
//       ajaxSorting: true,

//       dataReceiveParams: {
//         data:      'data',
//         last_page: 'totalCount',
//       },

//       ajaxURLGenerator: (url, _config, params) => {
//         const p = new URLSearchParams();

//         p.set('pageNumber', String(params.page));
//         p.set('pageSize',   String(params.size));

//         if (params.sorters?.length) {
//           p.set('sort',  params.sorters[0].field);
//           p.set('order', params.sorters[0].dir);
//         }

//         const q = this.filterInput.nativeElement.value.trim();
//         if (q) {
//           p.set('query', q);
//         }

//         return `${url}?${p.toString()}`;
//       },

//       columns: [
//         { title: 'First Name',       field: 'firstName'      },
//         { title: 'Last Name',        field: 'lastName'       },
//         { title: 'Date Of Birth',    field: 'dateOfBirth', formatter: 'datetime', formatterParams: {
//             inputFormat:  'yyyy-MM-dd',
//             outputFormat: 'MM/dd/yyyy'
//           }
//         },
//         { title: 'Gender',           field: 'gender'         },
//         { title: 'Phone',            field: 'contactNumber'  },
//         { title: 'Address',          field: 'address'        },
//         { title: 'History',          field: 'medicalHistory', formatter: 'textarea' },
//         { title: 'Allergies',        field: 'allergies'      },
//         { title: 'Medications',      field: 'currentMedications', formatter: 'textarea' },
//       ],

//       layout: 'fitColumns',
//       height: '500px',
//     });

//     this.filterInput.nativeElement.addEventListener('keyup', () => {
//       this.tabulator.setPage(1);
//       this.tabulator.replaceData();
//     });
//   }

//   clearFilter(): void {
//     this.filterInput.nativeElement.value = '';
//     this.tabulator.setPage(1);
//     this.tabulator.replaceData();
//   }

//   getData(): Observable<Patient[]> {
//     var response = this.http.get<Patient[]>(this.url);
//     console.log(response);
//     return response;
//   }
// }
