import { TestBed } from '@angular/core/testing';

import { StudentVideoProgressService } from './student-video-progress.service';

describe('StudentVideoProgressService', () => {
  let service: StudentVideoProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentVideoProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});