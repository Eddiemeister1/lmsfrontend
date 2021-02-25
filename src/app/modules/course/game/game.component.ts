import { Component, OnInit, AfterViewInit, AfterViewChecked } from '@angular/core';

import { AuthenticationService } from "@app/core/services/authentication.service";
import { User } from "@app/core/models/user";
import {GameService} from "@app/core/services/game.service";
import { environment } from '@environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { disableDebugTools } from '@angular/platform-browser';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

import { StudentCourseService } from 'src/app/core/services/student-course.service';
import { Router, ActivatedRoute } from '@angular/router';

import { StudentGroup } from '@app/core/models/studentGroup.model';
import { StudentsGroup } from '@app/core/services/group-student.service';
import { CourseService } from '../../../core/services/course.service';



import decode from 'jwt-decode';

declare var $: any;



@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],

})

export class GameComponent implements OnInit, AfterViewInit {
  //user variables
  courseId: string;
  routeName: string;
  currentUser: User;
  //game variables
  character:any ; // element in the DOM for the caracter
  block:any;// element obstacle in the game
  floorElement:any;
  scoreSpan:any //element that prints the score on the screen
  highScoreSpan:any
  courseHighScoreSpan:any //html element for the course's high score
  game:any // html wrapper of the game
  blockPosition:number=500;
  floorPosition={
    left:-100,
    width:700
  };
  checkDeadFunc ;//checks if you lost the game RUNS EVERY TEN SECONDS

  request2:any; //used for animation
  request3:any; //used for animation
  gameOver:boolean=false;

  //scores
  studentHighScore:any;
  courseHighScore:any;
  counter:number= 0; //score counter

  //LEADERBOARD
  leaderboard:any;

  courseIdPromise: Promise<string>;

  constructor(private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService,private http: HttpClient, private gameService: GameService,private modalService: NgbModal) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x); 
  }
/** MODAL FUNCTION */
  open(content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true,
    })
  }
  handleLeaderboard(){
    let users = this.leaderboard;
    let count = 1;
    for(let a=0;a<users.length;a++){
        users[a]= {
          counter : count,
          ...users[a]
        }
        count++;
    }
    console.log(users);
    return users;
  }
 /** MODAL END */ 
  
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
  
  this.route.url.subscribe(url => {
    if (url[1]) {
      this.routeName = url[1].path;
    }else {
      this.routeName = 'home';
    }
    console.log("ROUTE: " + this.routeName);
  })
  

 };
 
   ngAfterViewInit(): void {


    this.character= document.getElementById("character");
    this.block = document.getElementById("block");
    this.scoreSpan = document.getElementById("scoreSpan");
    this.game = document.getElementsByClassName("start-game");
    this.highScoreSpan = document.getElementById("youHighScore");
    this.courseHighScoreSpan = document.getElementById("CourseHighScore");
    this.floorElement = document.getElementById("floor");
    

    $(".start-game").one('click', ()=>{ //event only executes once and activates the game   
      this.animateBlock();
      this.animateFloor();
    })

    this.gameService.getHighScore(this.courseId, this.currentUser).subscribe((res)=>{
      this.studentHighScore = res['student_score'];
      this.highScoreSpan.innerHTML = `${this.studentHighScore}`;
    })
    this.gameService.getCourseHighScore(this.courseId, this.currentUser).subscribe((res)=>{
      this.courseHighScore = res['high_score'];
      this.courseHighScoreSpan.innerHTML = `${this.courseHighScore}`;
    })
    this.gameService.getAllScoresByCourseId(this.courseId, this.currentUser).subscribe((res)=>{
       this.leaderboard = res;
       this.leaderboard = this.handleLeaderboard();
       console.log(this.leaderboard, res);
    })
  };

  handleScore(){
    let score = Math.floor(this.counter / 100);
    if(score > this.studentHighScore){//if score is greater than highest Score, update it
        this.gameService.setHighScore(score,this.courseId, this.currentUser).subscribe((res)=>{
           this.studentHighScore = score;
           this.highScoreSpan.innerHTML = `${this.studentHighScore}`;
        });
        if( score > this.courseHighScore){//if score > course high score then UPDATE it
          this.gameService.setCourseHighScore(this.courseId, score, this.currentUser).subscribe((res)=>{
             this.courseHighScore = score
             this.courseHighScoreSpan.innerHTML = `${this.courseHighScore}`; 
          });
        };
    }  
  };

  /**
   * ANIMATION FUNCTIONS FOR THE GAME GO BELOW
   */
   jump(){// makes the character jump
    //console.log("jump", this.character);
    if(this.character.classList.contains("animate")){return}
      this.character.classList.add("animate");
      setTimeout(function () {
        this.character.classList.remove("animate");
      }, 300);
   };
   checkDead(){
      let characterTop = parseInt(window.getComputedStyle(this.character).getPropertyValue("top"));
      let blockLeft = parseInt(window.getComputedStyle(this.block).getPropertyValue("left"));
      if (blockLeft < 10 && blockLeft > -20 && characterTop >= 130) {
        this.handleScore(); //update score if necessary
        this.endGame();
      } else {
        this.counter++;
        this.scoreSpan.innerHTML = Math.floor(this.counter / 100); //calculate real score
      }
   };
   animateBlock() {
     console.log("here")
    if (this.blockPosition == -20) {
      this.blockPosition=500;
      this.block.style.left = this.blockPosition + 'px';
    } else {
      this.blockPosition= this.blockPosition-5;
      this.block.style.left = this.blockPosition + 'px';
      this.checkDead();
    }
    if (this.gameOver == false){ //repeat animation while it's not yet game over
      this.request2 =requestAnimationFrame(()=>{this.animateBlock()})
    }
    
   };
   animateFloor(){
     if(this.floorPosition.left<=-950 && this.floorPosition.width>=1250){
       this.floorPosition.left = 0
       this.floorPosition.width = 700
       this.floorElement.style.left = this.floorPosition.left
       this.floorElement.style.width = this.floorPosition.width
     }else{
       this.floorPosition.left = this.floorPosition.left-5
       this.floorPosition.width = this.floorPosition.width +5
       this.floorElement.style.left = this.floorPosition.left + 'px';
       this.floorElement.style.width = this.floorPosition.width+ 'px';
     }
      if (this.gameOver == false){ //repeat animation while it's not yet game over
       this.request3 = requestAnimationFrame(()=>{this.animateFloor()})
      }
    }
   endGame(){
   
     this.gameOver = true;
     console.log(this.game)
     this.game[0].classList.add("disabled");

     //cancel requestAnimationFrame
     cancelAnimationFrame(this.request2)
     cancelAnimationFrame(this.request3)
     
     //$(".start_game").prop('disabled',true);
     this.counter=0
     this.scoreSpan.innerHTML = this.counter
     this.blockPosition=500;
        
     /**RESET ANIMATIONS */
     this.floorPosition.left = 0
     this.floorPosition.width = 600
     this.floorElement.style.left = this.floorPosition.left
     this.floorElement.style.width = this.floorPosition.width+'px'
     this.block.style.left = this.blockPosition + 'px';

   };

   restartGame(){
     this.game[0].classList.remove("disabled");
     this.gameOver = false;
     this.animateBlock();
     this.animateFloor();
   };
   
  
  


 



 

}