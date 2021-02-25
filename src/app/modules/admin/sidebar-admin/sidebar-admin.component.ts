import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sidebar-admin',
  templateUrl: './sidebar-admin.component.html',
  styleUrls: ['./sidebar-admin.component.scss']
})
export class SidebarAdminComponent implements OnInit {

  courseId: number;
  isToggled: boolean;
  routeName: string;
  constructor(private route: ActivatedRoute) { };


  ngOnInit() {
    this.route.params.subscribe(params => {
      this.courseId = params.id;
    });

    this.route.url.subscribe(url => {
      console.log(url);
      if (url[0]) {
        this.routeName = url[0].path;
      }
      else {
        this.routeName = 'home';
      }
      console.log("ROUTE: " + this.routeName);
    });
  }

  toggleMenu(e) {
    //e.classList.toggle("active");
    console.log('entro con click');
    //document.querySelector("aside").classList.toggle("active");
    console.log(this.isToggled);
    this.isToggled = !this.isToggled;
    console.log(this.isToggled);
    if (this.isToggled) {
      document.getElementById("mySidenav").style.left = "0";
      console.log('1');
    } else {
      console.log('2');
      document.getElementById("mySidenav").style.left = "-300px";
    }

  }



  ngAfterViewChecked() {
    document.getElementById("mySidenav").style.display = "block";
    document.getElementById(this.routeName).style.color = "#081e3f";
    //document.getElementById(this.routeName).style.backgroundColor = "#081e3f14";
  }

  ngOnDestroy() {
    //console.log("sidebar destroy");
    document.getElementById("mySidenav").style.display = "none";
    document.getElementById("mySidenav").style.width = "0";
    //document.getElementById("main").style.marginLeft = "0";
  }
}
