import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentVideoProgressService {

  constructor(private http: HttpClient ) { }

  addProgress(student_id, video_id, progressStatus, take, leftOffMoment) {
    const videoProgress = {
      student_id: student_id, 
      video_id: video_id, 
      progressStatus: progressStatus,
      take: take,
      leftOffMoment: leftOffMoment
    }
    return this.http.post(`${environment.apiURL}/stuvidprogress`, videoProgress);
  }
  getProgress(student_id, video_id) {
    return this.http.get(`${environment.apiURL}/stuvidprogress/${student_id}/${video_id}`);
  }
  setProgress(student_id, video_id, progressStatus, take, bodyData) {
    return this.http.put(`${environment.apiURL}/stuvidprogress/${student_id}/${video_id}/${progressStatus}/${take}`, bodyData);
  }

  getAllVideosProgress (student_id) {
    return this.http.get(`${environment.apiURL}/stuvidprogress/${student_id}`);
  }
}
