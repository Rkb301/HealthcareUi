import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorTable } from './doctor-table';

describe('DoctorTable', () => {
  let component: DoctorTable;
  let fixture: ComponentFixture<DoctorTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorTable]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorTable);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
