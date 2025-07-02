import { MatFormFieldModule } from '@angular/material/form-field';
import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { DateTime } from 'luxon';
import { LoginService } from '../../../services/login.service';
import { MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface Patient {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  contactNumber: string;
  address: string;
  medicalHistory: string;
  allergies: string;
  currentMedications: string;
}

@Component({
  selector: 'app-patient-table',
  standalone: true,
  imports: [
    CommonModule,
    MatLabel,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './patient-table.html',
  styleUrls: ['./patient-table.scss'],
})
export class PatientTable implements AfterViewInit {
  @ViewChild('patientTableContainer', { static: true }) container!: ElementRef;

  public tabulator!: Tabulator;

  @ViewChild('filterInput', {static: true}) filterInput!: ElementRef<HTMLInputElement>;

  pageSize = 10;

  constructor(private loginService: LoginService) { }

  ngAfterViewInit() {
    this.tabulator = new Tabulator(this.container.nativeElement, {
      layout: 'fitDataTable',
      reactiveData: true,
      pagination: true,
      paginationMode: "remote",
      paginationSize: this.pageSize,
      ajaxSorting: true,
      ajaxFiltering: true,
      ajaxURL: 'http://localhost:5122/api/patient/search',
      ajaxRequestFunc: async (_url, _config, params) => {
        const qp = new URLSearchParams();
        qp.set('pageNumber', params.page.toString());
        qp.set('pageSize', params.size.toString());
        if (params.sorters?.length) {
          qp.set('Sort', params.sorters[0].field);
          qp.set('Order', params.sorters[0].dir);
        }

        const response = await fetch(`${_url}?${qp}`, {
          headers: { Authorization: `Bearer ${this.loginService.getToken()}` }
        });
        const resJson = await response.json();
        return {
          data:      resJson.data,
          last_page: resJson.totalPages,
          total_records: resJson.totalCount
        };
      },
      columns: [
        { title: 'Name',       field: 'firstName' },
        { title: 'Date Of Birth',        field: 'dateOfBirth', formatter: 'datetime', formatterParams: {
            inputFormat: 'yyyy-MM-dd',
            outputFormat: 'dd/MM/yyyy'
          }
        },
        { title: 'Gender',     field: 'gender' },
        { title: 'Contact',    field: 'contactNumber' },
        { title: 'Address',    field: 'address' },
        { title: 'History',    field: 'medicalHistory', formatter: 'textarea' },
        { title: 'Allergies',  field: 'allergies' },
        { title: 'Medications', field: 'currentMedications', formatter: 'textarea' },
      ],
    });

    this.filterInput.nativeElement.addEventListener('keyup', () => {
      const query = this.filterInput.nativeElement.value;
      this.tabulator.setFilter('firstName', 'like', query);
    });
  }
}
