import { TestBed } from '@angular/core/testing';

import { StudentsGroup } from './group-student.service';

describe('CourseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StudentsGroup = TestBed.get(StudentsGroup);
    expect(service).toBeTruthy();
  });
});
