import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { Course } from '@app/core/models/course.model';
import { StudentGroup } from '@app/core/models/studentGroup.model';
import { StudentsGroup } from '@app/core/services/group-student.service';
import { CourseService } from '../../../core/services/course.service';
import { StudentCourseService } from '@app/core/services/student-course.service';
import { StudentService } from '@app/core/services/student.service';
import { GroupsService } from '@app/core/services/groups.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-edit-course',
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.scss']
})
export class EditCourseComponent implements OnInit {

  id: number;
  course: Course;
  student_group: StudentGroup;
  updateForm: FormGroup;
  submitted = false;
  startDate: Promise<string> | null = null;
  startDateSelected = false;
  startDateEvent: Promise<String> | null = null;
  endDate: Promise<string> | null = null;
  endDateSelected = false;
  endDateEvent: Promise<String> | null = null;
  instructors: Observable<any>;
  oldInstructor: String;
  oldInstructorId: number;
  countStudents:number;
  totalGroup:number;
  olDtgroup:number;
  studentCourseDetails: any;
  idArray = [];

  constructor(private studentsGroup: StudentsGroup, private courseService: CourseService, private groupsService: GroupsService, private studentCourseService: StudentCourseService, private studentService: StudentService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {
    this.CreateForm();
  }

  CreateForm() {
    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      instructor: ['', Validators.required],
      description: ['', Validators.required],
      seats: ['', Validators.required],
      tgroup: ['',Validators.required],
      start_date: [''],
      end_date: ['']
    });
  }

  get cu() { return this.updateForm.controls; }

  ngOnInit() {
    this.instructors = this.studentService.getInstructors();
    this.route.params.subscribe(params => {
      this.id = params.id;
      this.courseService.getCourseById(this.id).subscribe((res: Course) => {
        this.course = res;

        //console.log(this.course.start_date);

        this.hDateFormat(this.course);

        console.log(this.course.start_date);

        this.courseService.getGroupByCourseId(this.id).subscribe((course: any) => {
            this.totalGroup = course.tgroup;
            console.log('------------------> this data: ' + this.totalGroup)
        });

        this.updateForm.get('name').patchValue(this.course.name);
        this.updateForm.get('description').patchValue(this.course.description);
        this.updateForm.get('seats').patchValue(this.course.seats);
        this.updateForm.get('tgroup').patchValue(this.course.tgroup);

        this.olDtgroup = this.course.tgroup;
        console.log(this.olDtgroup + '<----------- Old tgroup number');


        this.studentCourseService.getInstructorByCourseId(this.id).subscribe((instructor: any) => {
          console.log(instructor);
          //this.updateForm.get('instructor').setValue(instructor.email);
          this.oldInstructor = instructor.email;
          this.oldInstructorId = instructor.student_id;
        })
        let newDate = new Date(this.course.start_date.toString());
        let dd = String(newDate.getDate()).padStart(2, '0');
        let mm = String(newDate.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = newDate.getFullYear();

        this.startDate = new Promise<string>((resolve, reject) => { resolve(mm + '/' + dd + '/' + yyyy); });
        this.updateForm.get('start_date').patchValue(mm + '/' + dd + '/' + yyyy);

        newDate = new Date(this.course.end_date.toString());
        dd = String(newDate.getDate()).padStart(2, '0');
        mm = String(newDate.getMonth() + 1).padStart(2, '0'); //January is 0!
        yyyy = newDate.getFullYear();

        

        this.endDate = new Promise<string>((resolve, reject) => { resolve(mm + '/' + dd + '/' + yyyy); });
        this.updateForm.get('end_date').patchValue(mm + '/' + dd + '/' + yyyy);

        

      });
    });

    /**** This Show Total number of current Enrollment ****/
    this.countStudents = 0;
    this.studentCourseService.getStudentsByCourseId(this.id).subscribe((data: []) => {
      if(data.length == 0){
        console.log('Empty Data');
      }else{
        this.countStudents = 0;
        data.forEach((student_id: any, i, arr) => {
          this.countStudents += 1;
          
        })
        console.log('Total count: ' + this.countStudents);
  
      }
    });
  }

  

  updateCourse(name, instructor, description, seats, tgroup, start_date, end_date) {
    this.submitted = true;

    start_date = this.formatDate(start_date);
    //this.cu.start_date = start_date;
    //this.updateForm.get('start_date').setValue(start_date);
    console.log("going to submit start_date: " + start_date + " " + this.updateForm.get('start_date').value);

    end_date = this.formatDate(end_date);
    //this.cu.end_date = end_date;
    //this.updateForm.get('end_date').setValue(end_date);
    console.log("going to submit end_date: " + end_date + " " + this.updateForm.get('end_date').value); //leave this log here

    this.updateForm.get('start_date').clearValidators();
    this.updateForm.get('start_date').updateValueAndValidity();
    this.updateForm.get('end_date').clearValidators();
    this.updateForm.get('end_date').updateValueAndValidity();

    if(instructor){
      console.log('instructor ' + instructor);
      console.log('instructor id: ' + instructor.id);
    }
    if (!this.updateForm.valid) {
      console.log("invalid form");
      return;
    } else if(this.updateForm.get('start_date').value == "" && this.updateForm.get('end_date').value == ""){
      console.log(this.updateForm.get('start_date').value);
      console.log(this.updateForm.get('end_date').value);
      return;
    }

    this.courseService.updateCourse(this.id, name, description, seats, tgroup, start_date, end_date).subscribe(res => {
      //remove old instructor
      if (instructor.id == this.oldInstructorId){
        console.log('same instructor!');
      }else{
        this.studentCourseService.declineStudentEnrollment(this.oldInstructorId, this.id).subscribe(() => {
          console.log("Removed old instructor from course");
        });
        //add new instructor
        this.studentCourseService.enrollStudentToCourse(instructor.id, this.id, 'enrolled').subscribe(() => {
          console.log("Added new instructor to course");
        });
      }
      this.router.navigate(['/admin/dashboard']);

    });

    // This create groups base on instructor input.
    var newTotalGroup = (document.getElementById("totalGroup") as HTMLTextAreaElement).value;
    console.log('New Total Group: ' + newTotalGroup);

    
    // Check and Create Groups base on Instructor input.
    var error = 0;
    if(this.olDtgroup == tgroup){  // do nothing
      console.log('Groups stay the same!!!!');
    }else if(tgroup!=0){
      console.log('tgroup: ' + tgroup + ' countStudents: ' +this.countStudents)
      if(tgroup > this.countStudents){ // set to 0
        
        console.log('Error tgroup > count students...., no groups are created!!! Total Group is 0.')
        this.courseService.updateCourseGroup(this.id,error).subscribe(() => {
          console.log('Total Group is 0')
        })
      }else if( tgroup == 1){ // set to 0
        console.log('We dont need groups because the total of students enrroll is 1, Total Group is 0')
        this.courseService.updateCourseGroup(this.id,error).subscribe(() => {
          console.log('Total Group is 0')
        })

      }else if (tgroup < 0){ // set to 0
        console.log('Error on Total Group Entry...., no groups are created!!! Total Group is 0.')
        this.courseService.updateCourseGroup(this.id,error).subscribe(() => {
          console.log('Total Group is 0')
        })

      }else if (tgroup > 1){ // Create Groups
        console.log('create groups!!!')

        //Delete all groups in a course so that we can create new groups!
        this.studentsGroup.deleteAllGroups(this.id).subscribe(() => {
          console.log('All groups from course: ' + this.id + ' are deleted!.')
        })
        
        this.setStudentGroups(this.id,tgroup, this.countStudents);

      }

    }

    

  }


  // Set Groups in a Course (Need CourseId, Total of group that need to be create and Total of Students in that Course)
  setStudentGroups(courseId,TotalgroupNumber, totalStudents){

    this.studentCourseService.getStudentsByCourseId(courseId).subscribe((dataStudents: []) => {
      this.studentCourseDetails = dataStudents
      console.log('inside get student by course id')
      if(dataStudents.length == 0){
        console.log('Empty Data');  // check if there is no data
      }else{
        dataStudents.forEach((studentInCourse: any, i, arr) => {
          this.idArray.push(studentInCourse.student_id);  // Get all students id in a course
          
        })
        console.log('Total of Students: ' + totalStudents + ' List of students id: ' + this.idArray)
      
      
        let finalArray = [],
            randomArray = [];
            
            randomArray = this.shuffle(this.idArray);
            console.log('Set id Array Random: ' + randomArray)
            finalArray = this.splitIntoGroups(randomArray, TotalgroupNumber); // get array of groups

        for(var index = 0; index < TotalgroupNumber; index++) {
          var addGN = index + 1; 
          console.log('Group #' + addGN + ' : ' + finalArray[index]);
          var lastArray =  finalArray[index];
          for(var j = 0; j < lastArray.length; j++){
            console.log('Creating studentID: ' + lastArray[j] + ' in course: ' + courseId + ' with group number: ' + addGN);
            
            var setStudent_ID = lastArray[j];
            // set students into groups
            
            this.studentsGroup.addStudentGroup(setStudent_ID,courseId,addGN).subscribe((studentGroup: StudentGroup) => {
              console.log("student in group: " + JSON.stringify(studentGroup));

            })
           
          }
        } 
      }
    });
  }


  splitIntoGroups(studentArray, totalG) {
    var rest = studentArray.length % totalG, // how much to divide
        restUsed = rest, // to keep track of the division over the elements
        partLength = Math.floor(studentArray.length / totalG),
        result = [];

    for(var i = 0; i < studentArray.length; i += partLength) {
        var end = partLength + i,
            add = false;

        if(rest !== 0 && restUsed) { // should add one element for the division
            end++;
            restUsed--; // we've used one division element now
            add = true;
        }

        result.push(studentArray.slice(i, end)); // part of the array

        if(add) {
            i++; // also increment i in the case we added an extra element for division
        }
    }

    return result;
  }

  shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
  
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
  
      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
  
    return array;
  }


  hDateFormat(course: Course) {
    let start_date = new Date(course.start_date.toString());
    let end_date = new Date(course.end_date.toString());

    course.start_date = start_date.toLocaleDateString();
    course.end_date = end_date.toLocaleDateString();
  }

  formatDate(date) {
    let newDate = new Date(date);
    let dd = String(newDate.getDate()).padStart(2, '0');
    let mm = String(newDate.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = newDate.getFullYear();

    let dateRes: String = yyyy + '-' + mm + '-' + dd;
    return dateRes;
  }

  onStartDateSelect(event) {
    this.startDateSelected = true;
    this.startDateEvent = new Promise<String>((resolve, reject) => {
      resolve(String(event.month).padStart(2, '0') + '/' + String(event.day).padStart(2, '0') + '/' + event.year);
    });
  }

  onEndDateSelect(event) {
    this.endDateSelected = true;
    this.endDateEvent = new Promise<String>((resolve, reject) => {
      resolve(String(event.month).padStart(2, '0') + '/' + String(event.day).padStart(2, '0') + '/' + event.year);
    });
  }

}
