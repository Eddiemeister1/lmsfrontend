import { TestBed } from '@angular/core/testing';

import { StudentModuleProgressService } from './student-module-progress.service';

describe('StudentModuleProgressService', () => {
  let service: StudentModuleProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentModuleProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
