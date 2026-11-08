import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly authService = inject(AuthService);
  private readonly routerService = inject(Router);

  serverError = signal<string>('');
  isLoading = signal<boolean>(false);

  loginForm = new FormGroup({
    login: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  constructor() {
    this.loginForm.valueChanges.subscribe(() => {
      if (this.serverError()) {
        this.serverError.set('');
      }
    });
  }

  hasError(controlName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  getErrorMessage(controlName: string): string {
    const control = this.loginForm.get(controlName);
    if (!control || !control.errors || !(control.touched || control.dirty)) {
      return '';
    }

    if (control.hasError('required')) {
      if (controlName === 'login') return 'Email or username is required.';
      if (controlName === 'password') return 'Password is required.';
    }

    return '';
  }

  submitData() {
    this.serverError.set('');

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    const credentials = {
      email: this.loginForm.value.login,
      password: this.loginForm.value.password,
      ...this.loginForm.value,
    };

    this.authService.login(credentials as any).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.serverError.set('');
        console.log('تم تسجيل الدخول بنجاح ', res);
        this.authService.saveSession(res);
        this.routerService.navigate(['/feed']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.serverError.set(
          err.error?.message || err.error?.error || 'Invalid email or password.'
        );
        console.log('فشل تسجيل الدخول ', err);
      },
    });
  }
}
