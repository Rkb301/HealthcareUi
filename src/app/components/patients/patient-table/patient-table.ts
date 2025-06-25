import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Patient } from '/Users/aakarsh.batra/Assignment/Week2/HealthcareUi/src/app/models/patient.model';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';

const patientData: Patient[] = []

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
  dataSource = new MatTableDataSource(patientData);

  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {}

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }
}
