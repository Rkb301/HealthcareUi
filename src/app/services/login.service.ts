import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

export interface LoginResponse {
  accessToken: string;
  expiryTime: string;
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private url = 'http://localhost:5122/api/auth/';
  private token = '';

  // Retrieve stored token
  getToken(): string {
    return this.token;
  }

  // Sign In
  async signIn(email: string, password: string): Promise<void> {
    const response = await fetch(`${this.url}login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Email: email, Password: password })
    });

    if (response.ok) {
      this.token = await response.text();
    } else if (response.status === 401) {
      throw new Error('Invalid login details');
    } else {
      throw new Error('Login request failed');
    }
  }

  // Sign Up
  async signUp(
    username: string,
    email:    string,
    password: string,
    role:     string
  ): Promise<void> {
    if (!email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }

    const response = await fetch(`${this.url}register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Registration failed');
    }
  }
}
