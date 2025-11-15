import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from './api.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [FormsModule, RouterLink, CommonModule],
  styleUrls: ['./login.component.css'],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-brand">
            <div class="brand-dot"></div>
            <span class="brand-text">Secure Tasks</span>
          </div>
          <h1 class="auth-title">Welcome back</h1>
          <p class="auth-subtitle">Sign in to your account to continue</p>
        </div>

        <form class="auth-form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input
              class="form-input"
              id="email"
              type="email"
              placeholder="you@example.com"
              [(ngModel)]="email"
              name="email"
              required
              [class.error]="error() && !email"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input
              class="form-input"
              id="password"
              type="password"
              placeholder="••••••••"
              [(ngModel)]="password"
              name="password"
              required
              [class.error]="error() && !password"
            />
          </div>

          <div class="error-message" *ngIf="error()">
            {{ error() }}
          </div>

          <button
            class="auth-button"
            type="submit"
            [disabled]="loading()"
          >
            <span *ngIf="!loading()">Sign in</span>
            <span *ngIf="loading()">Signing in...</span>
          </button>
        </form>

        <div class="auth-footer">
          <p class="auth-footer-text">
            Don't have an account?
            <a routerLink="/signup" class="auth-link">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.error.set('Please fill in all fields');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.api.login(this.email, this.password).subscribe({
      next: (response) => {
        localStorage.setItem('jwt', response.access_token);
        this.router.navigateByUrl('/');
      },
      error: (err) => {
        this.loading.set(false);
        
        // Check if server is not running
        if (err.status === 0 || err.status === undefined) {
          this.error.set(
            'Cannot connect to API server. Please make sure the API server is running on port 3333.\n\nRun: nx serve api'
          );
        } else {
          this.error.set(
            err.error?.message || 'Invalid email or password. Please try again.'
          );
        }
      },
    });
  }
}
