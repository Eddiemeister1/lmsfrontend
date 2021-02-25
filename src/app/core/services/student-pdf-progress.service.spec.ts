import { TestBed } from '@angular/core/testing';

import { StudentPdfProgressService } from './student-pdf-progress.service';

describe('StudentPdfProgressService', () => {
  let service: StudentPdfProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentPdfProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
