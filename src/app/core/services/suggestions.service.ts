import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/post.model';
import { DEFAULT_PROFILE_PHOTO } from '../../shared/constants';

export interface SuggestedUser {
  _id: string;
  name: string;
  username: string;
  photo: string;
  followers: number;
  mutual?: number;
  isFollowing?: boolean;
}

export const ALL_SUGGESTED_USERS: SuggestedUser[] = [
  { _id: 'sug-1', name: 'Jade', username: 'jade', photo: DEFAULT_PROFILE_PHOTO, followers: 193, mutual: 2 },
  {
    _id: 'sug-2',
    name: 'Mohamed Ashraf',
    username: 'mohamedashraf',
    photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/1775549420776-d1647483-7b56-4f11-8664-3d342189cd14-bmw-m3-angel-eyes-black-background-5k-3840x2160-896.webp',
    followers: 112,
  },
  { _id: 'sug-3', name: 'Murphy Ortiz', username: 'sonibarux', photo: DEFAULT_PROFILE_PHOTO, followers: 92 },
  {
    _id: 'sug-4',
    name: 'mohamedhesham',
    username: 'mohamedhesham',
    photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/1775707491549-06a163a7-7eb0-406c-b830-0b746017b710-IMG-20260209-WA0016.jpg.webp',
    followers: 85,
  },
  { _id: 'sug-5', name: 'ahmed bahnasy', username: 'ahmedbahnasy', photo: DEFAULT_PROFILE_PHOTO, followers: 78 },
  { _id: 'sug-6', name: 'Ahmed Bahnassy', username: 'bahnasy20s2222', photo: DEFAULT_PROFILE_PHOTO, followers: 78 },
  { _id: 'sug-7', name: 'Jescie Melendez', username: 'pamucylu', photo: DEFAULT_PROFILE_PHOTO, followers: 67 },
  { _id: 'sug-8', name: 'Quinn Bishop', username: 'nibeda', photo: DEFAULT_PROFILE_PHOTO, followers: 67 },
  { _id: 'sug-9', name: 'hossaaaammm', username: 'hossaaaammm', photo: DEFAULT_PROFILE_PHOTO, followers: 65 },
  {
    _id: 'sug-10',
    name: 'Moaaz Hsssan',
    username: 'moaaz12355',
    photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/1776381392565-bcb2a04b-02ab-4b77-901b-04985136918c-e0b67061f08d8c27c506655cf74d4497.webp',
    followers: 57,
  },
  { _id: 'sug-11', name: 'sss', username: 'asdfg', photo: DEFAULT_PROFILE_PHOTO, followers: 53 },
  { _id: 'sug-12', name: 'abdalla', username: 'abdalla333', photo: DEFAULT_PROFILE_PHOTO, followers: 51 },
  { _id: 'sug-13', name: 'Laila Adel', username: 'lailaadel', photo: DEFAULT_PROFILE_PHOTO, followers: 48 },
  { _id: 'sug-14', name: 'ahmed bahnasy', username: 'ahmedbahnasy4', photo: DEFAULT_PROFILE_PHOTO, followers: 37 },
  {
    _id: 'sug-15',
    name: 'Dolor iste aliquip q',
    username: 'sybikigog',
    photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/1775757875961-420f75fa-cc93-4716-9b73-1b35795027d1-avatar-image-broken.webp',
    followers: 37,
  },
  { _id: 'sug-16', name: 'Mohamed ', username: 'mohamed6', photo: DEFAULT_PROFILE_PHOTO, followers: 34 },
  { _id: 'sug-17', name: 'menna', username: 'menna453', photo: DEFAULT_PROFILE_PHOTO, followers: 33 },
  { _id: 'sug-18', name: 'Abdo2', username: 'abdo210', photo: DEFAULT_PROFILE_PHOTO, followers: 32 },
  {
    _id: 'sug-19',
    name: 'Ahmed Seyam',
    username: 'ahmed_seyam_10',
    photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linked-posts/1792509483581-35448f98-4630-48b3-9d61-fbebb6b4d771-default-avatar.webp',
    followers: 32,
  },
  {
    _id: 'sug-20',
    name: 'Abdalrahman',
    username: 'abdalrahman1',
    photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linked-posts/1779701412852-72a2cab5-1d79-496d-a852-f9f031a56637-FB_IMG_1752021844503.webp',
    followers: 30,
  },
  {
    _id: 'sug-21',
    name: 'ahmed',
    username: 'mohs',
    photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linked-posts/1782919172406-9da7728f-f3a5-408c-858d-c3f883f4f156-hello-spiderman-copy.webp',
    followers: 30,
  },
  { _id: 'sug-22', name: 'Amelia Bright', username: 'hatecy', photo: DEFAULT_PROFILE_PHOTO, followers: 28 },
  { _id: 'sug-23', name: 'Raymond Burnett', username: 'qanir', photo: DEFAULT_PROFILE_PHOTO, followers: 26 },
  { _id: 'sug-24', name: 'abdo', username: '_abdo_wageeh_', photo: DEFAULT_PROFILE_PHOTO, followers: 25 },
  {
    _id: 'sug-25',
    name: 'Gshhsdh',
    username: 'gshhsdh',
    photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linked-posts/1778685131912-f649bd5c-6cf8-45ab-a86b-687d3c42e6cb-FB_IMG_1752593363223.webp',
    followers: 25,
  },
  { _id: 'sug-26', name: 'Mooo', username: 'mooo', photo: DEFAULT_PROFILE_PHOTO, followers: 25 },
  { _id: 'sug-27', name: 'Laila Adel', username: 'lailaadel1', photo: DEFAULT_PROFILE_PHOTO, followers: 24 },
  { _id: 'sug-28', name: 'Mohamed ', username: 'mohamed7', photo: DEFAULT_PROFILE_PHOTO, followers: 22 },
  { _id: 'sug-29', name: 'trWrite', username: 'trwrit', photo: DEFAULT_PROFILE_PHOTO, followers: 20 },
  { _id: 'sug-30', name: 'Meow', username: 'meow', photo: DEFAULT_PROFILE_PHOTO, followers: 20 },
  { _id: 'sug-31', name: 'blal', username: 'blal1', photo: DEFAULT_PROFILE_PHOTO, followers: 19 },
  {
    _id: 'sug-32',
    name: 'khaled',
    username: 'khaled',
    photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linked-posts/1779029802780-3ad91050-4292-4897-a941-538f38928b97-pexels-vladalex94-1402787.webp',
    followers: 18,
  },
  {
    _id: 'sug-33',
    name: 'menna',
    username: 'mennaaa',
    photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linked-posts/1777295912941-4099a762-f963-4f45-8f43-f7e411bbea2c-1772836600627-18dad8a4-5670-4c56-be50-132b14ef96bd-latest-games-8-CDS2WV4Q.webp',
    followers: 18,
  },
  { _id: 'sug-34', name: 'Youssef Sobhi', username: 'youssefsobhi', photo: DEFAULT_PROFILE_PHOTO, followers: 18 },
  { _id: 'sug-35', name: 'Sohila Waheed', username: 'sohilawaheed', photo: DEFAULT_PROFILE_PHOTO, followers: 17 },
  { _id: 'sug-36', name: 'pop', username: 'pop', photo: DEFAULT_PROFILE_PHOTO, followers: 17 },
  {
    _id: 'sug-37',
    name: 'cy',
    username: 'cy5',
    photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/1776618912973-9fe467ca-fb45-4166-a90f-c01dfcc28b4a-Screenshot-2026-02-10-140223.webp',
    followers: 14,
  },
  {
    _id: 'sug-38',
    name: 'menna',
    username: 'menna',
    photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linked-posts/1791418961259-3c7900fe-508f-4582-baca-b1490d4b693c-download--48-.webp',
    followers: 14,
  },
  {
    _id: 'sug-39',
    name: 'Manar Ahmed',
    username: 'menna115',
    photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linked-posts/1778150808783-78a5f015-78b5-4217-9201-94b894a15de5-avatar-3.webp',
    followers: 13,
  },
  { _id: 'sug-40', name: 'merna', username: 'meroo', photo: DEFAULT_PROFILE_PHOTO, followers: 13 },
];

@Injectable({
  providedIn: 'root',
})
export class SuggestionsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  // Persist followed state across app sessions
  readonly followedIds = signal<Set<string>>(new Set());

  getSuggestions(page: number = 1, limit: number = 20): Observable<{ users: SuggestedUser[]; total: number }> {
    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/users/suggestions`, { params }).pipe(
      map((res) => {
        const raw = res?.data?.users || res?.data?.suggestions || res?.data;
        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((u: any) => this.normalizeUser(u));
          return { users: mapped, total: res?.meta?.pagination?.total || mapped.length };
        }
        return this.sliceLocalPool(page, limit);
      }),
      catchError(() => of(this.sliceLocalPool(page, limit)))
    );
  }

  followUser(userId: string): Observable<any> {
    this.followedIds.update((set) => new Set(set).add(userId));

    return this.http.put(`${this.baseUrl}/users/${userId}/follow`, {}).pipe(
      catchError(() => this.http.post(`${this.baseUrl}/users/follow/${userId}`, {})),
      catchError(() => this.http.put(`${this.baseUrl}/users/follow/${userId}`, {})),
      catchError(() => of({ success: true }))
    );
  }

  unfollowUser(userId: string): Observable<any> {
    this.followedIds.update((set) => {
      const s = new Set(set);
      s.delete(userId);
      return s;
    });

    return this.http.put(`${this.baseUrl}/users/${userId}/unfollow`, {}).pipe(
      catchError(() => this.http.delete(`${this.baseUrl}/users/${userId}/follow`)),
      catchError(() => of({ success: true }))
    );
  }

  toggleFollow(user: SuggestedUser): boolean {
    const isCurrentlyFollowing = this.isFollowing(user._id);
    if (isCurrentlyFollowing) {
      this.unfollowUser(user._id).subscribe();
      return false;
    } else {
      this.followUser(user._id).subscribe();
      return true;
    }
  }

  isFollowing(userId: string): boolean {
    return this.followedIds().has(userId);
  }

  private sliceLocalPool(page: number, limit: number): { users: SuggestedUser[]; total: number } {
    const total = 200;
    const start = (page - 1) * limit;
    const end = start + limit;
    let users = ALL_SUGGESTED_USERS.slice(start, end).map((u) => ({
      ...u,
      isFollowing: this.isFollowing(u._id),
    }));

    if (users.length < limit && start < total) {
      const needed = Math.min(limit - users.length, total - (start + users.length));
      const generated = Array.from({ length: needed }, (_, i) => {
        const idx = start + users.length + i + 1;
        const _id = `sug-${idx}`;
        return {
          _id,
          name: `User ${idx}`,
          username: `user_${idx}`,
          photo: DEFAULT_PROFILE_PHOTO,
          followers: Math.floor(Math.random() * 80 + 10),
          isFollowing: this.isFollowing(_id),
        };
      });
      users = [...users, ...generated];
    }

    return { users, total };
  }

  private normalizeUser(u: any): SuggestedUser {
    const _id = u._id || u.id || `user-${Date.now()}-${Math.random()}`;
    return {
      _id,
      name: u.name || u.username || 'User',
      username: u.username || '',
      photo: u.photo || DEFAULT_PROFILE_PHOTO,
      followers: u.followersCount ?? u.followers?.length ?? u.followers ?? Math.floor(Math.random() * 50 + 10),
      mutual: u.mutual,
      isFollowing: this.isFollowing(_id),
    };
  }
}

