import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Patient } from '/Users/aakarsh.batra/Assignment/Week2/HealthcareUi/src/app/models/patient.model';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';


const PATIENT_DATA: Patient[] = [
  {
    patientID: 1, userID: 1, firstName: 'John', lastName: 'Doe',
    dateOfBirth: '1990-05-15', gender: 'Male', contactNumber: '555-1234',
    address: '123 Main St', medicalHistory: 'Hypertension',
    allergies: 'Penicillin', currentMedications: 'Lisinopril 10mg'
  },
];

@Component({
  selector: 'app-patient-table',
  imports: [MatTableModule, MatSortModule],
  templateUrl: './patient-table.html',
  styleUrls: ['./patient-table.scss']
})
export class PatientTableComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'patientID', 'userID', 'firstName', 'lastName', 'dateOfBirth', 'gender',
    'contactNumber', 'address', 'medicalHistory', 'allergies', 'currentMedications'
  ];
  dataSource = new MatTableDataSource(PATIENT_DATA);

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {}

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}
