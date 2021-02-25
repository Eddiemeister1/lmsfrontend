import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentModuleProgressService {

  constructor(private http: HttpClient ) { }

  addProgress(student_id,course_id ,module_id, progressStatus, module_number) {
    const moduleProgress = {
      student_id: student_id,
      course_id:course_id, 
      module_id: module_id, 
      progressStatus: progressStatus,
      module_number: module_number
    }
    return this.http.post(`${environment.apiURL}/stumodprogress`, moduleProgress);
  }
  
  setProgress(student_id, module_id, progressStatus, bodyData) {
    return this.http.put(`${environment.apiURL}/stumodprogress/${student_id}/${module_id}/${progressStatus}`, bodyData);
  }

  getAllModulesProgress (student_id, course_id) {
    return this.http.get(`${environment.apiURL}/stumodprogress/${student_id}/${course_id}`);
  }
}
