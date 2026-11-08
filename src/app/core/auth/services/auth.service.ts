import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface RegisterPayload {
  name: string;
  username?: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  password: string;
  rePassword: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  password: string;
  newPassword: string;
}

export interface User {
  _id: string;
  id?: string;
  name: string;
  username: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  photo: string;
  cover?: string;
  bookmarks?: string[];
  followers?: any[];
  following?: any[];
  createdAt?: string;
  passwordChangedAt?: string;
  followersCount?: number;
  followingCount?: number;
  bookmarksCount?: number;
}

export interface AuthData {
  token: string;
  tokenType?: string;
  expiresIn?: string;
  user?: User;
}

export interface AuthResponse {
  success?: boolean;
  message: string;
  data?: AuthData;
  token?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  readonly baseUrl = environment.baseUrl;
  readonly currentUser = signal<User | null>(this.getStoredUser());

  register(data: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/users/signup`, data);
  }

  login(data: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/users/signin`, data);
  }

  changePassword(data: ChangePasswordPayload): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/users/change-password`, data);
  }

  /** PUT /users/upload-photo (form-data: photo) */
  uploadProfilePhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    return this.http.put<any>(`${this.baseUrl}/users/upload-photo`, formData);
  }

  /** PUT or PATCH /users/upload-cover (form-data: cover) */
  uploadCoverPhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('cover', file);
    return this.http.put<any>(`${this.baseUrl}/users/upload-cover`, formData).pipe(
      catchError(() => this.http.patch<any>(`${this.baseUrl}/users/upload-cover`, formData))
    );
  }

  /** DELETE /users/cover */
  deleteCoverPhoto(): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/users/cover`);
  }

  /** GET /users/profile-data */
  getProfileData(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/profile-data`).pipe(
      catchError(() => this.http.get<any>(`${this.baseUrl}/users/profile`)),
      catchError(() => this.http.get<any>(`${this.baseUrl}/users/me`))
    );
  }

  /** Helper to partially update stored user (photo, cover, name, etc.) */
  updateUserInStorage(partial: Partial<User>): User {
    const current = this.getCurrentUser() || ({} as User);
    const updated: User = { ...current, ...partial };
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(updated));
      localStorage.setItem('userData', JSON.stringify(updated));
    }
    this.currentUser.set(updated);
    return updated;
  }

  /** Saves the token and the user data in localStorage and updates currentUser signal. */
  saveSession(res: AuthResponse): void {
    const token = res.data?.token || res.token;
    if (token) {
      const cleanToken = token.replace(/^Bearer\s+/i, '');
      localStorage.setItem('userToken', cleanToken);
    }
    const user = res.data?.user || res.user;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userData', JSON.stringify(user));
      this.currentUser.set(user);
    }
  }

  /** Private helper to read user from localStorage on init. */
  private getStoredUser(): User | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem('user') || localStorage.getItem('userData');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  /** Logged-in user's basic data (saved at login/register). */
  getCurrentUser(): User | null {
    return this.currentUser() ?? this.getStoredUser();
  }

  /** Alias for getCurrentUser() */
  getUser(): User | null {
    return this.getCurrentUser();
  }

  /** Logged-in user's id: from saved user data, or decoded from the JWT payload ({ user: id }). */
  getUserId(): string | null {
    const user = this.getCurrentUser();
    if (user?._id) return user._id;
    if (user?.id) return user.id;

    if (typeof localStorage === 'undefined') return null;
    const token = localStorage.getItem('userToken')?.replace(/^Bearer\s+/i, '');
    if (!token) return null;
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(atob(payload)).user ?? null;
    } catch {
      return null;
    }
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('user');
      localStorage.clear();
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}
