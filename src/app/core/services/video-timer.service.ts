import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoTimerService {
  private routerInfo: BehaviorSubject<number>;
  constructor() {
    this.routerInfo = new BehaviorSubject<number>(0);

   }

  getWatchedPercentage(): Observable<number> {
    return this.routerInfo.asObservable();
  }
  setWatchedPercentage(newValue): void {
    this.routerInfo.next(newValue);
  }
}
