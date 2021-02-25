import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentSurveyProgressService {

  constructor(private http: HttpClient ) { }
  ////// Create a Survey Progress.
  addProgress(student_id, survey_id, progressStatus, score) {
    const surveyProgress = {
      student_id: student_id, 
      survey_id: survey_id, 
      progressStatus: progressStatus,
      score: score
      
    }
    return this.http.post(`${environment.apiURL}/stusurveyprogress`, surveyProgress);
  }
  ////// Get a Survey Progress by Student id and Survey id and return a Boolean.
  getProgressBoolean(student_id, survey_id) {
    return this.http.get(`${environment.apiURL}/stusurveyprogress/${student_id}/${survey_id}`);
  }
  ////// Get a Survey Progress by Student id and Survey id and return all Data. 
  getProgressData(student_id, survey_id) {
    return this.http.get(`${environment.apiURL}/stusurveyprogress/data/${student_id}/${survey_id}`);
  }
  ////// Update a Survey Progress. 
  setProgress(student_id, survey_id, progressStatus, score, bodyData) {
    return this.http.put(`${environment.apiURL}/stusurveyprogress/${student_id}/${survey_id}/${progressStatus}/${score}`, bodyData);
  }
  ////// Get all Surveys Progress for one Student by his id.
  getAllSurveyProgress(student_id) {
    return this.http.get(`${environment.apiURL}/stusurveyprogress/${student_id}`);
  }
}
