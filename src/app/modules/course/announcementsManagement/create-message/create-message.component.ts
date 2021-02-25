import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { StudentCourseService } from 'src/app/core/services/student-course.service';
import { User } from '@app/core/models/user';
import { AuthenticationService } from '@app/core/services/authentication.service';
import { MessageService } from '@app/core/services/message.service';

@Component({
  selector: 'app-create-message',
  templateUrl: './create-message.component.html',
  styleUrls: ['./create-message.component.scss']
})
export class CreateMessageComponent implements OnInit {

  courseId: number;
  routeName: string;
  admins: Promise<any[]>;
  instructors: Promise<any[]>;
  students: Promise<any[]>;
  currentUser: User;
  constructor(private router: Router, private route: ActivatedRoute, private authenticationService: AuthenticationService,
    private _location: Location, private messageService: MessageService) {
    this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
   }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.courseId = params.id;
    });

    if (this.currentUser.role === "admin") {
      this.route.params.subscribe((params) => {
        this.messageService.fetchAdminsByCourseId(params.id).subscribe((admins: any[]) => {
          this.admins = Promise.resolve(admins);
        });
      });
    }

    this.route.params.subscribe((params) => {
      this.messageService.fetchInstructorsByCourseId(params.id).subscribe((instructors: any[]) => {
        this.instructors = Promise.resolve(instructors);
      });
    });

    this.route.params.subscribe((params) => {
      this.messageService.fetchStudentsByCourseId(params.id).subscribe((students: any[]) => {
        this.students = Promise.resolve(students);
      });
    });
  }

  createMessage() {
    let sender_id = this.currentUser.id;
    let receiver_id = Number((<HTMLSelectElement>document.getElementById('studentInfo')).value);
    let content = (<HTMLTextAreaElement>document.getElementById('content')).value;
    let now = new Date();

    let offsetHours = new Date().getTimezoneOffset() / 60;
    let offsetMinutes = 0;
    if (offsetHours % 1 != 0) {
      offsetMinutes = offsetHours % 1 * 60;
    }

    if(content.length === 0) {
      alert("Message is empty. Please provide some content for the message.");
    }
    else {
      this.messageService.createMessage(sender_id, receiver_id, content, now, now, this.courseId, null).subscribe((message: any) => {
        console.log("MESSAGE: " + message);
      });
      alert("Message sent!");
      this._location.back();
    }
  }
}
