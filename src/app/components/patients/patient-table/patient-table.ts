import { LoginService } from './../../../services/login.service';
import { Component, OnInit, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabulatorFull as Tabulator } from 'tabulator-tables';

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

declare global {
  interface Window {
    luxon: any;
  }
}

@Component({
  selector: 'app-patient-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-table.html',
  styleUrls: ['./patient-table.scss']
})
export class PatientTable implements OnInit, AfterViewInit {
  @ViewChild('patientTableContainer') patientTableContainer!: ElementRef;

  tabulator: Tabulator | null = null;
  paramsObj = {};
  searchParams = new URLSearchParams(this.paramsObj);

  constructor(private loginService: LoginService) {}

  ngOnInit() {
    // Don't call fetchData here, wait for ngAfterViewInit
  }

  ngAfterViewInit() {
    this.fetchData();
  }

  async fetchData() {
    try {
      console.log(`Bearer ${this.loginService.getToken()}`);
      const response = await fetch(`http://localhost:5122/api/patient?${this.searchParams}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.loginService.getToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.initTabulator(data);

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  private initTabulator(data: Patient[]) {
    // Destroy existing instance if it exists
    if (this.tabulator) {
      this.tabulator.destroy();
    }

    this.tabulator = new Tabulator(this.patientTableContainer.nativeElement, {
      data: data,
      layout: 'fitData',
      reactiveData: true,
      columns: [
        { title: 'Patient ID', field: 'patientID', width: 100 },
        { title: 'User ID', field: 'userID', width: 100 },
        { title: 'First Name', field: 'firstName' },
        { title: 'Last Name', field: 'lastName' },
        {
          title: 'Date of Birth',
          field: 'dateOfBirth',
          formatter: 'datetime',
          formatterParams: {
            inputFormat: 'yyyy-MM-dd',
            outputFormat: 'MM/dd/yyyy'
          }
        },
        { title: 'Gender', field: 'gender' },
        { title: 'Contact', field: 'contactNumber' },
        { title: 'Address', field: 'address' },
        { title: 'Medical History', field: 'medicalHistory', formatter: 'textarea' },
        { title: 'Allergies', field: 'allergies' },
        { title: 'Medications', field: 'currentMedications', formatter: 'textarea' },
        { title: 'Active', field: 'isactive', formatter: 'tickCross' }
      ]
    });
  }
}
