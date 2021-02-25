import { Component, ElementRef, OnInit, Sanitizer, ViewChild, ViewChildren, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatVerticalStepper } from '@angular/material/stepper';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { NgbModal, NgbButtonLabel, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

import { Observable, forkJoin } from 'rxjs';
import {map} from 'rxjs/operators';

import { PdfService } from '@app/core/services/pdf.service';
import { VideoService } from '@app/core/services/video.service';
import { SurveyService } from '@app/core/services/survey.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { StudentCourseService } from '@app/core/services/student-course.service';
import { StudentSurveyProgressService } from '@app/core/services/student-survey-progress.service';
import { ModuleService } from 'src/app/core/services/module.service';
import { StudentVideoProgressService } from '@app/core/services/student-video-progress.service';
import { StudentModuleProgressService } from '@app/core/services/student-module-progress.service';
import { CourseDetailsService } from '@app/core/services/course-details.service';
import { StudentGroup } from '@app/core/models/studentGroup.model';
import { StudentsGroup } from '@app/core/services/group-student.service';


import { User } from '@app/core/models/user';
import decode from 'jwt-decode';


import { analyzeAndValidateNgModules } from '@angular/compiler';
import { resolve } from 'url';
//imported the student pdf progress service from the service file
import { StudentPdfProgressService } from '@app/core/services/student-pdf-progress.service';

import { YoutubePlayerComponent } from '@app/modules/course/youtube-player/youtube-player.component';
import { KeyValuePipe } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public Editor = ClassicEditor;
  public editorData;
  courseId;
  courseDetails: any;
  public courseContent;
  isCleared = false;
  currentUser: User;
  tokenPayload;
  isAdmin;
  isInstructor;
  isStudent;
  todayDate;

  points: number;
  courseTotalPoinst: number;
  pointsInGroup: number;
  totalPointsInGroup: number;
  averagePoints;
  urlPath;
  courseIdPromise: Promise<string>;
  toggleContent = [];
  moduleVideosFetched = [];
  modulePDFsFetched = [];
  moduleSurveysFetched: Boolean[] = [];


  allSurveyScores = new Map<number, number>();

  waitForProgressBarTimeout;


  /////////////////

  modules = [];

  linksFromDB: string[] = new Array();
  links: any[] = new Array();
  safeLinks = new Map<number, Object[]>();

  allPdfProgress = new Map<number, boolean>();
  allModuleProgress = new Array();
  filteredModuleProgrss = new Array();


  allSurveyProgress = new Map<number, boolean>();
  submitted = false;
  error = '';

  group_Number:any;
  studentsGroups:any[] = [];
  studentG:any[] = [];
  studentsALL:any[] = [];
  finalArrayGroups:any[] = [];
  pointsArray = [];
  finalPointsArray = [];


  @ViewChild('timelineStepper') stepper: MatVerticalStepper;

  /////////////////

  constructor(
    private courseDetailsService: CourseDetailsService,
    private route: ActivatedRoute, 
    private studentsGroup: StudentsGroup,
    private authenticationService: AuthenticationService,
    private studentSurveyProgress:StudentSurveyProgressService,
    private moduleService: ModuleService,
    private videoService: VideoService, 
    private pdfService: PdfService, 
    private surveyService: SurveyService,
    private studentCourseService: StudentCourseService,
    private fb: FormBuilder, 
    private router: Router, 
    private sanitizer: DomSanitizer, 
    private modalService: NgbModal,
    private zone:NgZone, 
  ) 
  {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.courseId = params.id;
      this.courseIdPromise = new Promise((resolve, reject) => {
        if(params.id){
          resolve(params.id);
        } else {
          reject("couldn't find course id");
        }
      });
      console.log("param id is: " + params.id);
    })


    this.todayDate = new Date();

    this.isAdmin = (this.currentUser.role === "admin");
    this.isInstructor = (this.currentUser.role === "instructor");
    this.isStudent = (this.currentUser.role === "student");

    this.getAvgStudentPoints(this.courseId, this.currentUser.id);

    

   
    this.courseContent = this.courseDetailsService.getCourseDetails(this.courseId);

    this.courseDetailsService.getCourseDetails(this.courseId).subscribe((data: any) => {
      this.courseDetails = data;
      //console.log(data);
    })

    this.studentCourseService.getTotalPossiblePoints(this.courseId).subscribe((data: any[]) => {
      let array = data[0];
      let totalP = array[0].S;
      this.courseTotalPoinst = array[0].S;
      console.log('course id: ' + this.courseId);
      console.log('current user id: ' + this.currentUser.id);
      this.studentCourseService.getStudentPoints(this.courseId, this.currentUser.id).subscribe((data2: any[]) => {
        let arr = data2[0];
        this.points = arr[0].P;
        // converting points to percentage
        this.points = Math.round((this.points * 100) / totalP);
        console.log('student ' + this.currentUser.f_name + ' ' + this.currentUser.l_name + ' has: ' + this.points + ' % of total points');
      });
    });


    this.getAvgGroupsPoints(this.currentUser.id, this.courseId);

  }

  

  public onReady(editor){
    editor.setData("");
  }

  redirectTo(uri: string){
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
    this.router.navigate([uri]));
  }

  public onChange( { editor }: ChangeEvent){
    this.editorData = editor.getData();

    if(this.isCleared){
      editor.setData("");
      this.isCleared = false;
    }
    console.log(this.editorData);
  }

  onSubmit(id){
    this.courseDetailsService.updateCourseDetails(id, this.editorData).subscribe(() => {
      alert("Submitted Content");
    });
  }

  onClearButtonClicked(id){
    let r = confirm("Clear content; Are you sure?");
    if(r){
      this.courseDetailsService.clearCourseDetails(id).subscribe(() => {
        alert("Cleared Content");
        this.isCleared = true;
      })
    }
  }

  getAvgStudentPoints(courseId, studentId){
    console.log("Called avgstudentpoints on student_id: " + studentId);
    this.studentCourseService.getAvgStudentPoints(courseId, studentId).subscribe((data: any[]) => {
      this.averagePoints = data[0].P;
      console.log("Course avg is: " + this.averagePoints);
      //this.averagePoints.average = this.toFixed(this.averagePoints.average, 2);
    });
  }

  toFixed(value, precision) {
    var power = Math.pow(10, precision || 0);
    return String(Math.round(value * power) / power);
  }


  getAvgGroupsPoints(studentId, courseId){
    console.log("########### getAvgGroupsPoints Function ###########" );
    this.studentsGroup.showStudentGroup(studentId, courseId).subscribe((data0: any[]) => {
      // console.log("student group: " + JSON.stringify(data0));
      this.studentG = data0;
      this.studentG.forEach((studentInGroup: any, i, arr) => {
        this.group_Number = studentInGroup.groupNumber;  
        console.log('#$#$#$#$#$--->>>>> group: ' + this.group_Number); // get group number
      })

      this.studentsGroup.showAllStudentInGroup(courseId,this.group_Number).subscribe((data1: any[]) => {
        console.log('all student in group # ' + this.group_Number + ':'  + JSON.stringify(data1));
        this.studentsGroups = data1;
        var count = 0,
            idArray = [];

        this.studentsGroups.forEach((student_group: any, i, arr) => {
          this.studentCourseService.getStudentsByCourseId(courseId).subscribe((dataFind: any[]) => {
            count += 1;
            idArray.push(student_group.student_id);  // get all students id current group
          })
        })
        console.log('All group id: ' + idArray);

        this.studentCourseService.getStudentsByCourseId(courseId).subscribe((data: any[]) => {
          this.studentsALL = data;
          this.studentsALL.forEach((student: any, i, arr) => {
            for(var i = 0; i < count; i ++){
              if(idArray[i] == student.student_id){
                this.pointsArray.push(student.points);  // get all students points
              } 
            }
          })
          console.log('#$#$#$#$#$--->>>>> Points Array: ' + this.pointsArray);
          console.log('#$#$#$#$#$--->>>>> Length of pointsArray: ' + count);
          console.log('#$#$#$#$#$--->>>>> Course Max of points: ' + this.courseTotalPoinst);
          
          this.pointsInGroup = 0;
          this.totalPointsInGroup = 0;
          for(var j=0; j < count; j++){
            console.log(this.pointsArray[j] + '<<<===');
            this.pointsInGroup = Math.round((this.pointsArray[j] * 100) / this.courseTotalPoinst);
            this.totalPointsInGroup = this.totalPointsInGroup + this.pointsInGroup;
            console.log('student ' + idArray[j] + ' has: ' + this.pointsInGroup + ' % of total points');
          }
          
          this.totalPointsInGroup = Math.round(this.totalPointsInGroup/count);
          console.log('Total poinst on group #' + this.group_Number + ' is ' + this.totalPointsInGroup);
        });

       // pointsInGroup: number;
       // totalPointsInGroup: number;

      });
    })

  }

}
