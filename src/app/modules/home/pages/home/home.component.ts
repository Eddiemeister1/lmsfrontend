import {
  bounceAnimation,
  flashAnimation,
  pulseAnimation,
  rubberBandAnimation,
  shakeAnimation,
  swingAnimation,
  tadaAnimation,
  wobbleAnimation,
  jelloAnimation,
  bounceInAnimation,
  bounceInDownAnimation,
  bounceInLeftAnimation,
  bounceInRightAnimation,
  bounceInUpAnimation,
  bounceOutAnimation,
  bounceOutDownAnimation,
  bounceOutLeftAnimation,
  bounceOutRightAnimation,
  bounceOutUpAnimation,
  fadeInAnimation,
  fadeInDownAnimation,
  fadeInDownBigAnimation,
  fadeInLeftAnimation,
  fadeInLeftBigAnimation,
  fadeInRightAnimation,
  fadeInRightBigAnimation,
  fadeInUpAnimation,
  fadeInUpBigAnimation,
  fadeOutAnimation,
  fadeOutDownAnimation,
  fadeOutDownBigAnimation,
  fadeOutLeftAnimation,
  fadeOutLeftBigAnimation,
  fadeOutRightAnimation,
  fadeOutRightBigAnimation,
  fadeOutUpAnimation,
  fadeOutUpBigAnimation,
  flipAnimation,
  flipInXAnimation,
  flipInYAnimation,
  flipOutXAnimation,
  flipOutYAnimation,
  lightSpeedInAnimation,
  lightSpeedOutAnimation,
  rotateInAnimation,
  rotateInDownLeftAnimation,
  rotateInDownRightAnimation,
  rotateInUpLeftAnimation,
  rotateInUpRightAnimation,
  rotateOutAnimation,
  rotateOutDownLeftAnimation,
  rotateOutDownRightAnimation,
  rotateOutUpLeftAnimation,
  rotateOutUpRightAnimation,
  slideInDownAnimation,
  slideInLeftAnimation,
  slideInRightAnimation,
  slideInUpAnimation,
  slideOutDownAnimation,
  slideOutLeftAnimation,
  slideOutRightAnimation,
  slideOutUpAnimation,
  zoomInAnimation,
  zoomInDownAnimation,
  zoomInLeftAnimation,
  zoomInRightAnimation,
  zoomInUpAnimation,
  zoomOutAnimation,
  zoomOutDownAnimation,
  zoomOutLeftAnimation,
  zoomOutRightAnimation,
  zoomOutUpAnimation,
  hingeAnimation,
  jackInTheBoxAnimation,
  rollInAnimation,
  rollOutAnimation,
  // other
  collapseAnimation,
  rotateAnimation,
  fadeInUpOnEnterAnimation,
  fadeInDownOnEnterAnimation,
  zoomInUpOnEnterAnimation,
  hueRotateAnimation
} from 'angular-animations';

import {trigger, state, style, animate, transition} from '@angular/animations';

import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { HeaderComponent } from '@app/shared/header/header.component';
//import { AuthService } from '@app/core/services/auth.service';
import { GlobalAnnouncementService } from '@app/core/services/global-announcement.service';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { FacebookService } from '@greg-md/ng-facebook';
import { FacebookLoginProvider, AuthService } from "angularx-social-login";
import { StudentService } from '@app/core/services/student.service';
import { isEmpty } from 'lodash';

import { User } from '@app/core/models/user';
import decode from 'jwt-decode';
import { timeout } from 'rxjs/operators';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    fadeInDownOnEnterAnimation({ anchor: 'enter0', duration: 600, delay: 1000 }),
    fadeInDownOnEnterAnimation({ anchor: 'enter1', duration: 600, delay: 200 }),
    zoomInUpOnEnterAnimation({ anchor: 'enter2', duration: 700, delay: 200 }),
    fadeInUpOnEnterAnimation({ anchor: 'enter3', duration: 700, delay: 1000 }),
    bounceAnimation(),
    flashAnimation(),
    pulseAnimation({ anchor: 'pulse' }),
    rubberBandAnimation(),
    shakeAnimation(),
    swingAnimation(),
    tadaAnimation(),
    wobbleAnimation(),
    jelloAnimation(),
    bounceInAnimation(),
    bounceInDownAnimation(),
    bounceInLeftAnimation(),
    bounceInRightAnimation(),
    bounceInUpAnimation(),
    bounceOutAnimation(),
    bounceOutDownAnimation(),
    bounceOutLeftAnimation(),
    bounceOutRightAnimation(),
    bounceOutUpAnimation(),
    fadeInAnimation(),
    fadeInDownAnimation(),
    fadeInDownBigAnimation(),
    fadeInLeftAnimation(),
    fadeInLeftBigAnimation(),
    fadeInRightAnimation(),
    fadeInRightBigAnimation(),
    fadeInUpAnimation(),
    fadeInUpBigAnimation(),
    fadeOutAnimation(),
    fadeOutDownAnimation(),
    fadeOutDownBigAnimation(),
    fadeOutLeftAnimation(),
    fadeOutLeftBigAnimation(),
    fadeOutRightAnimation(),
    fadeOutRightBigAnimation(),
    fadeOutUpAnimation(),
    fadeOutUpBigAnimation(),
    flipAnimation(),
    flipInXAnimation(),
    flipInYAnimation(),
    flipOutXAnimation(),
    flipOutYAnimation(),
    lightSpeedInAnimation(),
    lightSpeedOutAnimation(),
    rotateInAnimation(),
    rotateInDownLeftAnimation(),
    rotateInDownRightAnimation(),
    rotateInUpLeftAnimation(),
    rotateInUpRightAnimation(),
    rotateOutAnimation(),
    rotateOutDownLeftAnimation(),
    rotateOutDownRightAnimation(),
    rotateOutUpLeftAnimation(),
    rotateOutUpRightAnimation(),
    slideInDownAnimation(),
    slideInLeftAnimation(),
    slideInRightAnimation(),
    slideInUpAnimation(),
    slideOutDownAnimation(),
    slideOutLeftAnimation(),
    slideOutRightAnimation(),
    slideOutUpAnimation(),
    zoomInAnimation(),
    zoomInDownAnimation(),
    zoomInLeftAnimation(),
    zoomInRightAnimation(),
    zoomInUpAnimation(),
    zoomOutAnimation(),
    zoomOutDownAnimation(),
    zoomOutLeftAnimation(),
    zoomOutRightAnimation(),
    zoomOutUpAnimation(),
    hingeAnimation(),
    jackInTheBoxAnimation(),
    rollInAnimation(),
    rollOutAnimation(),
    // other
    collapseAnimation(),
    rotateAnimation(),
    rotateAnimation({ anchor: 'rotate90', degrees: 90 }),
    hueRotateAnimation(),
    hueRotateAnimation({ anchor: 'hueButton', duration: 20000 })
  ]
})

export class HomeComponent implements OnInit {

  globalAnnouncements = [];
  currentUser;
  userPayload: User;
  timeoutVar: any;

  constructor(private cookieService: CookieService, private authFB: AuthService, private globalAnnouncementService: GlobalAnnouncementService, private authenticationService: AuthenticationService, private studentService: StudentService, private FB: FacebookService) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
  }

  getCookie(key: string) {
    return this.cookieService.get(key);
  }

  ngOnInit() {
    // fetch announcements
    this.globalAnnouncementService.fetchGlobalAnnouncements().subscribe((globalAnnouncementsData: any[]) => {
      this.globalAnnouncements = globalAnnouncementsData;
    })
  }

  ngOnDestroy() {
    clearTimeout(this.timeoutVar);
    //localStorage.clear();
  }

  deleteAnnouncement(id) {
    let r = confirm("Delete announcement: Are you sure?");
    if (r) {
      this.globalAnnouncementService.deleteGlobalAnnouncement(id).subscribe(() => {
        alert("Deleted announcement");
      })
    }
  }

  

  animation = 'rubberBand';
  animationState = false;
  animationWithState = false;
  hueBtnState = false;

  animate() {
    this.animationState = false;
    setTimeout(() => {
      this.animationState = true;
      this.animationWithState = !this.animationWithState;
    }, 1);
  }
}
