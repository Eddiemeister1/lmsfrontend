import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private http: HttpClient) { }

  createMessage(sender_id, receiver_id, content, created, changed, course_id, parent_id) {
    let message = {
      sender_id: sender_id,
      receiver_id: receiver_id,
      content: content,
      created: created,
      changed: changed, 
      course_id: course_id,
      parent_id: parent_id
    };
    return this.http.post(`${environment.apiURL}/messages`, message);
  }

  fetchAdminsByCourseId(id) {
    return this.http.get(`${environment.apiURL}/messages/a/${id}`);
  }

  fetchInstructorsByCourseId(id) {
    return this.http.get(`${environment.apiURL}/messages/i/${id}`);
  }

  fetchStudentsByCourseId(id) {
    return this.http.get(`${environment.apiURL}/messages/s/${id}`);
  }

  fetchRepliesByParentId(parentId) {
    return this.http.get(`${environment.apiURL}/messages/r/p/${parentId}`);
  }

  fetchRepliesByCourseId(id) {
    return this.http.get(`${environment.apiURL}/messages/r/c/${id}`);
  }

  updateChangedDateByMessageId(id, newDate) {
    let newMessage = {
      id: id,
      changed: newDate
    }
    return this.http.put(`${environment.apiURL}/messages/${id}`, newMessage);
  }
}
