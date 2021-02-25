import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  courseId: number;
  routeName: string;
  isToggled: boolean;
  constructor(private route: ActivatedRoute) { }



  ngOnInit() {
    this.route.params.subscribe(params => {
      this.courseId = params.id;
    });

    this.route.url.subscribe(url => {
      console.log(url);
      if (url[1]) {
        this.routeName = url[1].path;
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
      console.log('((((((( 1 )))))))');
    } else {
      console.log('((((((( 2 )))))))');
      document.getElementById("mySidenav").style.left = "-300px";
    }
  }


  ngAfterViewChecked() {
    //document.getElementById("mySidenav").style.width = "250px";
    //document.getElementById("main").style.marginLeft = "250px";
    document.getElementById("mySidenav").style.display = "block";
    console.log('$$$$--->>> ' + this.routeName);
    document.getElementById(this.routeName).style.color = "#081e3f";
    //document.getElementById(this.routeName).style.backgroundColor = "#2d3d97";
  }

  ngOnDestroy() {
    //console.log("sidebar destroy");
    document.getElementById("mySidenav").style.display = "none";
    document.getElementById("mySidenav").style.width = "0";
    //document.getElementById("main").style.marginLeft = "0";
  }
}
