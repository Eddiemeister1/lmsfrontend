import { Component, OnInit } from '@angular/core';
import { StudentCourseService } from 'src/app/core/services/student-course.service';
import { Router, ActivatedRoute } from '@angular/router';

import { StudentGroup } from '@app/core/models/studentGroup.model';
import { StudentsGroup } from '@app/core/services/group-student.service';
import { CourseService } from '../../../core/services/course.service';
import { Observable } from 'rxjs';

import { AuthenticationService } from '@app/core/services/authentication.service';
import decode from 'jwt-decode';

import { User } from '@app/core/models/user'; 
@Component({
  selector: 'app-people',
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.scss']
})
export class PeopleComponent implements OnInit {
  students:any[] = [];
  courseId;
  currentUser: User;
  userPayload: User;
  group_Number:any;
  studentsGroups:any[] = [];
  studentsGroups2:any[] = [];
  studentG:any[] = [];
  studentsALL:any[] = [];
  studentsALL2:any[] = [];
  finalArrayGroups:any[] = [];
  finalArrayGroupsALL:any[] = [];
  showAllGroups:any[] = [];
  totalGroup:number;
  gNumber:number;

  studentMenu: string[] = ['all','groups'];
  selectedTab = this.studentMenu[0];

  constructor(private courseService: CourseService, private studentsGroup: StudentsGroup, private studentCourseService: StudentCourseService, private router: Router, private route: ActivatedRoute, private authenticationService: AuthenticationService) {
  this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.courseId = params.id;
      console.log("param id is: " + params.id);
    })
    //this.userPayload = decode(this.currentUser.token); 

    this.fetchStudents(this.courseId);
    this.fetchStudentsGroup(this.currentUser.id, this.courseId);
    this.fetchALLStudentsGroup(this.courseId);
  }

 // Gets students from course ID
  fetchStudents(courseId) {
    console.log("fetching students");
    this.studentCourseService.getStudentsByCourseId(courseId).subscribe((data: any[]) => {
      this.students = data;
      //console.log("student in course: " + JSON.stringify(data));
      this.students.sort((a, b) => {
        return b.points - a.points;
      });
    });
  }

  toFixed(value, precision) {
    var power = Math.pow(10, precision || 0);
    return String(Math.round(value * power) / power);
  }

  // Show current User Group. 
  fetchStudentsGroup(currentUser, courseId){
    console.log("fetching all students in a group.");
    this.studentsGroup.showStudentGroup(currentUser, courseId).subscribe((data0: any[]) => {
      // console.log("student group: " + JSON.stringify(data0));
      this.studentG = data0;
      this.studentG.forEach((studentInGroup: any, i, arr) => {
        this.group_Number = studentInGroup.groupNumber;  
        console.log('group: ' + this.group_Number); // get group number
      })

      this.studentsGroup.showAllStudentInGroup(courseId,this.group_Number).subscribe((data1: any[]) => {
        console.log('all student in group # ' + this.group_Number + ':'  + JSON.stringify(data1));
        this.studentsGroups = data1;
        var count = 0,
            idArray = [];

        this.studentsGroups.forEach((student_group: any, i, arr) => {
          count += 1;
          idArray.push(student_group.student_id);  // get all students id current group
        })
        console.log('All group id: ' + idArray);

        this.studentCourseService.getStudentsByCourseId(courseId).subscribe((data: any[]) => {
          this.studentsALL = data;
          this.studentsALL.forEach((student: any, i, arr) => {
            for(var i = 0; i < count; i ++){
              if(idArray[i] == student.student_id){
                this.finalArrayGroups.push(student);  // get all students info 
              } 
            }
          })
        });
      });
    })
  }

  counter(i: number) {
    return new Array(i);
  }

  // Show current User Group. 
  fetchALLStudentsGroup(courseId){
    console.log("######## fetching all students in a group. ##########");
    this.gNumber = 0;

    this.courseService.getGroupByCourseId(courseId).subscribe((course: any) => {
      this.totalGroup = course.tgroup;
      console.log('#------------------> this data: ' + this.totalGroup)
    
      var j=0,
          tmp=0;
      for( j=0; j < this.totalGroup; j++){
        this.gNumber = this.gNumber + 1;
        this.studentsGroup.showAllStudentInGroup(courseId,this.gNumber).subscribe((data3: any[]) => {
          tmp += 1;
          console.log('#---> this is group #' + tmp);
          console.log('#---> All student in group # ' + tmp + ':'  + JSON.stringify(data3));
          this.studentsGroups2 = data3;
          var count2 = 0,
              idArray2 = [];

          this.studentsGroups2.forEach((student_group: any, i, arr) => {
            count2 += 1;
            idArray2.push(student_group.student_id);  // get all students id current group
          })
          console.log('###--->>> All group-' + tmp + ' id: ' + idArray2);

          this.studentCourseService.getStudentsByCourseId(courseId).subscribe((data4: any[]) => {
            this.finalArrayGroupsALL = [];
            this.studentsALL2 = data4;
            this.studentsALL2.forEach((student: any, i, arr) => {
              for(var i = 0; i < count2; i ++){
                if(idArray2[i] == student.student_id){
                  this.finalArrayGroupsALL.push(student);  // get all students info 

                } 
              }
            })
            console.log('&&&&&&--->>>>>' + JSON.stringify(this.finalArrayGroupsALL));
            this.showAllGroups.push(this.finalArrayGroupsALL);
          });
          
        });
      }

    });
  }
}
