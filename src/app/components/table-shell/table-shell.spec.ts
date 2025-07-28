import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableShell } from './table-shell';

describe('TableShell', () => {
  let component: TableShell;
  let fixture: ComponentFixture<TableShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableShell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableShell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
