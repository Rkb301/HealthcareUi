import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export interface Specialization {
  id: number;
  specialization: string;
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
    MatDialogModule
],
  templateUrl: './book-appointment-dialog.html',
  styleUrl: './book-appointment-dialog.scss'
})
export class BookAppointmentDialog {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  appointmentForm = this.fb.group({
    specialization: ['', Validators.required],
    doctorName: ['', [Validators.required]],
    date: ['', Validators.required],
    reason: ['', Validators.required]
  });

  constructor(
    private dialogRef: MatDialogRef<BookAppointmentDialog>,
    @Inject(MAT_DIALOG_DATA) public specialistOptions: Specialization[]
  ) {}

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (this.appointmentForm.valid) {
      this.dialogRef.close(this.appointmentForm.value)
    }
  }
}
