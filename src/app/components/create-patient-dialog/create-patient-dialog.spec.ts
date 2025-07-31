import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePatientDialog } from './create-patient-dialog';

describe('CreatePatientDialog', () => {
  let component: CreatePatientDialog;
  let fixture: ComponentFixture<CreatePatientDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePatientDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreatePatientDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
