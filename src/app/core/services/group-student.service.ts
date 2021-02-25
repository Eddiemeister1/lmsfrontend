import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentsGroup {

  constructor(private http: HttpClient) { }

  addStudentGroup(student_id, course_id, groupNumber) {
    const studentsGroup = {
      student_id: student_id,
      course_id: course_id,
      groupNumber: groupNumber
    };
    return this.http.post(`${environment.apiURL}/groupsInCourse`, studentsGroup);
  }


  // Show all Groups in a Course
  allGroupsbyCourseId(course_id){
    return this.http.get(`${environment.apiURL}/groupsInCourse/ShowGroupsInCourse/${course_id}`);
  }

  // Show a Student Group Number in a Course
  showStudentGroup(student_id,course_id){
    return this.http.get(`${environment.apiURL}/groupsInCourse/StudentGroup/${student_id}/${course_id}`);
  }

  // find and show all students in a group by course id and group number.
  showAllStudentInGroup(course_id,groupNumber){
    return this.http.get(`${environment.apiURL}/groupsInCourse/AllStudentGroup/${course_id}/${groupNumber}`);
  }

  // Delete all groups in a course
  deleteAllGroups(course_id){
    return this.http.delete(`${environment.apiURL}/groupsInCourse/${course_id}`);
  }

}
