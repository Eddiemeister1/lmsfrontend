import { Injectable } from '@angular/core';
import {​ HttpClient }​ from '@angular/common/http';
import {​ environment }​ from 'src/environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor(private http: HttpClient) { }

  // Create Group.
  createGroup(student_id, course_id, groupNumber){​
    const studentGroup = {​
      student_id:student_id,
      course_id:course_id,
      groupNumber:groupNumber
    }
    return this.http.post(`${​environment.apiURL}​/groupsInCourse`, studentGroup);
  }

  // Show all Groups in a Course
  allGroupsbyCourseId(course_id){
    return this.http.get(`${environment.apiURL}/groupsInCourse/ShowGroupsInCourse/${course_id}`);
  }

  // Show a Student Group Number in a Course
  showStudentGroup(student_id,course_id){
    return this.http.get(`${environment.apiURL}/groupsInCourse/StudentGroup/${student_id}/${course_id}`);
  }

  // Delete all groups in a course
  deleteAllGroups(course_id){
    return this.http.delete(`${environment.apiURL}/groupsInCourse/${course_id}`);
  }


}
