import { TestBed } from '@angular/core/testing';
import { CanDeactivateFn } from '@angular/router';

import { unauthorizedGuard } from './unauthorized-guard';

describe('unauthorizedGuard', () => {
  const executeGuard: CanDeactivateFn<unknown> = (...guardParameters) => 
      TestBed.runInInjectionContext(() => unauthorizedGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
