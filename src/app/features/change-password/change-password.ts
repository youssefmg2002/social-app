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

@Component({
  selector: 'app-change-password',
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.html',
  styleUrl: './change-password.css',
})
export class ChangePassword {
  private readonly authService = inject(AuthService);

  readonly isLoading = signal(false);
  readonly serverError = signal('');
  readonly successMessage = signal('');

  readonly changePasswordForm = new FormGroup(
    {
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/
        ),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    {
      validators: this.passwordMatchValidator,
    }
  );

  constructor() {
    this.changePasswordForm.valueChanges.subscribe(() => {
      if (this.serverError()) {
        this.serverError.set('');
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (!confirmPassword) return null;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  hasError(controlName: string): boolean {
    const control = this.changePasswordForm.get(controlName);
    if (!control) return false;

    if (
      controlName === 'confirmPassword' &&
      this.changePasswordForm.hasError('mismatch') &&
      (control.touched || control.dirty)
    ) {
      return true;
    }

    return !!(control.invalid && (control.touched || control.dirty));
  }

  getErrorMessage(controlName: string): string {
    const control = this.changePasswordForm.get(controlName);
    if (!control || !(control.touched || control.dirty)) {
      return '';
    }

    if (control.hasError('required')) {
      switch (controlName) {
        case 'currentPassword':
          return 'Current password is required.';
        case 'newPassword':
          return 'New password is required.';
        case 'confirmPassword':
          return 'Please confirm your new password.';
        default:
          return 'This field is required.';
      }
    }

    if (controlName === 'newPassword') {
      if (control.hasError('pattern')) {
        return 'Password must contain uppercase, lowercase, number, and special character (min 8 chars).';
      }
    }

    if (
      controlName === 'confirmPassword' &&
      this.changePasswordForm.hasError('mismatch')
    ) {
      return 'Passwords do not match.';
    }

    return '';
  }

  submit(): void {
    this.serverError.set('');
    this.successMessage.set('');

    if (this.changePasswordForm.invalid) {
      this.changePasswordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.changePasswordForm.value;
    if (!currentPassword || !newPassword) return;

    this.isLoading.set(true);

    this.authService
      .changePassword({
        password: currentPassword,
        newPassword: newPassword,
      })
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          const newToken = res?.token || res?.data?.token;
          if (newToken) {
            const cleanToken = newToken.replace(/^Bearer\s+/i, '');
            localStorage.setItem('userToken', cleanToken);
          }
          this.successMessage.set('Password changed successfully.');
          this.changePasswordForm.reset();
        },
        error: (err) => {
          this.isLoading.set(false);
          const msg =
            err?.error?.message ||
            err?.error?.error ||
            'Failed to change password. Please verify your current password.';
          this.serverError.set(msg);
        },
      });
  }
}
