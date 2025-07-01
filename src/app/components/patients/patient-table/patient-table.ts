import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { DateTime } from 'luxon';
import { LoginService } from '../../../services/login.service';

export interface Patient {
  patientID: number;
  userID: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  contactNumber: string;
  address: string;
  medicalHistory: string;
  allergies: string;
  currentMedications: string;
  createdAt: string;
  modifiedAt: string;
  isactive: boolean;
}

@Component({
  selector: 'app-patient-table',
  standalone: true,
  templateUrl: './patient-table.html',
  styleUrls: ['./patient-table.scss'],
})
export class PatientTable implements AfterViewInit {
  @ViewChild('patientTableContainer', { static: true }) container!: ElementRef;
  tabulator!: Tabulator;
  pageSize = 10;
  constructor ( private loginService: LoginService ) {}
  ngAfterViewInit() {
    this.tabulator = new Tabulator(this.container.nativeElement, {
      layout: 'fitData',
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
      autoColumns: true,
      // columns: [
      //   { title: 'Patient ID', field: 'patientID', width: 100 },
      //   { title: 'Name',       field: 'firstName' },
      //   { title: 'DOB',        field: 'dateOfBirth', formatter: 'datetime', formatterParams: {
      //       inputFormat: 'yyyy-MM-dd',
      //       outputFormat: 'dd/MM/yyyy'
      //     }
      //   },
      //   { title: 'Gender',     field: 'gender' },
      //   { title: 'Contact',    field: 'contactNumber' },
      //   { title: 'Address',    field: 'address' },
      //   { title: 'History',    field: 'medicalHistory', formatter: 'textarea' },
      //   { title: 'Allergies',  field: 'allergies' },
      //   { title: 'Medications', field: 'currentMedications', formatter: 'textarea' },
      //   {
      //     title: 'Created On', field: 'createdAt', formatter: 'datetime', formatterParams: {
      //       inputFormat: 'yyy-MM-dd',
      //       outputFormat: 'dd/MM/yyy'
      //     }
      //   },
      //   {
      //     title: 'Modified On', field: 'modifiedAt', formatter: 'datetime', formatterParams: {
      //       inputFormat: 'yyy-MM-dd',
      //       outputFormat: 'dd/MM/yyy'
      //     }
      //   },
      //   { title: 'Active',     field: 'isactive', formatter: 'tickCross' },
      // ],
    });
  }
}
