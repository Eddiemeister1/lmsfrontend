import { TestBed } from '@angular/core/testing';

import { VideoTimerService } from './video-timer.service';

describe('VideoTimerService', () => {
  let service: VideoTimerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoTimerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
