import { TestBed } from '@angular/core/testing';

import { StudentSurveyProgressService } from './student-survey-progress.service';

describe('StudentSurveyProgressService', () => {
  let service: StudentSurveyProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentSurveyProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
