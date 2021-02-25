import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { BehaviorSubject } from 'rxjs'

@Injectable({
    providedIn: 'root'
  })
export class GameService {

    constructor(private http: HttpClient) { }

    getHighScore(courseId,currentUser){
        return this.http.get(`${environment.apiURL}/getHighScore/${courseId}/${currentUser.id}`);
    }
    
    setHighScore(studentHighScore,courseId,currentUser){
         return this.http.put(`${environment.apiURL}/setHighScore`,{
           studentScore: studentHighScore,
           courseHighScore:0,
           course_id:  courseId,
           student_id: currentUser.id
         })
    }
    getCourseHighScore(courseId, currentUser){
      return this.http.get(`${environment.apiURL}/getCourseHighScore/${courseId}/${currentUser.id}`);
    }
    setCourseHighScore(courseId, high_score, currentUser){
      return this.http.put(`${environment.apiURL}/setCourseHighScore`,{
        high_score, 
        course_id:courseId, 
        student_id:currentUser.id
      })
    }

    getAllScoresByCourseId(courseId,currentUser){
      return this.http.get(`${environment.apiURL}/getAllScoresByCourse/${courseId}`);
    }

      
      

}