import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../core/auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private readonly authService = inject(AuthService);
  private readonly routerService = inject(Router);

  serverError = signal<string>('');
  isLoading = signal<boolean>(false);

  registerForm = new FormGroup(
    {
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30),
      ]),
      username: new FormControl('', [
        Validators.minLength(3),
        Validators.maxLength(30),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      dateOfBirth: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.pattern(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{1,10}$/
        ),
      ]),
      rePassword: new FormControl('', [Validators.required]),
    },
    {
      validators: this.passwordMatchValidator,
      updateOn: 'submit',
    }
  );

  constructor() {
    this.registerForm.valueChanges.subscribe(() => {
      if (this.serverError()) {
        this.serverError.set('');
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const rePassword = control.get('rePassword')?.value;
    if (!rePassword) return null;
    return password === rePassword ? null : { missMatch: true };
  }

  hasError(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    if (!control) return false;

    if (
      controlName === 'rePassword' &&
      this.registerForm.hasError('missMatch') &&
      (control.touched || control.dirty)
    ) {
      return true;
    }

    return !!(control.invalid && (control.touched || control.dirty));
  }

  getErrorMessage(controlName: string): string {
    const control = this.registerForm.get(controlName);
    if (!control || !(control.touched || control.dirty)) {
      return '';
    }

    if (control.hasError('required')) {
      switch (controlName) {
        case 'name':
          return 'Full name is required.';
        case 'email':
          return 'Email is required.';
        case 'gender':
          return 'Gender is required.';
        case 'dateOfBirth':
          return 'Date of birth is required.';
        case 'password':
          return 'Password is required.';
        case 'rePassword':
          return 'Please confirm your password.';
        default:
          return 'This field is required.';
      }
    }

    if (control.hasError('minlength')) {
      const minLength = control.getError('minlength')?.requiredLength;
      return `${controlName === 'name' ? 'Full name' : controlName === 'username' ? 'Username' : controlName} must be at least ${minLength} characters.`;
    }

    if (control.hasError('maxlength')) {
      const maxLength = control.getError('maxlength')?.requiredLength || 30;
      return `${controlName === 'name' ? 'Full name' : controlName === 'username' ? 'Username' : controlName} cannot be more than ${maxLength} characters.`;
    }

    if (control.hasError('email')) {
      return 'Please enter a valid email address.';
    }

    if (control.hasError('pattern')) {
      return 'Password must contain uppercase, lowercase, number, and special character.';
    }

    if (controlName === 'rePassword' && this.registerForm.hasError('missMatch')) {
      return 'Passwords do not match.';
    }

    return '';
  }

  submitData() {
    this.serverError.set('');

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.authService.register(this.registerForm.value as any).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.serverError.set('');
        console.log('Registration success', res);
        this.authService.saveSession(res);
        this.routerService.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.serverError.set(
          err.error?.message || err.error?.error || 'user already exists.'
        );
        console.log('Registration error', err);
        console.log(this.serverError());
      },
    });
  }
}