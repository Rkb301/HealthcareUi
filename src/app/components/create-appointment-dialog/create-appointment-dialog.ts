import { Component, DestroyRef, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, FormArray, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker'
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MAT_NATIVE_DATE_FORMATS, NativeDateAdapter, provideNativeDateAdapter } from '@angular/material/core'
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter'
import { MatNativeDateModule, DateAdapter } from '@angular/material/core'
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { enUS } from 'date-fns/locale'
import Swal from 'sweetalert2';
import { Patient, PatientCreate } from '../../models/patient.model';
import { Doctor, DoctorCreate } from '../../models/doctor.model';

export interface DoctorOptions {
  doctorID: number;
  firstName: string;
  lastName: string;
  specialization: string;
}

export interface PatientOptions {
  patientID: number;
  firstName: string;
  lastName: string;
}

@Component({
  selector: 'app-create-appointment-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTimepickerModule
  ],
  providers: [{ provide: DateAdapter, useClass: NativeDateAdapter }, { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },],
  templateUrl: './create-appointment-dialog.html',
  styleUrl: './create-appointment-dialog.scss'
})
export class CreateAppointmentDialog implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private loginService = inject(LoginService);

  constructor(
    private dialogRef: MatDialogRef<CreateAppointmentDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {mode: string, appointment: any}
  ) { }

  baseUrl = 'http://localhost:5122';

  appointmentID = 0;

  minDate = new Date();
  maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  })();

  // Common appointment statuses
  statusOptions = [
    'Scheduled',
    'Completed',
    'Cancelled'
  ];

  // Available patients and doctors (will be populated from API)
  patients: PatientOptions[] = [];
  doctors: DoctorOptions[] = [];

  createAppointmentForm = this.fb.group({
    appointmentID: [0],
    patientID: [0, Validators.required],
    doctorID: [0, Validators.required],
    appointmentDate: [new Date(), Validators.required],
    appointmentTime: [new Date(), Validators.required],
    reason: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(255)]],
    status: ['Scheduled', Validators.required],
    notes: ['', [Validators.maxLength(500)]],
    isActive: [true],
    createdAt: [new Date().toString()],
    modifiedAt: [new Date().toString()]
  });

  async loadPatients() {
    try {
      const response = await fetch(`${this.baseUrl}/api/patient`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${this.loginService.getToken()}`,
        }
      });

      if (response.ok) {
        const raw: PatientCreate[] = await response.json();    // raw PatientCreate[] (not Patient[] since PatientCreate has ALL properties)

        this.patients = raw.map(p => ({
          patientID: p.patientID!,
          firstName:  p.firstName!,
          lastName:   p.lastName!
        }));

        // manual debugging
        // console.log('PatientOptions[]:', this.patients);
      }
    } catch (error) {
      Swal.fire('Error', `${error}` || 'Could not load patients', 'error')
    }
  }

  async loadDoctors() {
    try {
      const response = await fetch(`${this.baseUrl}/api/doctor`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${this.loginService.getToken()}`
        }
      });
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      // Parse JSON payload
      const payload: {
        data: DoctorCreate[]; // raw DoctorCreate[] (not Doctor[] since DoctorCreate has ALL properties)
        totalCount: number;
        pageNumber: number;
        pageSize: number;
        totalPages: number;
      } = await response.json();

      // Map full DoctorCreate[] into DoctorOptions[]
      this.doctors = payload.data.map(d => ({
        doctorID:      d.doctorID!,
        firstName:     d.firstName!, //.replace(/^Dr\.\s*/, ''), // optional strip "Dr. "
        lastName:      d.lastName!,
        specialization: d.specialization!
      }));

      // manual debugging
      // console.log('DoctorOptions[]:', this.doctors);
    } catch (error) {
      Swal.fire('Error', `${error}` || 'Could not load doctors', 'error');
    }
  }


  onCancel() {
    Swal.fire({
      title: "Are you sure?",
      text: "This will clear all details you have filled without saving!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Close"
    }).then((result) => {
      if (result.isConfirmed) {
        // manual debugging
        // console.log('patient:- ', this.createAppointmentForm.get('patientID')?.valid)
        // console.log('doctor:- ', this.createAppointmentForm.get('doctorID')?.valid)
        // console.log('date:- ', this.createAppointmentForm.get('appointmentDate')?.valid)
        // console.log('time:- ', this.createAppointmentForm.get('appointmentTime')?.valid)
        // console.log('reason:- ', this.createAppointmentForm.get('reason')?.valid)
        // console.log('status:- ', this.createAppointmentForm.get('status')?.valid)

        // console.log('time string value:- ', this.createAppointmentForm.get('appointmentTime')?.value?.toTimeString())
        // console.log('date string value(after parsing):- ', new Date(this.createAppointmentForm.get('appointmentDate')?.value!).toDateString())

        this.dialogRef.close();
      }
    });
  }

  onSave() {
  if (this.createAppointmentForm.valid) {
    Swal.fire({
      title: "Are you sure?",
      text: "Please ensure you have entered correct details before saving!",
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "Go Back",
      confirmButtonText: "Confirm"
    }).then((result) => {
      if (result.isConfirmed) {
        // update createdAt and modifiedAt to form finalization moment
        this.createAppointmentForm.get('modifiedAt')!.setValue(new Date().toString());
        if (this.data?.mode !== 'edit') {
          this.createAppointmentForm.get('createdAt')!.setValue(new Date().toString());
        }

        // Get the Date objects from form
        const dateValue = this.createAppointmentForm.get('appointmentDate')!.value as Date;
        const timeValue = this.createAppointmentForm.get('appointmentTime')!.value as Date;

        // Combine date and time into single datetime
        const combinedDateTime = new Date(dateValue);
        combinedDateTime.setHours(timeValue.getHours(), timeValue.getMinutes(), 0, 0);

        // Set the combined datetime as string for API
        this.createAppointmentForm.get('appointmentDate')?.setValue(combinedDateTime);

        console.log(this.createAppointmentForm.value);
        this.dialogRef.close(this.createAppointmentForm.value);
      }
    });
  }
  }

  doctorToString(doctor: DoctorOptions): string {
    const doc = `${doctor.firstName} ${doctor.lastName} - ${doctor.specialization} (ID: ${doctor.doctorID})`
    return doc;
  }

  patientToString(patient: PatientOptions): string {
    const pat = `${patient.firstName} ${patient.lastName} (ID: ${patient.patientID})`
    return pat;
  }

  comparePatient = (a: number, b: number) => a === b;
  compareDoctor  = (a: number, b: number) => a === b;


  private populateFormForEdit(appointment: any): void {
    // manual debugging
    // console.log('Populating form for edit:', appointment);
    // console.log('Patient options:', this.patients);
    // console.log('Doctor options:', this.doctors);
    // console.log('Will set patientID:', appointment.patientID, 'doctorID:', appointment.doctorID);

    this.patients.forEach((p) => {
      if (p.firstName + ' ' + p.lastName == appointment.patientName) {
        appointment.patientID = p.patientID;
      }
    })

    this.doctors.forEach((d) => {
      if (d.firstName + ' ' + d.lastName == appointment.doctorName) {
        appointment.doctorID = d.doctorID;
      }
    })

    // Parse the original datetime string
    const originalDateTime = new Date(appointment.appointmentDate);

    // Create time value with same date but specific hours/minutes
    const timeValue = new Date(originalDateTime);

    // Create date value (date only, time reset to midnight)
    const dateValue = new Date(originalDateTime);

    // console.log('get date of originalDateTime:- ', originalDateTime)

    this.minDate.setFullYear(originalDateTime.getFullYear())
    this.minDate.setMonth(originalDateTime.getMonth())
    this.minDate.setDate(originalDateTime.getDate())


    // console.log('min date:- ', this.minDate)
    // console.log('max date:- ', this.maxDate)

    // Update the form with appointment data
    this.createAppointmentForm.patchValue({
      patientID: appointment.patientID,
      doctorID: appointment.doctorID,
      appointmentDate: dateValue,
      appointmentTime: timeValue,
      reason: appointment.reason,
      status: appointment.status,
      notes: appointment.notes,
      isActive: appointment.isActive,
      createdAt: appointment.createdAt,
      modifiedAt: new Date().toString() // Update modified time
    });
  }

  async ngOnInit() {
    await this.loadPatients();
    await this.loadDoctors();

    // manual debugging
    // console.log('doctor options:- ', this.doctors);
    // console.log('patient options:- ', this.patients);

    if (this.data?.mode === 'edit' && this.data?.appointment) {
      if (this.patients.length && this.doctors.length) {
        this.populateFormForEdit(this.data.appointment);
      }
    }
  }
}
