import { JsonPipe } from '@angular/common';
import { JsonpInterceptor } from '@angular/common/http';
import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private router: Router = new Router;

  rightPanelActive = false;

  name: string = "";
  email: string = "";
  password: string = "";
  token: string = "";

  showSignUp(): void {
    this.rightPanelActive = true;
  }

  showSignIn(): void {
    this.rightPanelActive = false;
  }

  activateSignIn() {
    // console.log("email:", this.email, "pword:", this.password);
    // console.log("jsonified body: ", typeof(JSON.stringify({
    //   "Email": this.email,
    //   "Password": this.password
    // })))

    fetch("http://localhost:5122/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        Email: this.email,
        Password: this.password
      }),
      headers: { "Content-Type": "application/json" }
    })
    .then((response) => {
      if (response.status == 200) {
        response.text().then((text) => {
          // console.log(text)
          this.token = text.substring(10, 321)
          // console.log(this.token)

          this.router.navigate(["/dashboard"])
        })
      } else if (response.status == 401) {
        console.log("invalid pword")
        // add alerts later
      }
    })
  }


  activateSignUp() {
    fetch("http://localhost:5122/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username: this.name,
        email: this.email,
        password: this.password,
        role: "Admin" //TEMPORARY ALL ADMINS
      }),
      headers: {"Content-Type": "application/json"}
    })
  }
}
