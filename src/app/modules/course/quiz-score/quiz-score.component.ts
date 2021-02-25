import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { StudentCourseService } from '@app/core/services/student-course.service';
import { StudentSurveyProgressService } from '@app/core/services/student-survey-progress.service';

import { User } from '@app/core/models/user';
import { DecimalPipe, formatNumber } from '@angular/common';

@Component({
  selector: 'app-quiz-score',
  templateUrl: './quiz-score.component.html',
  styleUrls: ['./quiz-score.component.scss']
})
export class QuizScoreComponent implements OnInit {

  score: Promise<string>;
  scoretotal: Promise<string>;
  courseId: Promise<string>;
  surveyId: Promise<string>;
  studentId: Promise<string>;
  currentUser: Promise<User>;

  showingScore: string;

  isError: boolean = false;

  constructor(private studentSurveyProgress:StudentSurveyProgressService,private route: ActivatedRoute, private authenticationService: AuthenticationService, private studentCourseService: StudentCourseService) { 
    this.authenticationService.currentUser.subscribe(user => this.currentUser = Promise.resolve(user));
    
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.createPromises(params);
      this.updateStudentPoints();
    });
  }

  createPromises(params){
    // Score
    this.score = new Promise((resolve, reject) => {
      if(params.get('score') == null){
        reject("unable to find score");
      } else {
        resolve(params.get('score'));
      }
    });
    // Score in %
    this.scoretotal = new Promise((resolve, reject) => {
      if(params.get('scoretotal') == null){
        reject("unable to find score in %");
      } else {
        resolve(params.get('scoretotal'));
      }
    });
    // Course Id 
    this.courseId = new Promise((resolve, reject) => {
      if(params.get('course') == null){
        reject("unable to find courseId");
      } else {
        resolve(params.get('course'));
      }
    });
    // Survey Id 
    this.surveyId = new Promise((resolve, reject) => {
      if(params.get('surveyid') == null){
        reject("unable to find courseId");
      } else {
        resolve(params.get('surveyid'));
      }
    });
  }

 

  updateStudentPoints(){
    this.courseId.then((id) => {
      let courseId = parseInt(id, 10);
      console.log("found courseId: " + courseId);

        this.surveyId.then((surveyid) => {
          let surveyId = parseInt(surveyid, 10);
          console.log("found surveyID: " + surveyId);

          this.scoretotal.then((scoretotal) => {
            let scoreTotal = formatNumber((parseFloat(scoretotal) / 0.1), 'EN', "2.0-2");
            this.showingScore = scoreTotal;
            console.log("found scoretotal in %: " + scoreTotal);

            this.score.then((score: string) => {
              this.currentUser.then((user) => {
                console.log("found score for: " + user.email);
                console.log("score: " + score);
                // Update Student-Survey-Progress --- fda
                // check if the student has already taken the quiz or not
                this.studentSurveyProgress.getProgressBoolean(user.id, surveyId).subscribe((data: any[]) => {
                  
                  if (data) {
                    // it means data is true which means quiz is completed already!
                    this.isError = true;
                  } else {
                    // it has not been taken before hence changing the score and status to complete
                    this.studentSurveyProgress.setProgress(user.id,surveyId,'complete',scoreTotal,null).subscribe((data1) => {
                       console.log("Updating student survey progress! studentID:" + user.id + " surveyId:" + this.surveyId );
                       console.log(data1);
                     });
                  }
                });
                // this.studentSurveyProgress.setProgress(user.id,surveyId,'complete',parseInt(score),null).subscribe((data1) => {
                //   console.log("Updating student survey progress! studentID:" + user.id + " surveyId:" + this.surveyId );
                //   console.log(data1);
                // });
                // Update Student Points in Course!
                this.studentCourseService.updatePoints(user.id, courseId, scoreTotal).subscribe((data) => {
                  console.log("Updated points for " + user.email);
                  console.log(data);
                });
              });
            }).catch((reason) => {
              console.error(reason);
            });

          }).catch((reason) => {
            console.error(reason);
          });

        }).catch((reason) => {
          console.error(reason);
        });

    }).catch((reason) => {
      console.error(reason);
    });

  }
 }



  
  
