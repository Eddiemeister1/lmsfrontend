import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentPdfProgressService {

  constructor(private http: HttpClient) { }

  addProgress(student_id, pdf_id, progressStatus) {
    const pdfProgress = {
      student_id: student_id, 
      pdf_id: pdf_id, 
      progressStatus: progressStatus
    }
    return this.http.post(`${environment.apiURL}/stupdfprogress`, pdfProgress);
  }
  /*
  getProgress(student_id, pdf_id) {
    return this.http.get(`${environment.apiURL}/stupdfprogress/${student_id}/${pdf_id}`);
  }
  
  setProgress(pdf_id, progressStatus, bodyData) {
    return this.http.put(`${environment.apiURL}/stupdfprogress/${pdf_id}/${progressStatus}`, bodyData);
  }
  setStudentProgress(student_id, pdf_id, progressStatus, bodyData) {
    return this.http.put(`${environment.apiURL}/stupdfprogress/${student_id}/${pdf_id}/${progressStatus}`, bodyData);    
  
  deleteProgress(pdf_id) {
    return this.http.delete(`${environment.apiURL}/stupdfprogress/${pdf_id}`); 
  }
  */
  getAllPdfsProgress(student_id) {
    return this.http.get(`${environment.apiURL}/stupdfprogress/${student_id}`)
  }
}

