import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { MessageService } from '@app/core/services/message.service';
import { User } from '@app/core/models/user';

import { AuthenticationService } from '@app/core/services/authentication.service';

@Component({
  selector: 'app-expanded-a-m',
  templateUrl: './expanded-a-m.component.html',
  styleUrls: ['./expanded-a-m.component.scss', '../announcements/announcements.component.scss']
})
export class ExpandedAMComponent implements OnInit {

  replies: Promise<any[]>;
  isReplying: boolean;
  currentUser: User;
  a: any;

  constructor(private route: ActivatedRoute, private router: Router,
    private messageService: MessageService, private _location: Location,
    private authenticationService: AuthenticationService) {
      this.authenticationService.currentUser.subscribe(x => this.currentUser = x);
      try {
        this.a = history.state.a;
        if (typeof this.a !== 'undefined') {
          localStorage.setItem('message', JSON.stringify(this.a));
          //var message = JSON.parse(localStorage.getItem('message'));
        }
        else {
          throw new Error('Refreshing...');
        }
      }
      catch (e) {
        console.log(e);
        this.a = JSON.parse(localStorage.getItem('message'));
      }
     }

  ngOnInit(): void {
    this.isReplying = false;
    this.messageService.fetchRepliesByParentId(this.a.message_id).subscribe((replies: any[]) => {
      this.replies = Promise.resolve(replies);
    });
  }

  openReply() {
    this.isReplying = true;
    document.getElementById('content-anchor').scrollIntoView();
    //document.getElementById('content-anchor').scrollTo();
  }

  createReply() {
    let content = (<HTMLTextAreaElement>document.getElementById('content')).value;

    if(content.length === 0) {
      alert("Message is empty. Please provide some content for the message.");
    }
    else {
      var sender_id;
      var receiver_id;
      if (this.a.sender_id === this.currentUser.id) {
        receiver_id = this.a.receiver_id;
        sender_id = this.a.sender_id;
      }
      else {
        receiver_id = this.a.sender_id;
        sender_id = this.a.receiver_id;
      }
      
      let now = new Date();
      this.messageService.createMessage(sender_id, receiver_id, content, now, now, this.a.course_id, this.a.message_id).subscribe();
      this.messageService.updateChangedDateByMessageId(this.a.message_id, now).subscribe();
      alert("Reply sent!");
      this.goBack()
    }
  }

  goBack() {
    this._location.back();
  }

}
