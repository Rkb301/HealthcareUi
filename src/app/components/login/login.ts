import { Component, input } from '@angular/core';

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  rightPanelActive = false;

  name: string = "";
  email: string = "";
  password: string = "";
  // token: string = "testToken";

  // loginRequest= new Request("http://localhost:5122/api/auth/login", {
  //   method: "POST",
  //   body: JSON.stringify({
  //     email: this.email,
  //     password: this.password
  //   })
  // })

  showSignUp(): void {
    this.rightPanelActive = true;
  }

  showSignIn(): void {
    this.rightPanelActive = false;
  }

  async activateSignIn() {
    // const response = await fetch(this.loginRequest);
    // this.token = response.text.toString();
    // console.log(this.token);


  }
}
