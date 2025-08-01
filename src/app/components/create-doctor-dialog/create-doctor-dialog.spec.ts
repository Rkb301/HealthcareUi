import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDoctorDialog } from './create-doctor-dialog';

describe('CreateDoctorDialog', () => {
  let component: CreateDoctorDialog;
  let fixture: ComponentFixture<CreateDoctorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDoctorDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDoctorDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
