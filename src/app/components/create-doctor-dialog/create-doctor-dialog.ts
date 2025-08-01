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
import { TableShell } from '../table-shell/table-shell';

@Component({
  selector: 'app-create-doctor-dialog',
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
    MatTimepickerModule,
    // TableShell
  ],
  providers: [{ provide: DateAdapter, useClass: NativeDateAdapter }, { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },],
  templateUrl: './create-doctor-dialog.html',
  styleUrl: './create-doctor-dialog.scss'
})
export class CreateDoctorDialog implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private loginService = inject(LoginService);

  constructor(
    private dialogRef: MatDialogRef<CreateDoctorDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {mode: string, doctor: any}
  ) { }

  baseUrl = 'http://localhost:5122';

  userID = 0;
  doctorID = 0;

  specializationOptions = [
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Neurology',
    'Orthopedics',
    'Pediatrics'
  ];

  scheduleOptions = [
    'Mon-Fri 9:00 AM - 5:00 PM',
    'Mon-Sat 9:00 AM - 6:00 PM',
    'Mon-Fri 10:00 AM - 6:00 PM',
    'Mon-Wed-Fri 9:00 AM - 5:00 PM',
    'Tue-Thu-Sat 10:00 AM - 6:00 PM',
    'Mon-Fri 8:00 AM - 4:00 PM',
    'Mon-Sat 8:00 AM - 2:00 PM',
    'Evening: Mon-Fri 2:00 PM - 8:00 PM',
    'Morning: Mon-Sat 8:00 AM - 1:00 PM',
    'On Call - 24/7'
  ];

  createDoctorForm = this.fb.group({
    doctorID: [this.randomIdGenerator(7, 999999)],
    userID: [this.userID],
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    specialization: ['', Validators.required],
    contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
    schedule: ['', [Validators.required, Validators.maxLength(255)]],
    createdAt: [new Date().toString()],
    modifiedAt: [new Date().toString()],
    isActive: [true]
  });

  // random doctorID generator inclusive of max in range
  randomIdGenerator(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    const id = Math.floor(Math.random() * (max - min + 1)) + min;
    // get all existing doctorIDs and check the newly generated one, if existing, generate again, then return
    // ^ to be implemented
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async getUserID() {
    this.loginService.getRole();
    this.loginService.getUsername();
    this.loginService.getUserEmail();

    const response = await fetch(`${this.baseUrl}/api/user/search?username=${this.loginService.getUsername()}&email=${this.loginService.getUserEmail()}&role=${this.loginService.getRole()}`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${this.loginService.getToken()}`,
      }
    });

    if (response.ok) {
      const data = await response.text();
      const obj = JSON.parse(data);
      this.userID = obj.data[0].userID;
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
        this.dialogRef.close();
      }
    });
  }

  onSave() {
    if (this.createDoctorForm.valid) {
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
          this.createDoctorForm.get('modifiedAt')!.setValue(new Date().toString());
          this.createDoctorForm.get('createdAt')!.setValue(new Date().toString());

          this.getUserID();

          // set both IDs again
          this.createDoctorForm.get('doctorID')!.setValue(this.randomIdGenerator(7, 999999));
          this.createDoctorForm.get('userID')!.setValue(this.userID);

          this.dialogRef.close(this.createDoctorForm.value)
        }
      });
    }
  }

  private populateFormForEdit(doctor: any): void {
    // Update the form with doctor data
    this.createDoctorForm.patchValue({
      doctorID: doctor.doctorID,
      userID: doctor.userID,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      specialization: doctor.specialization,
      contactNumber: doctor.contactNumber,
      email: doctor.email,
      schedule: doctor.schedule,
      createdAt: doctor.createdAt,
      modifiedAt: new Date().toString(), // Update modified time
      isActive: doctor.isActive
    });
  }

  ngOnInit() {
    this.getUserID();

    if (this.data?.mode === 'edit' && this.data?.doctor) {
      this.populateFormForEdit(this.data.doctor);
    }
  }
}
