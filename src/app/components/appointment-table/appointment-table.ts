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
import { DateTime } from 'luxon';

@Component({
  selector: 'app-appointment-table',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './appointment-table.html',
  styleUrl: './appointment-table.scss'
})
export class AppointmentTable {
  public tabulator!: Tabulator;

  @ViewChild('filterInput',  { static: true }) filterInput!: ElementRef<HTMLInputElement>;
  @ViewChild('appointmentTableContainer', { static: true }) tableContainer!: ElementRef<HTMLDivElement>;

  ngAfterViewInit() {
    this.tabulator = new Tabulator(this.tableContainer.nativeElement, {
      ajaxURL: 'http://localhost:5122/api/appointment/search-lucene',
      ajaxConfig: 'GET',

      pagination: true,
      paginationMode: 'remote',
      paginationSize: 10,
      paginationSizeSelector: [5, 10, 20, 100],
      ajaxFiltering: true,
      ajaxSorting: true,

      dataReceiveParams: {
        data: 'data',
        last_page: 'totalCount'
      },

      ajaxURLGenerator: (url, _config, params) => {
        const p = new URLSearchParams();

        p.set('pageNumber', String(params.page));
        p.set('pageSize', String(params.size));

        if (params.sorters?.length) {
          p.set('sort',  params.sorters[0].field);
          p.set('order', params.sorters[0].dir);
        }

        const query = this.filterInput.nativeElement.value;

        if (query) {
          p.set('query', query);
        }

        return `${url}?${p.toString()}`;
      },

      columns: [
        { title: 'Patient Name', field: 'patientName' },
        { title: 'Doctor Name', field: 'doctorName' },
        { title: 'Date', field: 'appointmentDate' },
        { title: 'Reason', field: 'reason' },
        { title: 'Status', field: 'status' },
        { title: 'Notes', field: 'notes' }
      ],

      layout: 'fitColumns',
      height: '500px'
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
