import { Component, DestroyRef, inject, Inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
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

export interface Specialization {
  specialization: string;
}

export interface DoctorSelect {
  id: number;
  doctor: string;
  gender: string;
}

export interface ReasonSelect {
  reason: string;
}

@Component({
  selector: 'app-book-appointment-dialog',
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
  providers: [ {provide: DateAdapter, useClass: NativeDateAdapter}, {provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS}, ],
  templateUrl: './book-appointment-dialog.html',
  styleUrl: './book-appointment-dialog.scss'
})
export class BookAppointmentDialog {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private loginService = inject(LoginService);

  baseUrl = 'http://localhost:5122';

  specializationSelected = '';
  doctorSelected = '';
  reasonSelected = '';

  doctorChoiceShow = false;
  appointmentDateTimeShow = false;
  reasonShow = false;
  reasonOtherShow = false;

  doctorOptions: DoctorSelect[] = []
  reasonOptions: ReasonSelect[] = [
    { reason: 'Regular Check-up' },
    { reason: 'Follow up visit' },
    { reason: 'Vaccination' },
    { reason: 'Other' }
  ]

  doctorID = 0;
  doctorFirstName = '';
  doctorLastName = '';

  minDate = new Date();
  maxDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d;
  })();

  // flow for appointment booking:-
  // specialization choice
  // doctor choice show
  // appointment date show
  // reason choice (basic options like regular checkup, follow up, vaccination, other)
  // reason choice = other --> opens text box for patient to describe reason in short
  // after reason choice forms becomes valid and save becomes available
  // confirmation popup for cancel while filling to prevent accidental form closure
  // confirmation popup for save and book to prevent wrong details being sent

  appointmentForm = this.fb.group({
    specialization: ['', Validators.required],
    date: ['', Validators.required],
    time: ['', Validators.required],
    reason: ['', Validators.required],
    doctorChoice: ['', Validators.required]
  });

  constructor(
    private dialogRef: MatDialogRef<BookAppointmentDialog>,
    @Inject(MAT_DIALOG_DATA) public specialistOptions: Specialization[]
  ) { }

  ngOnInit() {
    this.dialogRef.disableClose = true;
  }

  onCancel() {
    Swal.fire({
      title: "Are you sure?",
      text: "You will have to fill the form again to book an appointment!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Cancel booking"
    }).then((result) => {
      if (result.isConfirmed) {
        this.dialogRef.close();
      }
    });
  }

  onSave() {
    if (this.appointmentForm.valid) {
      Swal.fire({
        title: "Are you sure?",
        text: "Please confirm your selections, you will not be able to make any changes after clicking 'Confirm Booking'!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Confirm Booking"
      }).then((result) => {
        if (result.isConfirmed) {
          const newDate = new Date(this.appointmentForm.get('date')?.value!)
          const newTime = new Date(this.appointmentForm.get('time')?.value!)

          const appointmentDate = newDate.toDateString() + ' ' + newTime.toTimeString()

          this.appointmentForm.get('date')?.setValue(appointmentDate);
          this.dialogRef.close(this.appointmentForm.value)
        }
      });
    }
  }

  async getSpecificDoctors() {
    this.doctorOptions = [];
    const response =
      await fetch(`${this.baseUrl}/api/doctor/search?specialization=${this.specializationSelected}`, {
        method: "GET",
        headers: {'Authorization': `Bearer ${this.loginService.getToken()}`}
    })

    console.log("Show doctor choice");
    this.doctorChoiceShow = true;

    if (response.ok) {
      const data = await response.text();
      const objs = JSON.parse(data);

      console.log(objs.data);
      this.doctorOptions = [];

      this.doctorOptions = objs.data.map((doctor: any, index: any) => ({
        id: doctor.doctorID,
        doctor: `${doctor.firstName} ${doctor.lastName}`,
        gender: 'placeholder'
      }));
    }
  }

  showAppointmentDateTime() {
    this.appointmentDateTimeShow = true;
  }

  showReasonSelector() {
    this.reasonShow = true;
  }

  showReasonOtherBox() {
    if (this.reasonSelected != "Other") {
      this.reasonOtherShow = false;
    }
    switch (this.reasonSelected) {
      case 'Regular Check-up':
        break;
      case 'Follow up visit':
        break;
      case 'Vaccination':
        break;
      case 'Other':
        if (this.reasonOtherShow == false) {
          this.reasonOtherShow = true;
          this.appointmentForm.setErrors({invalid: true})
        } else {
          this.reasonOtherShow = false;
          this.appointmentForm.setErrors({invalid: false})
        }
        break;
      default:
        break;
    }
  }

}
