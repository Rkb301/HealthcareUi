// src/app/components/patients/patient-table/patient-table.ts
import {
  Component,
  AfterViewInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatButtonModule }    from '@angular/material/button';
import { TabulatorFull as Tabulator } from 'tabulator-tables';

@Component({
  selector: 'app-patient-table',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './patient-table.html',
  styleUrls: ['./patient-table.scss'],
})
export class PatientTable implements AfterViewInit {
  public tabulator!: Tabulator;

  @ViewChild('filterInput',  { static: true }) filterInput!: ElementRef<HTMLInputElement>;
  @ViewChild('patientTableContainer', { static: true }) tableContainer!: ElementRef<HTMLDivElement>;

  ngAfterViewInit() {
    this.tabulator = new Tabulator(this.tableContainer.nativeElement, {
      ajaxURL: 'http://localhost:5122/api/patient/search-lucene',
      ajaxConfig: 'GET',

      pagination: true,
      paginationMode: 'remote',
      paginationSize: 10,
      paginationSizeSelector: [5, 10, 20, 100],
      ajaxFiltering: true,
      ajaxSorting: true,

      dataReceiveParams: {
        data:      'data',
        last_page: 'totalCount',
      },

      ajaxURLGenerator: (url, _config, params) => {
        const p = new URLSearchParams();

        p.set('pageNumber', String(params.page));
        p.set('pageSize',   String(params.size));

        if (params.sorters?.length) {
          p.set('sort',  params.sorters[0].field);
          p.set('order', params.sorters[0].dir);
        }

        const q = this.filterInput.nativeElement.value.trim();
        if (q) {
          p.set('query', q);
        }

        return `${url}?${p.toString()}`;
      },

      columns: [
        { title: 'First Name',       field: 'firstName'      },
        { title: 'Last Name',        field: 'lastName'       },
        { title: 'Date Of Birth',    field: 'dateOfBirth', formatter: 'datetime', formatterParams: {
            inputFormat:  'yyyy-MM-dd',
            outputFormat: 'MM/dd/yyyy'
          }
        },
        { title: 'Gender',           field: 'gender'         },
        { title: 'Phone',            field: 'contactNumber'  },
        { title: 'Address',          field: 'address'        },
        { title: 'History',          field: 'medicalHistory', formatter: 'textarea' },
        { title: 'Allergies',        field: 'allergies'      },
        { title: 'Medications',      field: 'currentMedications', formatter: 'textarea' },
      ],

      layout: 'fitColumns',
      height: '500px',
    });

    this.filterInput.nativeElement.addEventListener('keyup', () => {
      this.tabulator.setPage(1);
      this.tabulator.replaceData();
    });
  }

  clearFilter(): void {
    this.filterInput.nativeElement.value = '';
    this.tabulator.setPage(1);
    this.tabulator.replaceData();
  }
}
