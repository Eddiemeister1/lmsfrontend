import { Component, ElementRef, OnInit, Sanitizer, ViewChild, ViewChildren, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { NgbModal, NgbButtonLabel, NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

import { User } from '@app/core/models/user';
import decode from 'jwt-decode';

import { analyzeAndValidateNgModules } from '@angular/compiler';
import { resolve } from 'url';
//imported the student pdf progress service from the service file
import { StudentPdfProgressService } from '@app/core/services/student-pdf-progress.service';

import { YoutubePlayerComponent } from '@app/modules/course/youtube-player/youtube-player.component';
import { KeyValuePipe } from '@angular/common';
import { MatVerticalStepper } from '@angular/material/stepper';

@Component({
  selector: 'app-modules',
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.scss']
})

export class ModulesComponent implements OnInit {
  mySubscription: any;
  currentUser: User;
  tokenPayload: User;
  isAdmin: Boolean;
  isInstructor: Boolean;
  isStudent: Boolean;
  mod_number: number;
  surveyExist: Boolean;

  showTEXTCompleted: string;
  showNoMODULES: string;
  modules = [];
  todayDate;
  moduleLocked: Boolean[] = [];

  linksFromDB: string[] = new Array();
  links: any[] = new Array();
  safeLinks = new Map<number, Object[]>();

  pdfsFromDB: Blob[] = new Array();
  pdfs: any[] = new Array();
  safePdfs = new Map<number, Object[]>();

  surveysFromDB: string[] = new Array();
  surveys: string[] = new Array();
  safeSurveys = new Map<number, Object[]>();

  resources = ['pdf1', 'pdf2', 'worddoc1'];
  quizzes = ['quiz1', 'quiz2', 'quiz3'];

  allPdfProgress = new Map<number, boolean>();

  public ytVideo = {
    id: 0,
    link: '',
    percentageWatched: 0,
    moduleTitle: '',
    videoIndex: ''
  }

  allVideoProgress = new Map<number, boolean>();
  allModuleProgress = new Array();
  filteredModuleProgrss = new Array();

  allSurveyScores = new Map<number, number>();


  points: number;
  averagePoints;
  urlPath;
  courseId;
  courseIdPromise: Promise<string>;
  toggleContent = [];
  moduleVideosFetched = [];
  modulePDFsFetched = [];
  moduleSurveysFetched: Boolean[] = [];

  videoForm: FormGroup;
  pdfForm: FormGroup;
  surveyForm: FormGroup;
  updateVideoForm: FormGroup;
  updatePdfForm: FormGroup;
  updateSurveyForm: FormGroup;
  allSurveyProgress = new Map<number, boolean>();
  submitted = false;
  error = '';
  invalidLink = false;
  validLink = false;
  invalidQuiz = false;
  validQuiz = false;

  fileToUpload: File = null;
  contentObject = {
    course_id: 0,
    course_name: "",
    module_id: 0,
    module_number: 0,
    module_title: "",
    lockedUntil: "",
    link: ""
  }

  waitForProgressBarTimeout;

  @ViewChild('timelineStepper') stepper: MatVerticalStepper;


  //Added the  Student progress service in the service as well
  constructor(
    private studentSurveyProgress:StudentSurveyProgressService,
    private moduleService: ModuleService,
    private videoService: VideoService, 
    private pdfService: PdfService, 
    private surveyService: SurveyService,
    private authenticationService: AuthenticationService, 
    private studentCourseService: StudentCourseService,
    private fb: FormBuilder, 
    private router: Router, 
    private route: ActivatedRoute, 
    private sanitizer: DomSanitizer, 
    private videoProgressService: StudentVideoProgressService,
    private pdfprogressservice: StudentPdfProgressService,
    private moduleProgressService: StudentModuleProgressService,
    private modalService: NgbModal,
    private zone:NgZone, 
    ) 
    {
      this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
      this.makeForms();
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
    
 
    /*if(!this.currentUser){
      return;
    }*/
    this.todayDate = new Date();
    //console.log(this.todayDate.toLocaleString());
    //this.tokenPayload = decode(this.currentUser.token);
    this.isAdmin = (this.currentUser.role === "admin");
    this.isInstructor = (this.currentUser.role === "instructor");
    this.isStudent = (this.currentUser.role === "student");
    this.fetchModules(this.courseId);
    //this.fetchAllModulesProgress()
    this.getAvgStudentPoints(this.courseId, this.currentUser.id);


    ///////////////// Check if all Modules in a Course are Completed! 
    this.moduleProgressService.getAllModulesProgress(this.currentUser.id, this.courseId).subscribe((data: any[]) => {
      if (data["message"] == "Not found!") { 
        console.log('This course is not complete');
      }else{
        let count=0;
        let total=0;
        data.forEach((moduleProg: any) => {
          total+=1;
          if (moduleProg.progressStatus == "complete") {
            count+=1;
          } 
        });
        if (count == total){
          this.showTEXTCompleted = "All modules are Completed\n Thanks you!";
          document.getElementById("courseProgress").style.display = "block";
        }else{
          document.getElementById("courseProgress").style.display = "none";
        }
      }
    });


    
    //this.waitForProgressBar();

    // this.studentCourseService.getStudentsByCourseId(this.courseId).subscribe((data: []) => {
    //   data.forEach((val: any, i, arr) => {
    //     if(val.student_id == this.currentUser.id) {
    //       //console.log("Got student: " + JSON.stringify(val));
    //       this.points = val.points;
    //       console.log("Points: " + this.points);
    //       //document.getElementById('progressbar').style.width = this.points + "%";
    //     }
    //   })
    // });
    this.studentCourseService.getTotalPossiblePoints(this.courseId).subscribe((data: any[]) => {
      let array = data[0];
      let totalP = array[0].S;
      this.studentCourseService.getStudentPoints(this.courseId, this.currentUser.id).subscribe((data2: any[]) => {
        let arr = data2[0];
        this.points = arr[0].P;
        // converting points to percentage
        this.points = Math.round((this.points * 100) / totalP);
      });
    });
    

  }

  ngOnDestroy() {
    //clearTimeout(this.waitForProgressBarTimeout);
    
  }

  redirectTo(uri: string){
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(()=>
    this.router.navigate([uri]));
 }

  // BEGIN UTILITY FUNCTIONS

  waitForProgressBar(){
    console.log("waiting for progress bar");
    if(document.getElementById('progressbarAvg')){
      document.getElementById('progressbarAvg').style.width = this.averagePoints.average + "%";
    }
    else{
      this.waitForProgressBarTimeout = setTimeout(() => {
        this.waitForProgressBar();
      }, 1000)
    }
  }

  makeForms() {
    this.videoForm = this.fb.group({
      link: ['', Validators.required]
    });
    this.updateVideoForm = this.fb.group({
      linkInput: ['', Validators.required]
    });
    this.pdfForm = this.fb.group({
      pdf: ['', Validators.required]
    });
    this.updatePdfForm = this.fb.group({
      pdf: ['', Validators.required]
    });
    this.surveyForm = this.fb.group({
      name: ['', Validators.required],
      link: ['', Validators.required]
    });
    this.updateSurveyForm = this.fb.group({
      name: ['', Validators.required],
      link: ['', Validators.required]
    })
  }

  // convenience gettera for easy access to form fields
  get v() { return this.videoForm.controls; }

  get p() { return this.pdfForm.controls; }

  get s() { return this.surveyForm.controls; }

  get vu() { return this.updateVideoForm.controls; }

  get pu() { return this.updatePdfForm.controls; }

  get su() { return this.updateSurveyForm.controls; }

  pushLinksToArray(linksFromDB: any[], links: any[]) {
    linksFromDB.forEach((video) => {
      let videoObject = {
        link: video.link, 
        module_id: video.module_id, 
        video_id: video.video_id
      }
      links.push(videoObject);
    })
  }

  updateVideoUrl(linksArr: any[], moduleId: number) {
    linksArr.forEach((val) => {
      if(val.module_id === moduleId){
        this.moduleVideosFetched[moduleId] = true;

        //console.log("link: " + val.link);
        let len: number = val.link.length;
        let id;
        if(len >= 43){
          id = val.link.substring(32, 43);
        }
        else if(len == 28){
          id = val.link.substring(17, 28)
        }
        let videoUrl: SafeResourceUrl;
        let url: string;
        let videoObject = {};
        url = 'https://www.youtube.com/embed/' + id;
        videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        videoObject = {
          videoUrl: videoUrl,
          video_id: val.video_id,
          url: val.link
        }
        if(this.safeLinks.get(moduleId)){
          this.safeLinks.get(moduleId).push(videoObject);
        }
        else {
          this.safeLinks.set(moduleId, [videoObject]);
        }
      }
    })
  }

  updateVideoUrlObj(videoObject: any, moduleId: number){
        let len: number = videoObject.link.length;
        let id;
        if(len >= 43){
          id = videoObject.link.substring(32, 43);
        }
        else if(len == 28){
          id = videoObject.link.substring(17, 28)
        }
        let videoUrl: SafeResourceUrl;
        let url: string;
        url = 'https://www.youtube.com/embed/' + id;
        videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        let cleanVideoObject = {
          videoUrl: videoUrl,
          video_id: videoObject.video_id,
          url: videoObject.link
        }
        if(this.safeLinks.get(moduleId)){
          this.safeLinks.get(moduleId).push(cleanVideoObject);
        }
        else {
          this.safeLinks.set(moduleId, [cleanVideoObject]);
        }
  }

  pushPDFsToArray(pdfsFromDB: any[], pdfs: any[]) {
    pdfsFromDB.forEach((val) => {
      //console.log("val : " + i + " " + JSON.stringify(val));
      /*let pdfData = val.pdf.data;
      //console.log(Array.isArray(pdfData));
      let myBuffer = Uint8Array.from(pdfData);

      //console.log(myBuffer);

      let blob = new Blob([myBuffer.buffer], { type: 'application/pdf' }); //application/octet-stream*/
      //console.log(blob.size);
      //console.log(blob);
      console.log(val);
      let pdfObject = {
        module_id: val.module_id, 
        pdf_id: val.pdf_id, 
        pdf: val.pdf
      }
      pdfs.push(pdfObject);
    })
  }

  updatePdfData(pdfsArr: any[], moduleId: number) {
    pdfsArr.forEach((val) => {
      if(val.module_id === moduleId) {
        this.modulePDFsFetched[moduleId] = true;
        
        let pdfObject = {};
        let cleanPDF: SafeResourceUrl;

        //let pdfURL = URL.createObjectURL(val.pdf);
        
        cleanPDF = this.sanitizer.bypassSecurityTrustResourceUrl(val.pdf);

        pdfObject = {
          pdf_id: val.pdf_id,
          pdf: cleanPDF,
          rawPdf: val.pdf
        }

        if(this.safePdfs.get(moduleId)){
          this.safePdfs.get(moduleId).push(pdfObject);
        } 
        else {
          this.safePdfs.set(moduleId, [pdfObject]);
        }
      }
    })
  }

  updatePdfDataObj(pdfObject, moduleId){
    let cleanPDF: SafeResourceUrl;
    let cleanPdfObject = {};
        
    cleanPDF = this.sanitizer.bypassSecurityTrustResourceUrl(pdfObject.pdf);

    cleanPdfObject = {
      pdf_id: pdfObject.pdf_id,
      pdf: cleanPDF,
      rawPdf: pdfObject.pdf
    }

    if(this.safePdfs.get(moduleId)){
      this.safePdfs.get(moduleId).push(cleanPdfObject);
    } 
    else {
      this.safePdfs.set(moduleId, [cleanPdfObject]);
    }
  }

  pushSurveysToArray(surveysFromDB: any[], surveys: any[]){
    surveysFromDB.forEach((survey) => {
      let surveyObject = {
        name: survey.survey_name, 
        link: survey.link, 
        module_id: survey.module_id, 
        survey_id: survey.survey_id
      }
      surveys.push(surveyObject);
    })
  }

  updateSurveyUrl(surveysArr: any[], moduleId: number) {
    surveysArr.forEach((survey) => {
      if(survey.module_id === moduleId){
        this.moduleSurveysFetched[moduleId] = true;

        let surveyUrl: SafeResourceUrl;
        let surveyWithEmailUrl = survey.link;

        this.courseIdPromise.then((id) => {
          let courseId = parseInt(id, 10);
          console.log(courseId);

          surveyWithEmailUrl = survey.link + '?email=' + this.currentUser.email + '&course=' + courseId + '&studentid=' + this.currentUser.id + '&surveyid=' + survey.survey_id;
          //console.log(surveyWithEmailUrl);
          surveyUrl = this.sanitizer.bypassSecurityTrustResourceUrl(surveyWithEmailUrl);
          let surveyObject = {
            surveyUrl: surveyUrl,
            survey_id: survey.survey_id,
            name: survey.name,
            url: survey.link
          }
  
          if(this.safeSurveys.get(moduleId)){
            this.safeSurveys.get(moduleId).push(surveyObject);
          }
          else {
            this.safeSurveys.set(moduleId, [surveyObject]);
          }  

      });
      }
    })
  }

  updateSurveyUrlObj(surveyObject: any, moduleId){
    let surveyUrl: SafeResourceUrl;
    let surveyWithEmailUrl = surveyObject.link;

    this.courseIdPromise.then((id) => {
      let courseId = parseInt(id, 10);

      console.log(courseId);
      let cleanSurveyObject = {
        surveyUrl: surveyUrl,
        survey_id: surveyObject.survey_id,
        name: surveyObject.name,
        url: surveyObject.link
      }
      surveyWithEmailUrl = surveyObject.link + '?email=' + this.currentUser.email + '&course=' + courseId + '&studentid=' + this.currentUser.id + '&surveyid=' + surveyObject.survey_id;
      //console.log(surveyWithEmailUrl);
      surveyUrl = this.sanitizer.bypassSecurityTrustResourceUrl(surveyWithEmailUrl);
     

      if(this.safeSurveys.get(moduleId)){
        this.safeSurveys.get(moduleId).push(cleanSurveyObject);
      }
      else {
        this.safeSurveys.set(moduleId, [cleanSurveyObject]);
      }  
    });
  }
      
  open(content) {
    this.submitted = false;
    this.invalidLink = false;
    this.invalidQuiz = false;
    this.validLink = false;
    this.invalidQuiz = false;
    this.modalService.open(content, { size: 'lg', centered: true });
  }

  //////// open Modal ---> Survey
  openSurvey(surveyId,content) {
    this.submitted = false;
    this.invalidLink = false;
    this.invalidQuiz = false;
    this.validLink = false;
    this.invalidQuiz = false;
    this.modalService.open(content, { size: 'lg', centered: true });

    /************************************************************
     * Create a survey progress --- check first if already exist 
     ************************************************************/
    console.log(this.currentUser.id);
    console.log(surveyId);
    // If current user is Student
    if (this.isStudent){
      // check if current Survey-Progress exist
      this.studentSurveyProgress.getProgressBoolean(this.currentUser.id,surveyId).subscribe((data:Boolean)=>{
        console.log(data);
        if (data){
          console.log('Current Survey-Progress is already in the db!...')
          // Fetch module progress here
        }else{
          // if current Survey-Progress don't exist.... create one! 
          this.studentSurveyProgress.addProgress(this.currentUser.id,surveyId,'incomplete','0').subscribe((data1:any[])=>{
            console.log(data1);
            console.log('Survey-Progress created succefully!!!...');
            // Fetch module progress here
          });
        }
      });
    }
  }
      
  openModule(index) {
    if(this.toggleContent[index]){
      //console.log("Closing module content");
      this.toggleContent[index] = false;
    }
    else {
      //console.log("Opening module content");
      this.toggleContent[index] = true;
    }   
  }

  openUpdateVideo(content, videoUrl) {
    this.submitted = false;
    this.invalidLink = false;
    this.validLink = false;
    this.modalService.open(content, { size: 'lg', centered: true });
    this.updateVideoForm.get('linkInput').setValue(videoUrl);
  }

  openUpdatePDF(content, pdf){
    this.submitted = false;
    this.modalService.open(content, { size: 'lg', centered: true });
    console.log("The updatePDF: " + pdf);
    this.updatePdfForm.get('pdf').setValue(pdf);
  }

  openUpdateSurvey(content, surveyName, surveyUrl){
    this.submitted = false;
    this.invalidQuiz = false;
    this.validQuiz = false;
    this.modalService.open(content, { size: 'lg', centered: true });
    this.updateSurveyForm.get('name').setValue(surveyName);
    this.updateSurveyForm.get('link').setValue(surveyUrl);
  }

  getAvgStudentPoints(courseId, studentId){
    console.log("Called avgstudentpoints on student_id: " + studentId);
    this.studentCourseService.getAvgStudentPoints(courseId, studentId).subscribe((data: any[]) => {
      this.averagePoints = data[0].P;
      //console.log("avg: " + JSON.stringify(data));
      //this.averagePoints.average = this.toFixed(this.averagePoints.average, 2);
    });
  }

  toFixed(value, precision) {
    var power = Math.pow(10, precision || 0);
    return String(Math.round(value * power) / power);
  }

  viewDiscussion(courseId, moduleId){
    this.router.navigate([`courses/${courseId}/discussion/${moduleId}`]);
  }
  // END UTILITY FUNCTIONS

  // BEGIN MODULES CRUD
  createModule(courseId) {
    this.router.navigate([`courses/${courseId}/create-module`]);
  }

  fetchModules(courseId) {
    // testing forkJoin feature
    let dataModulesServices;
    forkJoin([this.moduleService.getModulesByCourseId(courseId), this.videoService.fetchVideos(courseId)]).subscribe(result => {
      dataModulesServices = result[0];
      //dataModulesServices = result[1];
      console.log("*******HERE#######");
      console.log(dataModulesServices);
      console.log(result[1]);
    });
    /////////////////////
    this.moduleService.getModulesByCourseId(courseId).subscribe((data: []) => {
      console.log(data + "<---Getting Modules by Course ID");
      if(data.length == 0)
      {
        console.log(data);
        console.log("There are no Modules!!");
        this.showTEXTCompleted = "There are no Modules!!";
        document.getElementById("courseProgress").style.display = "block";
      }
      else {
        data.forEach((moduleO: any, i, arr) => {
          //let lockedUntil = new Date(moduleO.lockedUntil.toString());
          let moduleLocked2: Boolean[] = [];
          let lockedUntil = new Date(moduleO.lockedUntil);
          let dd = String(lockedUntil.getDate() + 1).padStart(2, '0');
          let mm = String(lockedUntil.getMonth() + 1).padStart(2, '0'); //January is 0!
          let yyyy = lockedUntil.getFullYear();

          let givenDate = mm + '/' + dd + '/' + yyyy;
          this.moduleLocked[i] = false;
          if(this.todayDate < lockedUntil){
            //console.log(this.todayDate.toLocaleDateString() + " < " + JSON.stringify(moduleO));
            this.moduleLocked[i] = true;
          }
          moduleO.lockedUntil = givenDate;

        })
        this.modules = data;
        //console.log(this.modules);
        // this.fetchAllModulesProgress(); 
        this.fetchVideos(courseId, data);
        this.fetchPdfs(courseId, data);
        this.fetchSurveys(courseId, data);
        

        if(this.isStudent){
          this.fetchSurveyProgress();
          this.fetchVideoProgress();
          this.fetchPdfProgress();
          this.fetchAllModulesProgress();
        }
      }
    })
  }

  editModule(courseId, moduleId) {
    this.router.navigate([`courses/${courseId}/edit-module/${moduleId}`]);
  }

  deleteModule(moduleId, moduleNumber) {
    let response = confirm(`Delete Module ${moduleNumber}: Are you sure?`);
    if(response == true){
      this.moduleService.deleteModule(moduleId).subscribe(() => {
        console.log("Deleted module " + moduleId);
        //this.modules.pop();
      });
      const item = this.modules.find(item => item.id === moduleId);
      this.modules.splice(this.modules.indexOf(item));
      }
      location.reload();
  }

  // END MODULES CRUD

  // BEGIN VIDEOS CRUD

  handleValidLink(event){
    //console.log(event.target.value);
    let input: String = event.target.value;
    let isYoutubeLink: Boolean = false;
    let len = input.length;

    if(input.includes("https://www.youtube.com/watch?v=") || input.includes("https://youtu.be/")){
      console.log("Includes youtube link");
      isYoutubeLink = true;
    } else{
      isYoutubeLink = false;
    }

    if((len == 28 || len >= 43) && isYoutubeLink){
      this.validLink = true;
      this.invalidLink = false;
    }
    else{
      this.validLink = false;
    }
  }

  addVideo(link, moduleId) {
    this.submitted = true;

    if(this.videoForm.invalid){
      return;
    }

    if(!this.validLink){
      this.invalidLink = true;
      return;
    }

    this.videoService.addVideo(link, moduleId).subscribe((video: any) => {
      //alert(JSON.stringify(video));
      let videoObject = {
        link: video.link, 
        module_id: video.module_id, 
        video_id: video.id
      };
      this.modalService.dismissAll();
      this.videoForm.get('link').setValue('');

      //this.links.push(videoObject);
      console.log(this.links.length);
      this.updateVideoUrlObj(videoObject, video.module_id);
      console.log("added new video");
      /*this.modalService.dismissAll();
      this.redirectTo(`/courses/${this.courseId}/modules`);*/
    }, (error) => {
      this.error = error;
    })
  }

  updateVideo(link, videoId, moduleId) {
    this.submitted = true;

    if(this.updateVideoForm.invalid){
      return;
    }

    if(!this.validLink){
      this.invalidLink = true;
      return;
    }

    //console.log("link: " + link + " " + "videoId: " + videoId);
    this.videoService.updateVideo(link, videoId).subscribe((res: any) => {
      //alert("Updated video");
      console.log(JSON.stringify(res));
      let videoObject = {
        link: res.link, 
        module_id: moduleId, 
        video_id: res.id
      };
      this.modalService.dismissAll();
      this.updateVideoForm.get('linkInput').setValue('');

      //first splice from array
      this.links.forEach((video: any, i, arr) => {
        if(video.video_id == videoId){
          console.log("found vid id: " + videoId + " at location: " + i);
          this.links.splice(i, 1);
          console.log(this.links);
        }
      })
      console.log(this.safeLinks);
      this.safeLinks.get(moduleId).forEach((video: any, i) => {
        if(video.video_id == videoId){
          console.log("found safevid id: " + videoId + " at location: " + i);
          this.safeLinks.get(moduleId).splice(i, 1);
          console.log(this.safeLinks);
        }
      })
      //then add to array
      this.updateVideoUrlObj(videoObject, moduleId);
      console.log("Updated video");
    })
  }

  deleteVideo(videoId, videoNumber: number, moduleId) {
    //console.log("Delete video: " + videoId);
    let r = confirm("Delete video " + (videoNumber + 1) + ": Are you sure?");
    if(r){
      this.videoService.deleteVideo(videoId).subscribe((data) => {
        //this.redirectTo(`/courses/${this.courseId}/modules`);
        console.log(this.links);
        this.links.forEach((video: any, i, arr) => {
          if(video.video_id == videoId){
            console.log("found vid id: " + videoId + " at location: " + i);
            this.links.splice(i, 1);
            console.log(this.links);
          }
        })
        console.log(this.safeLinks);
        this.safeLinks.get(moduleId).forEach((video: any, i) => {
          if(video.video_id == videoId){
            console.log("found safevid id: " + videoId + " at location: " + i);
            this.safeLinks.get(moduleId).splice(i, 1);
            console.log(this.safeLinks);
          }
        })
        //this.updateVideoUrl(this.links, moduleId);
        console.log("deleted video");
      })
    }
  }

  fetchVideos(courseId, modules) {
    console.log("Fetching videos: " + courseId);
    this.videoService.fetchVideos(courseId).subscribe((data: any[]) => {
      this.linksFromDB = data;
      //console.log("linksFromDB: " + JSON.stringify(this.linksFromDB));
      this.pushLinksToArray(data, this.links);

      modules.forEach((val: any, i, arr) => {
        let contentLocked: Boolean[] = [];
        let checker = 0;
        let moduleval = val;
        for(let i = 0; i < data.length; i++) {
          let val = data[i];
          contentLocked[i] = false;

          if(val.module_id == moduleval.module_id){
            if(this.moduleVideosFetched[val.module_id] == true){
              console.log("Modules videos fetched true");
              break;
            }
            else{
              //console.log(val.module_id);
              this.updateVideoUrl(this.links, val.module_id);
            }

            //if (video was not completed)
            //contentLocked[i] = true
            //checker++

          }
        }

        if(checker == data.length)
        {
          return true;
        }
        else return false;
      })

    })
    // this.fetchVideoProgress();
  }
  // END VIDEOS CRUD

  // BEGIN PDFS CRUD

  handleFileInput(event){
    if(event.target.files.length > 0){
      const file = event.target.files[0];
      this.pdfForm.get('pdf').setValue(file);
    }
  }

  handleFileInputUpdate(event){
    if(event.target.files.length > 0){
      const file = event.target.files[0];
      this.updatePdfForm.get('pdf').setValue(file);
    }
  }

  openPdfinWindow(pdfUrl, pdfId){
    console.log("opening: " + pdfUrl);
  
    if(window.innerWidth <= 640){
      return;
    }

    let width = window.innerWidth * 0.66;
    let height = width * window.innerHeight / window.innerWidth;
    let top = (window.innerHeight - height) / 2;
    let left = (window.innerWidth - width) / 2;
    
    window.open(pdfUrl, 'newwindow', `width=${width}, height=${height}, top=${top}, left=${left}`);

    if(this.isStudent)
    {
      console.log('This is a student! Adding progress...');
          this.pdfprogressservice.addProgress(this.currentUser.id, pdfId, 'complete').subscribe((data1:any[]) => {
            console.log(data1);
            console.log('Pdf Progress created successfully!...')
            // Fetch module progress here
            this.fetchPdfProgress();
            this.fetchAllModulesProgress();
          });
        //Set the Pdf Progress to complete. The Pdf progress doesnt get updated
        /*
        console.log('Setting the PDF Progress for a Student...');
        this.pdfprogressservice.setStudentProgress(this.currentUser.id, pdfId, 'incomplete', null).subscribe((data2:any[]) => {
          console.log(data2);
          console.log('PDF Progress for a Student was set to complete!...')
        });
        */
      }

    return false;
  }

  addPdf(pdfUrl, moduleId) {
    this.submitted = true;

    if(this.pdfForm.invalid){
      return;
    }

    console.log("url: " + pdfUrl);
    console.log("moduleId: " + moduleId);

    //console.log("fileName: " + this.pdfForm.get('pdf').value.name + " fileSize: " + this.pdfForm.get('pdf').value.size);
    /*const formData: FormData = new FormData();
    formData.append('fileKey', this.pdfForm.get('pdf').value);
    formData.append('fileKey', moduleId);*/


    //console.log(formData.getAll('fileKey'));
    this.pdfService.addPDF(pdfUrl, moduleId).subscribe((res) => { 
        //console.log(res);
        //alert(JSON.stringify(res));
        let pdfObject = {
          pdf_id: res.id,
          pdf: res.pdf,
          module_id: res.module_id
        }
        this.modalService.dismissAll();
        this.pdfForm.get('pdf').setValue('');

        this.updatePdfDataObj(pdfObject, moduleId);
       },
      (err) => { console.log(err); this.error = err; }
    );

  }

  //add Progress Tracking for PDFs
  


  fetchPdfs(courseId, modules) {
    console.log("Fetching pdfs: " + courseId);
    this.pdfService.fetchPDFs(courseId).subscribe((data: any[]) => {
      console.log("pdf data: ");
      console.log(data);
      this.pdfsFromDB = data;
      this.pushPDFsToArray(data, this.pdfs);

      modules.forEach((val: any, i, arr) => {
        let checker = 0;
        let moduleval = val;
        for(let i = 0; i < data.length; i++) {
          let val = data[i];
          if(val.module_id == moduleval.module_id){
            if(this.modulePDFsFetched[val.module_id] == true){
              console.log("Modules pdfs fetched true");
              break;
            }
            else{
              //console.log(val.module_id);
              this.updatePdfData(this.pdfs, val.module_id);
            }


          }

        }
        //If all of the pdf content is not submitted, then the whole section is locked
        if(checker == data.length)
        {
          return true;
        }
        else return false;
      })

    })
    // this.fetchPdfProgress();
  }
  //Update PDF and the PDF Progress Tracker
  updatePDF(pdfUrl, pdfId, moduleId){
    this.submitted = true;
    //The submitted pdf is false 
    if(this.updatePdfForm.invalid){
      return;
    }

    console.log("updatePDF: " + pdfUrl + "id: " + pdfId);
    /*const formData: FormData = new FormData();
    formData.append('fileKey', this.updatePdfForm.get('pdf').value);
    formData.append('fileKey', moduleId);*/

    this.pdfService.updatePDF(pdfUrl, pdfId).subscribe((res: any) => {
      //alert("Updated pdf");
      let pdfObject = {
        pdf_id: res.id,
        pdf: res.pdf,
        module_id: moduleId
      }
      this.modalService.dismissAll();
      this.updatePdfForm.get('pdf').setValue('');

      //first splice from arrays old value
      this.pdfs.forEach((pdf: any, i, arr) => {
        if(pdf.pdf_id == pdfId){
          console.log("found pdf id: " + pdfId + " at location: " + i);
          this.pdfs.splice(i, 1);
          console.log(this.pdfs);
        }
      })
      console.log(this.safePdfs);
      this.safePdfs.get(moduleId).forEach((pdf: any, i) => {
        if(pdf.pdf_id == pdfId){
          console.log("found safepdf id: " + pdfId + " at location: " + i);
          this.safePdfs.get(moduleId).splice(i, 1);
          console.log(this.safePdfs);
        }
      })

      //then add to arrays the updated value
      this.updatePdfDataObj(pdfObject, moduleId);
      console.log("Updated pdf");
    });
    /*
    //Update the Progress Tracker for all corresponding PDfs The Pdf doesn't get updated 
    this.pdfprogressservice.setProgress(pdfId, 'incomplete', null).subscribe((data2) =>{
      console.log("Updating Student pdf progress! PDFid: " + pdfId);
      console.log(data2);
    });
    */
  }
  //Delete the PDF and the PDF Progress Tracker. The Pdf progress tracker doesnt get deleted
  deletePDF(pdfId, pdfNumber: number, moduleId) {
    //console.log("PDF ID: " + pdfId);
    let r = confirm("Delete PDF " + (pdfNumber + 1) + ": Are you sure?");
    if(r){
      this.pdfService.deletePDF(pdfId).subscribe(() => {
        //alert("Deleted pdf");
        this.pdfs.forEach((pdf: any, i, arr) => {
          if(pdf.pdf_id == pdfId){
            console.log("found pdf id: " + pdfId + " at location: " + i);
            this.pdfs.splice(i, 1);
            console.log(this.pdfs);
          }
        })
        console.log(this.safePdfs);
        this.safePdfs.get(moduleId).forEach((pdf: any, i) => {
          if(pdf.pdf_id == pdfId){
            console.log("found safepdf id: " + pdfId + " at location: " + i);
            this.safePdfs.get(moduleId).splice(i, 1);
            console.log(this.safePdfs);
          }
        })
      })
      /*Delete the Progress Tracker for all Corresponding PDFs The Pdf progress tracker doesnt get deleted
      this.pdfprogressservice.deleteProgress(pdfId).subscribe((data1:any[]) => {
        console.log(data1);
        console.log('Deleted the Pdf progress tracker to that pdf id!');
      });
      */
    }
  }

  // END PDFS CRUD

  // BEGIN SURVEYS CRUD (QUIZZES/EXAMS)

  handleValidQuiz(event){
    let input: String = event.target.value;
    let len = input.length;
    let isValidQuiz: Boolean = false;

    if(input.includes("https://fiu.qualtrics.com/jfe/form/")){
      isValidQuiz = true;
    }
    else{
      isValidQuiz = false;
    }

    if((len == 53) && isValidQuiz){
      this.validQuiz = true;
      this.invalidQuiz = false;
    }
    else{
      this.validQuiz = false;
    }
  }

  addSurvey(name, link, moduleId) {
    this.submitted = true;

    if(this.surveyForm.invalid){
      return;
    }

    if(!this.validQuiz){
      this.invalidQuiz = true;
      return;
    }

    this.surveyService.addSurvey(name, link, moduleId).subscribe((res: any) => {
      //alert("Added survey");
      let surveyObject = {
        name: res.name, 
        link: res.link,
        module_id: res.module_id,
        survey_id: res.id
      };
      this.modalService.dismissAll();
      this.surveyForm.get('name').setValue('');
      this.surveyForm.get('link').setValue('');

      console.log(this.surveys.length);
      this.updateSurveyUrlObj(surveyObject, moduleId);
      console.log("added new survey");
    })
  }

  fetchSurveys(courseId, modules: any[]) {
    console.log("Fetching surveys: " + courseId);
    this.surveyService.fetchSurveys(courseId).subscribe((data: any[]) => {
      this.surveysFromDB = data;
      //console.log("surveysFromDB: " + JSON.stringify(this.surveysFromDB));
      this.pushSurveysToArray(data, this.surveys);

      modules.forEach((val: any) => {
        let moduleval = val;
        let contentLocked: Boolean[] = [];
        let checker = 0;
        for(let i = 0; i < data.length; i++) {
          let val = data[i];
          contentLocked[i] = false;
          if(val.module_id == moduleval.module_id){
            if(this.moduleSurveysFetched[val.module_id] == true){
              console.log("Modules surveys fetched true");
              break;
            }
            else{
              //console.log(val.module_id);
              this.updateSurveyUrl(this.surveys, val.module_id);
            }
            //if(quiz is completed)
               //contentLocked[i] = true
               //checker++

          }
        }
        if(checker == data.length)
        {
          return true;
        }
        else return false;
      })

    })
    //this.fetchSurveyProgress();
  }

  updateSurvey(name, link, surveyId, moduleId) {
    this.submitted = true;

    if(this.updateSurveyForm.invalid){
      return;
    }

    if(!this.validQuiz){
      this.invalidQuiz = true;
      return;
    }

    //console.log("link: " + link + " " + "videoId: " + videoId);
    this.surveyService.updateSurvey(name, link, surveyId).subscribe((res: any) => {
      //alert("Updated Quiz/Exam");
      let surveyObject = {
        name: res.name, 
        link: res.link,
        module_id: moduleId,
        survey_id: res.id
      };
      this.modalService.dismissAll();
      this.updateSurveyForm.get('name').setValue('');
      this.updateSurveyForm.get('link').setValue('');

      //first delete old surveys
      this.surveys.forEach((survey: any, i, arr) => {
        if(survey.survey_id == surveyId){
          console.log("found survey id: " + surveyId + " at location: " + i);
          this.surveys.splice(i, 1);
          console.log(this.surveys);
        }
      })
      console.log(this.safeSurveys);
      this.safeSurveys.get(moduleId).forEach((survey: any, i) => {
        if(survey.survey_id == surveyId){
          console.log("found safesurvey id: " + surveyId + " at location: " + i);
          this.safeSurveys.get(moduleId).splice(i, 1);
          console.log(this.safeSurveys);
        }
      })
      //then add updated survey
      this.updateSurveyUrlObj(surveyObject, moduleId);
      console.log("Updated survey(Quiz)");
    })
  }

  deleteSurvey(surveyId, surveyNumber: number, moduleId) {
    //console.log("Delete video: " + videoId);
    let r = confirm("Delete Quiz/Exam " + (surveyNumber + 1) + ": Are you sure?");
    if(r){
      this.surveyService.deleteSurvey(surveyId).subscribe(() => {
        //alert("Deleted Quiz/Exam");
        this.surveys.forEach((survey: any, i, arr) => {
          if(survey.survey_id == surveyId){
            console.log("found survey id: " + surveyId + " at location: " + i);
            this.surveys.splice(i, 1);
            console.log(this.surveys);
          }
        })
        console.log(this.safeSurveys);
        this.safeSurveys.get(moduleId).forEach((survey: any, i) => {
          if(survey.survey_id == surveyId){
            console.log("found safesurvey id: " + surveyId + " at location: " + i);
            this.safeSurveys.get(moduleId).splice(i, 1);
            console.log(this.safeSurveys);
          }
        })
      })
      console.log("deleted survey");
    }
  }
  // END SURVEYS CRUD (QUIZZES/EXAMS)
  fetchPdfProgress(){
    let currentPdfIds: number[] = [];
    let foundPdfObj: any;
    let pdfProgressObj = {
      pdf_id: null, 
      progressFlag: false
    }
    this.pdfprogressservice.getAllPdfsProgress(this.currentUser.id).subscribe((data: any[]) => {
      this.zone.run(() => { // <== added
        console.log(data);
        if (data.length >= 1) {
          this.safePdfs.forEach(pdfs => {
            pdfs.forEach( (element: any) => {
              currentPdfIds.push(element.pdf_id);
              foundPdfObj = data.find(v => v.pdf_id === element.pdf_id);
              if ((foundPdfObj != undefined) && (foundPdfObj != null)) {
                pdfProgressObj.pdf_id = foundPdfObj.pdf_id;
                if (foundPdfObj.progressStatus == "complete") {
                  console.log('Pdfs complete');
                  pdfProgressObj.progressFlag = true;
                } else {
                  console.log('Pdfs incomplete');
                  pdfProgressObj.progressFlag = false;
                }
              } else {
                pdfProgressObj.progressFlag = false;
                pdfProgressObj.pdf_id = element.pdf_id;
              }
              this.allPdfProgress.set(pdfProgressObj.pdf_id, pdfProgressObj.progressFlag);
              console.log(pdfProgressObj);
            });
          });
        }
          console.log('This is the end');
          console.log(this.allPdfProgress);
        });
      });
      
  }

  openYtPlayer(moTitle, vidIndex, videoObj) {
    
    //console.log(videoObj.video_id);
    this.ytVideo.id = videoObj.video_id;
    this.ytVideo.link = videoObj.videoUrl;
    this.ytVideo.moduleTitle = moTitle;
    this.ytVideo.videoIndex = vidIndex + 1; // because video indexes start from 0
    const modalRef = this.modalService.open(YoutubePlayerComponent, { size: 'lg', centered: true, backdrop: 'static', keyboard: false });
    modalRef.componentInstance.ytVideo = this.ytVideo;
    modalRef.componentInstance.studentId = this.currentUser.id;
    modalRef.result.then((result) => {
      if (result) {
        console.log(result);
        this.fetchVideoProgress();
        this.fetchAllModulesProgress();

        // Resetting the watched precentage after modal closed
         this.ytVideo.percentageWatched = 0;
      }
    });
    
  }


  fetchVideoProgress() {

    let currentVideoIds: number[] = [];
    let foundVidObj: any;
    let vidProgressObj = {
      video_id: null, 
      progressFlag: false
    }
    this.videoProgressService.getAllVideosProgress(this.currentUser.id).subscribe((data: any[]) => {
      this.zone.run(() => { // <== added
        console.log(data);
        if (data.length >= 1) {
          this.safeLinks.forEach(link => {
            link.forEach( (element: any) => {
              currentVideoIds.push(element.video_id);
              foundVidObj = data.find(v => v.video_id === element.video_id);
              if ((foundVidObj != undefined) && (foundVidObj != null)) {
                vidProgressObj.video_id = foundVidObj.video_id;
                if (foundVidObj.progressStatus == "complete") {
                  vidProgressObj.progressFlag = true;
                } else {
                  vidProgressObj.progressFlag = false;
                }
              } else {
                vidProgressObj.progressFlag = false;
                vidProgressObj.video_id = element.video_id;
              }
              this.allVideoProgress.set(vidProgressObj.video_id, vidProgressObj.progressFlag);
              console.log(vidProgressObj);
            });
          });
        }
        console.log(this.allVideoProgress);
        });
      });
   }
                                                                                  
  fetchSurveyProgress() {

    let currentSurveyIds: number[] = [];
    let foundSurObj: any;
    let surveyProgressObj = {
      survey_id: null, 
      progressFlag: false
    }
    console.log('lolo begin');
    this.studentSurveyProgress.getAllSurveyProgress(this.currentUser.id).subscribe((data: any[]) => {
      this.zone.run(() => { // <== added
        console.log(data);
        if (data.length >= 1) {
          this.safeSurveys.forEach(survey => {
            survey.forEach( (element: any) => {
              currentSurveyIds.push(element.survey_id);
              foundSurObj = data.find(v => v.survey_id === element.survey_id);
              if ((foundSurObj != undefined) && (foundSurObj != null)) {
                surveyProgressObj.survey_id = foundSurObj.survey_id;
                // capturing all quiz scores from db results
                this.allSurveyScores.set(surveyProgressObj.survey_id, foundSurObj.score);
                if (foundSurObj.progressStatus == "complete") {
                  console.log('lolo Complete');
                  surveyProgressObj.progressFlag = true;
                } else {
                  console.log('lolo incomplete');
                  surveyProgressObj.progressFlag = false;
                }
              } else {
                surveyProgressObj.progressFlag = false;
                surveyProgressObj.survey_id = element.survey_id;
              }
              this.allSurveyProgress.set(surveyProgressObj.survey_id, surveyProgressObj.progressFlag);
              console.log(surveyProgressObj);
            });
          });
        }
        console.log('lolo final');
        console.log(this.allSurveyProgress);
        });
      });


  }


  fetchAllModulesProgress() {
    // Call db for all module progress in a single course (Need Couse ID)
    this.moduleProgressService.getAllModulesProgress(this.currentUser.id , this.courseId).subscribe((data: any[]) => {
      this.zone.run(() => { // <== added
        
        // if there is no data inside the db we have to add this info
        if (data["message"] == "Not found!") { 
          console.log('this is the first time in this course');
          this.addModuleProgressFirstTimeOnly();
        } else {
            // Check all modules progress in this course
            data.forEach((moduleProg: any) => {
              // check status "complete" or "incomplete"
              console.log('module: ' + moduleProg.module_id + 'with status: ' + moduleProg.progressStatus);
              if (moduleProg.progressStatus == "complete") {
                    this.allModuleProgress.push({mod_number: moduleProg.module_number, status: true});
              } else {
                this.allModuleProgress.push({mod_number: moduleProg.module_number, status: false});
                // check if there is any updates to module progress 
                this.checkCurrentModuleProgress(moduleProg.module_id, moduleProg.module_number);
              }

          });
          
        }
        // sorting the array object by module_number (ascending)
        this.allModuleProgress.sort((a, b) => {
          if (a.mod_number > b.mod_number) {
            return 1;
          } else if (a.mod_number < b.mod_number) {
            return -1;
          } else {
            return 0;
          }
        });
        //console.log(this.allModuleProgress + '<-------- fda');

        // setting the stepper to latest module in progress
        this.filteredModuleProgrss = this.allModuleProgress.filter(this.findCurrentModuleInProgress);
        console.log("########  WORKING ON fetchAllModulesProgress ########");
        console.log(this.filteredModuleProgrss);
       
      });
    });
  }


  checkCurrentModuleProgress(module_id: number, module_number: number) {

    let isAllVidsCompleted = true;
    let isAllPDFsCompleted = true;
    let isAllSurveysCompleted = true;

    if (this.safeLinks.has(module_id)) {
      let surveys = this.safeSurveys.get(module_id);
      if ((surveys != undefined)) {
        surveys.forEach((survey: any) => {
          if (this.allSurveyProgress.get(survey.survey_id)) {

          } else {
            //isAllSurveysCompleted = false;
          }
        });
      }
    }

    if (this.safePdfs.has(module_id)) {
      let pdfs = this.safePdfs.get(module_id);
      if ((pdfs != undefined)) {
        pdfs.forEach((pdf: any) => {
          if (this.allPdfProgress.get(pdf.pdf_id)) {

          } else {
            isAllPDFsCompleted = false;
          }
        });
      }
    }

    if (this.safeLinks.has(module_id)) {
      let videos = this.safeLinks.get(module_id);
      if ((videos != undefined)) {
        videos.forEach((video: any) => {
          if (this.allVideoProgress.get(video.video_id)) {

          } else {
            isAllVidsCompleted = false;
          }
        });
      }
    }

    if (isAllPDFsCompleted && isAllSurveysCompleted && isAllVidsCompleted) {
      this.moduleProgressService.setProgress(this.currentUser.id, module_id, "complete", null).subscribe((data: any[]) => {
        this.zone.run(() => { // <== added
          // apply extraCreditPoints for that module if any to student's points
          const mod = this.modules.find(m => m.module_id === module_id);
          this.studentCourseService.updatePoints(this.currentUser.id, this.courseId, mod.extraCreditPoints).subscribe((data2: any[]) => {
            console.log("Successfully applied module extra points because it was completed");
            console.log(data2);
          });
          this.pushToModuleProgressArray(module_number, true);
        });
        
      });
    } else {
      this.moduleProgressService.setProgress(this.currentUser.id, module_id, "incomplete", null).subscribe((data: any[]) => {
        this.zone.run(() => { // <== added
          this.pushToModuleProgressArray(module_number, false);
        });
      });
    }

  }

  pushToModuleProgressArray(module_number: number, status: boolean) {
    // need to see if it exists in array first to update or push
    const index = this.allModuleProgress.findIndex((e) => e.mod_number === module_number);
    if (index === -1) {
       this.allModuleProgress.push({mod_number: module_number, status: status});
    } else {
       this.allModuleProgress[index] = {mod_number: module_number, status: status};
    }
  }

  addModuleProgressFirstTimeOnly() {
    console.log("this.module: " + this.modules);
    this.modules.forEach((module: any) => {
      this.moduleProgressService.addProgress(this.currentUser.id, this.courseId, module.module_id, "incomplete", module.module_number).subscribe((data: any[]) => {
        this.zone.run(() => { // <== added

          this.allModuleProgress.push({mod_number: module.module_number, status: false});
          // refreshing the page
           window.location.reload();
        });
      });
    });
  }

  findModuleStatusArray(module_number) {
    let result = this.allModuleProgress.find(m => m.mod_number === module_number);
    if (result == undefined) {
      return false;
    } else {
      return result.status;
    }
  }

  findCurrentModuleInProgress(element, index, array) {
    return (element.status == false);
  }

  fetchAndCloseSurvey() {
    //Closes the survey window and then fetches the survey progress for the checkmark
    this.modalService.dismissAll();
    this.fetchSurveyProgress();
    this.fetchAllModulesProgress();
  }

  pickStepperIndex() {​​​​​
    //this.zone.run(() => {​​​​​ // <== added
      let selindex: number = 0;
      //if (this.filteredModuleProgrss.length == 0) {​​​​​
        //selindex = this.filteredModuleProgrss[0].mod_number - 1;
      //}​​​​​ else {​​​​​
        //if (this.filteredModuleProgrss[0)
        console.log(selindex + "<------This is the selindex");
        console.log(this.filteredModuleProgrss[0]);
        if(this.filteredModuleProgrss[0] == undefined)
        {
          console.log(selindex + "<---There are no modules so selindex should continue anyway");
          return selindex;
        }
        selindex = this.filteredModuleProgrss[0].mod_number - 1;
        console.log(selindex + "<------new selindex");
      //}
      
      //let selindex = this.filteredModuleProgrss[0].mod_number - 1;
      return selindex;
    //}​​​​​);
    
  }​​​​​

  


}



