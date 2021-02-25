import { Component, OnInit, Output, Input, EventEmitter, NgZone } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VideoTimerService } from '@app/core/services/video-timer.service';
import { StudentVideoProgressService } from '@app/core/services/student-video-progress.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-youtube-player',
  templateUrl: './youtube-player.component.html',
  styleUrls: ['./youtube-player.component.scss']
})
export class YoutubePlayerComponent implements OnInit {
  @Input() public ytVideo;
  @Input () public studentId;
  @Output() passEntryItem: EventEmitter<any> = new EventEmitter();

  recentDetections: Array<Number>;

  public player: any;
  public vidId: String;
  public timer: any;
  public timeSpent: any[] = [];
  percentageWatched = 0;
  public reframed: Boolean = false;
  isRestricted = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  interval;
  take: number = 1;


  watchedEnough: boolean = false;
  alreadySetPartial: boolean = false;
  alreadySetComplete: boolean = false;


  public timeLeft: number;
  public vidLengthInSeconds: number;


  progressData: any[];

  // Threshold Constants (x2)
  firstThreshold: number = 3;
  secondThreshold: number = 7;

  // Take numbers required for threshold calculations
  takeTreshold: number = 2;


  

  ngAfterViewInit() {

    // DONT ADD METHODS HERE THEY ONLY RUN ONCE ON PAGE REFRESH!

    if (window['YT']) {
      this.startVideo();
      return;
    }

    const doc = (<any>window).document;
    const playerApiScript = doc.createElement('script');
    playerApiScript.type = 'text/javascript';
    playerApiScript.src = 'https://www.youtube.com/iframe_api';
    doc.body.appendChild(playerApiScript);
    
  }


  constructor( public activeModal: NgbActiveModal,
                private timerService: VideoTimerService,
                private zone:NgZone, 
                private videoProgressService: StudentVideoProgressService,
                private router: Router) { 
                }

  ngOnInit(): void {
    console.log(this.ytVideo);

    this.vidId = this.ytVideo.link.toString().split(' ')[4].split('/')[4];
    console.log("TESTT");
    console.log(this.vidId);
    (<any>window).onYouTubeIframeAPIReady = () => this.startVideo();
    this.prepareProgressTracking();
    this.timerService.getWatchedPercentage().subscribe((value) => {
      this.zone.run(() => { // <== added
        this.ytVideo.percentageWatched = value;
      });
    });
    
    
  }


  passBack() {
    this.passEntryItem.emit(this.ytVideo);
    this.activeModal.close(this.ytVideo);
    this.pauseTimer();

    this.alreadySetComplete = false;
    this.alreadySetPartial = false;
  }

  startVideo() {
    this.reframed = false;
    this.player = new window['YT'].Player('player', {
      videoId: this.vidId,
      playerVars: {
        autoplay: 1,
        modestbranding: 1,
        controls: 1,
        disablekb: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
        playsinline: 1

      },
      events: {
        'onStateChange': this.onPlayerStateChange.bind(this),
        'onError': this.onPlayerError.bind(this),
        'onReady': this.onPlayerReady.bind(this),
      }
    });
  }

  /* 4. It will be called when the Video Player is ready */
  onPlayerReady(event) {
    if (this.isRestricted) {
      event.target.mute();
      event.target.playVideo();
    } else {
      event.target.playVideo();
    }
  }

  /* 5. API will call this function when Player State changes like PLAYING, PAUSED, ENDED */
  onPlayerStateChange(event) {
    console.log(event)
    switch (event.data) {
      case window['YT'].PlayerState.PLAYING:
        if (this.cleanTime() == 0) {
          this.timeLeft = this.player.getDuration();
          this.vidLengthInSeconds = this.player.getDuration();
          console.log(this.timeLeft)
          console.log('started ' + this.cleanTime());
          //start the timer here
          this.startTimer();



          //////////////
          // if (event.data === 1) { // started playing
          //             if (!this.timeSpent.length) {
          //               this.timeSpent = new Array(parseInt(this.player.getDuration()));
          //             }
          //             console.log(this.player.getDuration());
          //             this.timer = setInterval(this.record, 100);
          //           }
        } else {
          console.log('playing ' + this.cleanTime())
          this.startTimer();
        };
        break;
      case window['YT'].PlayerState.PAUSED:
        if (this.player.getDuration() - this.player.getCurrentTime() != 0) {
          console.log('paused' + ' @ ' + this.cleanTime());
          this.pauseTimer();
        };
        break;
      case window['YT'].PlayerState.ENDED:
        console.log('ended ');
        this.pauseTimer();
        break;
    };
  };

  startTimer() {
    this.interval = setInterval(() => {
      if(this.timeLeft > 0) {
        this.timeLeft--;
        this.record();
        //this.showPercentage();
      } else {
        this.timeLeft = this.vidLengthInSeconds;
      }
    },1000);
  }

  pauseTimer() {
    clearInterval(this.interval);
  }

  cleanTime() {
    return Math.round(this.player.getCurrentTime())
  };

  onPlayerError(event) {
    switch (event.data) {
      case 2:
        console.log('' + this.vidId)
        break;
      case 100:
        break;
      case 101 || 150:
        break;
    };
  };


  record() {
    this.timeSpent[this.cleanTime()] = true;
    this.showPercentage();
  }
  showPercentage(){
    var percent = 0;
    var l = Math.round(this.vidLengthInSeconds);
    var watched = l - this.timeLeft;
    //percent = Math.round(watched / l * 100);
    // var l = this.timeSpent.length
    for(var i=0; i<l;i++){
      if (this.timeSpent[i]) {percent++;}
    } 
    percent = Math.round(percent / l *100);
    console.log(percent);
    //this.percentageWatched = percent;
    this.timerService.setWatchedPercentage(percent);
    console.log(this.ytVideo.percentageWatched);

    this.checkPercentageThreshold();

    // if (this.ytVideo.percentageWatched >= 2) {
    //   this.watchedEnough = true;
    //   //this.addProgressToDB();
    //   //this.getProgressFromDB();
    // }
    console.log(this.player.getCurrentTime());
  }

  checkPercentageThreshold() {
    switch(this.progressData["progressStatus"]) { 
      case "complete": { 
         //statements; 
         break; 
      } 
      case "incomplete": { 
        if ((this.ytVideo.percentageWatched >= this.firstThreshold) && (this.ytVideo.percentageWatched < this.secondThreshold)) {
          this.watchedEnough = true;
          if (!this.alreadySetPartial) {
            this.setProgressToPartial();
            this.alreadySetPartial = true;
          }
        } else if (this.ytVideo.percentageWatched >= this.secondThreshold) {
          if (!this.alreadySetComplete) {
            this.setProgressToComplete();
            this.alreadySetComplete = true;
          }
        }
         break; 
      } 
      case "partial" : {
        if ((this.ytVideo.percentageWatched >= this.firstThreshold) && (this.ytVideo.percentageWatched < this.secondThreshold)) {
          this.watchedEnough = true;
          if (this.progressData["take"] >= this.takeTreshold) {
            console.log("IM HERE **************");
            this.setProgressToComplete();
          } 
        } else if (this.ytVideo.percentageWatched >= this.secondThreshold) {
          if (!this.alreadySetComplete) {
            this.setProgressToComplete();
            this.alreadySetComplete = true;
          }
        }
        break;
      }
      default: { 
         //statements; 
         break; 
      } 
   } 


    // if ( (this.progressData["progressStatus"] != "complete")) {
    //   if ((this.ytVideo.percentageWatched >= this.firstThreshold) && (this.ytVideo.percentageWatched < this.secondThreshold)) {
    //     this.watchedEnough = true;
    //     if (!this.alreadySetPartial) {
    //       this.setProgressToPartial();
    //       this.alreadySetPartial = true;
    //     }
    //   } else if (this.ytVideo.percentageWatched >= this.secondThreshold) {
    //     if (!this.alreadySetComplete) {
    //       this.setProgressToComplete();
    //       this.alreadySetComplete = true;
    //     }
    //   } else {
    //     // do nothing!
    //   }
    // }

  }



  ngOnDestroy() {
    this.player = null;
    this.timeLeft = 0;
    // this.ytVideopercentageWatched = 0;
    this.pauseTimer();
    this.videoProgressService = null;
    //this.zone = null;
    this.timerService = null;
    this.alreadySetComplete = false;
    this.alreadySetPartial = false;
  }


  dismissProgressAndClose() {
    if(confirm("Are you sure you want to close the video?\nPlease Note that you might lose the tracked progress")) {
      //this.activeModal.close(this.ytVideo);
      this.passBack();
      // this.alreadySetComplete = false;
      // this.alreadySetPartial = false;
    }
  }

  prepareProgressTracking() {
    // this.updateLocalData();
    // console.log(this.progressData);
    // console.log("STATUS" + this.progressData["progressStatus"]);
    // if ((this.progressData["take"] >= 1) && ((this.progressData["progressStatus"] == "incomplete") || (this.progressData["progressStatus"] == "partial") )) {
    //   // Not the first time watcher! NOT COMPLETE
      
    //   this.increaseTakeByOne(this.progressData);
    //   this.take = this.progressData["take"] + 1;
    // } else if ((this.progressData["take"] >= 1) && (this.progressData["progressStatus"] == "complete")) {
    //   // COMPLETE BUT RE WATCHING!
    //   this.increaseTakeByOne(this.progressData);
    //   this.take = this.progressData["take"] + 1;
    // }
    // else if (this.progressData["message"] == "Not found!") {
    //   // First time watching the video (first take)
    //   this.videoProgressService.addProgress(this.studentId, this.ytVideo.id, "incomplete", this.take, 1).subscribe((data2: any[]) => {
    //     console.log(data2);
    //   });
    // } 

    this.videoProgressService.getProgress(this.studentId, this.ytVideo.id).subscribe((data: any[]) => {
      this.zone.run(() => { // <== added
        this.progressData = data;
        console.log(data);
        console.log("STATUS" + data["progressStatus"]);
        if ((data["take"] >= 1) && ((data["progressStatus"] == "incomplete") || (data["progressStatus"] == "partial") )) {
          // Not the first time watcher! NOT COMPLETE
          
          this.increaseTakeByOne(data);
        } else if ((data["take"] >= 1) && (data["progressStatus"] == "complete")) {
          // COMPLETE BUT RE WATCHING!
          this.increaseTakeByOne(data);
        }
        else if (data["message"] == "Not found!") {
          // First time watching the video (first take)
          this.videoProgressService.addProgress(this.studentId, this.ytVideo.id, "incomplete", this.take, 1).subscribe((data2: any[]) => {
            console.log(data2);
            this.updateLocalData();
          });
        } 
      })
    });
  }

  updateLocalData() {
    this.videoProgressService.getProgress(this.studentId, this.ytVideo.id).subscribe((data: any[]) => {
      this.zone.run(() => {
        this.progressData = data;
        console.log("UPDATED LOCAL DATA");
        console.log(this.progressData)
      });
    });
  }

  increaseTakeByOne(currentData) {
    console.log("Increasing video take by 1");
    this.videoProgressService.setProgress(this.studentId, this.ytVideo.id, currentData["progressStatus"], (currentData["take"] + 1), null).subscribe((data: any[]) => {
      console.log(data);
      //this.take = data["take"] + 1;
      this.updateLocalData();
    });
  }

  setProgressToPartial() {
    console.log("Reached 30> setting progress to partial");
    this.videoProgressService.setProgress(this.studentId, this.ytVideo.id, "partial", this.progressData["take"], null).subscribe((data: any[]) => {
      console.log(data);
      this.updateLocalData();
    });
  }

  setProgressToComplete() {
    console.log("Reached 70> setting progress to complete");
    this.videoProgressService.setProgress(this.studentId, this.ytVideo.id, "complete", this.progressData["take"], null).subscribe((data: any[]) => {
      console.log(data);
      this.updateLocalData();
    });
  }
 
}
