import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from './api.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-signup',
  imports: [FormsModule, RouterLink, CommonModule],
  styleUrls: ['./signup.component.css'],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-brand">
            <div class="brand-dot"></div>
            <span class="brand-text">Secure Tasks</span>
          </div>
          <h1 class="auth-title">Create your account</h1>
          <p class="auth-subtitle">Get started with your workspace today</p>
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
              minlength="6"
            />
            <p class="form-hint">
              Must be at least 6 characters long
            </p>
          </div>

          <div class="form-group">
            <label class="form-label" for="orgName">Organization Name</label>
            <input
              class="form-input"
              id="orgName"
              type="text"
              placeholder="My Company"
              [(ngModel)]="orgName"
              name="orgName"
              required
              [class.error]="error() && !orgName"
            />
            <p class="form-hint">
              This will be your workspace name
            </p>
          </div>

          <div class="error-message" *ngIf="error()">
            {{ error() }}
          </div>

          <div class="success-message" *ngIf="success()">
            {{ success() }}
          </div>

          <button
            class="auth-button"
            type="submit"
            [disabled]="loading()"
          >
            <span *ngIf="!loading()">Create account</span>
            <span *ngIf="loading()">Creating account...</span>
          </button>
        </form>

        <div class="auth-footer">
          <p class="auth-footer-text">
            Already have an account?
            <a routerLink="/login" class="auth-link">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class SignupComponent {
  email = '';
  password = '';
  orgName = '';
  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  onSubmit() {
    if (!this.email || !this.password || !this.orgName) {
      this.error.set('Please fill in all fields');
      return;
    }

    if (this.password.length < 6) {
      this.error.set('Password must be at least 6 characters long');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    this.api
      .register({
        email: this.email,
        password: this.password,
        orgName: this.orgName,
      })
      .subscribe({
        next: () => {
          this.success.set('Account created successfully! Redirecting to login...');
          setTimeout(() => {
            this.router.navigateByUrl('/login');
          }, 1500);
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
              err.error?.message ||
                'Failed to create account. Please try again.'
            );
          }
        },
      });
  }
}
