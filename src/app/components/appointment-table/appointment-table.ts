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
      ajaxURL: 'http://localhost:5122/api/appointment/search-with-names',
      ajaxConfig: 'GET',

      pagination: true,
      paginationMode: 'remote',
      paginationSize: 10,
      paginationSizeSelector: [5, 10, 20, 100],
      ajaxFiltering: true,
      ajaxSorting: true,

      dataReceiveParams: {
        last_page: 'totalCount',
        data: 'data',
        'sort[0][field]': 'sort',
        'sort[0][dir]':   'order'
      },

      ajaxURLGenerator: (url, _config, params) => {
        const httpParams = new URLSearchParams();

        httpParams.set(params.pageName || 'pageNumber', params.page);        // fallback if names change
        httpParams.set(params.sizeName || 'pageSize', params.size);        // fallback

        if (params.sorters?.length) {
          httpParams.set(params.sortFieldName || 'sort',  params.sorters[0].field);
          httpParams.set(params.sortDirName   || 'order', params.sorters[0].dir);
        }

        const query = this.filterInput.nativeElement.value;

        if (query) {
          httpParams.set('status', query);
        }

        return `${url}?${httpParams.toString()}`;
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
