import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import Swal from "sweetalert2";

export interface LoginResponse {
  accessToken: string;
  expiryTime: string;
}

export interface User {
  username: string;
  email: string;
  password: string;
  role: "Admin"; // ALL ADMIN FOR NOW
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private router: Router = new Router;
  url = "http://localhost:5122/api/auth/"
  token = ""

  // to share token to other components for sending requests from their services
  getToken() {
    return this.token.slice(16, 397)
    // console.log(this.token.slice(16, 397))
  }

  signIn(email: string, password: string) {
    fetch(`${this.url}login`, {
      method: "POST",
      body: JSON.stringify({
        Email: email,
        Password: password
      }),
      headers: { "Content-Type" : "application/json" }
    })
    .then((response) => {
      if (response.status == 200) {
        response.text().then((text) => {
          this.token = text;
          this.navigate("dashboard");
        })
      } else if (response.status == 401) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Invalid login details",
        });
      }
    })
  }

  signUp(username: string,
    email: string,
    password: string,
    role: string)
  {
    fetch(`${this.url}register`, {
      method: "POST",
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        role: role
      }),
      headers:{ "Content-Type" : "application/json" }
    })
  }

  navigate(path: string) {
    this.router.navigate([`/${path}`]);
  }
}
