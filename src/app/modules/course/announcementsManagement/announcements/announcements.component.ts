import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { AnnouncementService } from '@app/core/services/announcement.service';
import { MessageService } from '@app/core/services/message.service';
import { User } from '@app/core/models/user';

import { AuthenticationService } from '@app/core/services/authentication.service';

@Component({
  selector: 'app-announcements',
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.scss']
})
export class AnnouncementsComponent implements OnInit {

  announcements: Promise<any[]>;
  currentUser: User;
  courseId: number;
  isExpanded: boolean;
  constructor(private announcementService: AnnouncementService, private route: ActivatedRoute, 
    private authenticationService: AuthenticationService, private messageService: MessageService,
    private router: Router) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
   }
  

  ngOnInit(): void {
    this.isExpanded = false;

    this.route.params.subscribe(params => {
      this.courseId = params.id;
    });
    /*
    this.route.params.subscribe((params) => {
      this.announcementService.fetchAnnouncementsByCourseId(params.id).subscribe((announcements: any[]) => {
        this.announcements = Promise.resolve(announcements);
      });
    });
    */
   this.announcementService.fetchAnnouncementsByCourseIdAndCurrentUserid(this.courseId, this.currentUser.id).subscribe((announcements: any[]) => {
     this.announcements = Promise.resolve(announcements);
   });
  }

  goToExpanded(a: any[]) {
    this.router.navigate(['./view'], { relativeTo: this.route, state: {a: a}});
  }

}


