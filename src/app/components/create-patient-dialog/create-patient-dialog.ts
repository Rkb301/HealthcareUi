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
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox'

@Component({
  selector: 'app-create-patient-dialog',
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
    MatCheckboxModule
  ],
  providers: [{ provide: DateAdapter, useClass: NativeDateAdapter }, { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS },],
  templateUrl: './create-patient-dialog.html',
  styleUrl: './create-patient-dialog.scss'
})
export class CreatePatientDialog implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private loginService = inject(LoginService);

  constructor(
    private dialogRef: MatDialogRef<CreatePatientDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {mode: string, patient: any}
  ) { }

  baseUrl = 'http://localhost:5122';

  userID = 0;
  patientID = 0;

  minDate = new Date(1920, 1, 1);
  maxDate = (() => {
    const d = new Date();
    d.setDate(d.getFullYear() + 120);
    return d;
  })();

  genderOptions = [
    { gender: 'Male' },
    { gender: 'Female' },
    { gender: 'Other' }
  ];
  genderSelected = '';

  // Allergy options according to common allergies in India
  allergyOptions = [
    // Food
    'Chickpea (Bengal gram)',
    'Eggplant (Brinjal)',
    'Prawn/Shrimp',
    "Milk (Cow's milk)",
    'Egg',
    'Fish',
    'Peanut',
    'Tree nuts (Walnut, Almond)',
    'Sesame seeds',
    'Soy/Soybean',
    'Wheat/Gluten',
    'Coconut',
    'Mango',
    'Cumin',
    'Betel leaf',
    'Mushroom',
    'Rajma (Kidney beans)',
    // Environmental
    'House dust mites',
    'Cockroach',
    'Pollen (Grass, Tree, Weed)',
    'Mold/Fungi',
    'Animal dander (Cat, Dog)',
    'Rice grain dust',
    'Cotton dust',
    'Grain dust (Wheat, Bajra)',
    'Tobacco smoke',
    'Air pollution/Smog',
    // Drug
    'Penicillin',
    'Sulfa drugs',
    'NSAIDs (Diclofenac, Aspirin, Ibuprofen)',
    'Paracetamol',
    'Cephalosporins',
    'Anticonvulsants',
    'Contrast media',
    'Anesthetics',
    'Insulin',
    'Local anesthetics',
    'Iodine',
    // Contact
    'Latex',
    'Nickel',
    // Insect/Animal
    'Bee stings',
    'Wasp stings',
    'Ant bites',
    'Mosquito bites',
    'Pet dander',
    'Bird feathers',
    'Shellfish',
    // Other
    'Other',
    'None'
  ];

  displayedAllergyOptions = [...this.allergyOptions];

  // flow for patient creation
  // patientID randomly generated similarly to userID method
  // userID grabbed from variable in login service
  // enter first name, last name
  // enter date of birth
  // enter gender
  // enter contact number
  // enter address
  // medical history, current medications defaulted to null/empty string/None
  // allergies to be selected from a multi selectable dropdown list of common allergies with an option
  // for "other"
  // other text box not working, left for future implementation
  // createdAt, modifiedAt defaulted to current date and time
  // isActive defaulted to true

  createPatientForm = this.fb.group({
    patientID: [this.randomIdGenerator(92, 999999)],
    userID: [this.userID],
    firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
    dateOfBirth: ['', Validators.required],
    gender: ['', Validators.required],
    contactNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    medicalHistory: [''],
    currentMedications: [''],
    allergies: this.fb.array([], Validators.required),
    // otherAllergy: [''],
    createdAt: [new Date().toString()],
    modifiedAt: [new Date().toString()],
    isActive: [true]
  });

  // random patientID generator inclusive of max in range
  randomIdGenerator(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    const id = Math.floor(Math.random() * (max - min + 1)) + min;
    // get all existing patientIDs and check the newly generated one, if existing, generate again, then return
    // ^ to be implemented
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  async getUserID() {
    // this.patientID = this.randomIdGenerator(92, 999999);
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

  get allergiesArray(): FormArray {
    return this.createPatientForm.get('allergies') as FormArray;
  }

  // add and remove allergy form controls from allergies form control array as they are checked and unchecked
  onAllergyChange(option: string, event: MatCheckboxChange) {
    const arr = this.allergiesArray;

    if (event.checked) {
      arr.push(new FormControl(option));

    } else {
      // remove control from allergies array when unchecked after finding their index
      const index = arr.controls.findIndex(control => control.value === option);

      if (index >= 0) {
        arr.removeAt(index);
      }
    }
  }

  onCancel() {
    // manual debug tools :D

    // console.log('1' + this.createPatientForm.get('patientID')?.status)
    // console.log('2' + this.createPatientForm.get('userID')?.status)
    // console.log('3' + this.createPatientForm.get('firstName')?.status)
    // console.log('4' + this.createPatientForm.get('lastName')?.status)
    // console.log('5' + this.createPatientForm.get('dateOfBirth')?.status)

    // console.log('6' + this.createPatientForm.get('gender')?.status)
    // console.log('7' + this.createPatientForm.get('contactNumber')?.status)
    // console.log('8' + this.createPatientForm.get('address')?.status)
    // console.log('9' + this.createPatientForm.get('medicalHistory')?.status)
    // console.log('10' + this.createPatientForm.get('currentMedications')?.status)

    // console.log('11' + this.createPatientForm.get('allergies')?.status)
    // console.log('12' + this.createPatientForm.get('allergies')?.value)
    // console.log('13' + this.createPatientForm.get('createdAt')?.status)
    // console.log('14' + this.createPatientForm.get('modifiedAt')?.status)
    // console.log('15' + this.createPatientForm.get('isActive')?.status)

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
    if (this.createPatientForm.valid) {
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
          this.createPatientForm.get('modifiedAt')!.setValue(new Date().toString());
          this.createPatientForm.get('createdAt')!.setValue(new Date().toString());

          // set date of birth to its string form
          const currentDOB = this.createPatientForm.get('dateOfBirth')!.value;
          this.createPatientForm.get('dateOfBirth')!.setValue(currentDOB!.toString());

          this.getUserID();

          // set both IDs again
          this.createPatientForm.get('patientID')!.setValue(this.randomIdGenerator(92, 999999));
          this.createPatientForm.get('userID')!.setValue(this.userID);

          this.dialogRef.close(this.createPatientForm.value)
        }
      });
    }
  }

  ngOnInit() {
    this.getUserID();

    if (this.data?.mode === 'edit' && this.data?.patient) {
      this.populateFormForEdit(this.data.patient);
    }
  }

  private populateFormForEdit(patient: any): void {
    // Convert allergies string back to array for checkboxes
    const allergiesArray =
      patient.allergies
        ? patient.allergies.split(',').map((a: string) => a.trim())
        : [];

    // Update the form with patient data
    this.createPatientForm.patchValue({
      patientID: patient.patientID,
      userID: patient.userID,
      firstName: patient.firstName,
      lastName: patient.lastName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      contactNumber: patient.contactNumber,
      address: patient.address,
      medicalHistory: patient.medicalHistory,
      currentMedications: patient.currentMedications,
      createdAt: patient.createdAt,
      modifiedAt: new Date().toString(), // Update modified time
      isActive: patient.isActive
    });

    // Populate the allergies FormArray
    const allergiesFormArray = this.allergiesArray;
    allergiesFormArray.clear(); // Clear existing controls

    // this.displayedAllergyOptions = [...this.allergyOptions];
    const allergyOptionsSet = new Set(this.allergyOptions);

    // const allergyStrings = patient.allergies.split(',');

    // for (let i = 0; i < allergyStrings.length; i++) {
    //   const allergy = allergyStrings[i].trim();
    //   if (!allergy) {
    //     continue; // skip empty entries
    //   }

    //   // Add every allergy to the FormArray
    //   allergiesFormArray.push(new FormControl(allergy));
    // }

    allergiesArray.forEach((allergy: string) => {
      if (allergy && allergyOptionsSet.has(allergy)) {
        allergiesFormArray.push(new FormControl(allergy));

      } else if (allergy && !allergyOptionsSet.has(allergy)) {
        allergiesFormArray.push(new FormControl('Other')); // Add 'Other' if allergy is empty or not in options
      }
    });

    // Set gender selection for the UI
    this.genderSelected = patient.gender;
  }
}
