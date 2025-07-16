import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookAppointmentDialog } from './book-appointment-dialog';

describe('BookAppointmentDialog', () => {
  let component: BookAppointmentDialog;
  let fixture: ComponentFixture<BookAppointmentDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookAppointmentDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookAppointmentDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
