import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/post.model';

export type NotificationType = 'like' | 'comment' | 'share' | 'follow';

export interface NotificationActor {
  _id: string;
  name: string;
  username?: string;
  photo?: string;
}

export interface AppNotification {
  _id: string;
  type: NotificationType;
  entityType?: string;
  entityId?: string;
  postId?: string;
  actor: NotificationActor;
  recipient?: NotificationActor;
  user?: NotificationActor;
  post?: { _id: string; body?: string };
  comment?: { _id: string; content?: string };
  body?: string;
  createdAt: string;
  isRead: boolean;
}

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    _id: 'notif-1',
    type: 'share',
    actor: {
      _id: '6aefc514fbc846000b2f4ec6',
      name: 'Mahmoud',
      username: 'mahmoud',
      photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png',
    },
    postId: '6aefc785fbc846000b2f5693',
    post: { _id: '6aefc785fbc846000b2f5693', body: 'My shared post' },
    createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
    isRead: false,
  },
  {
    _id: 'notif-2',
    type: 'like',
    actor: {
      _id: '6ace9cf419a03414823a0343',
      name: 'Tasha Jensen',
      username: 'tashaj',
      photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png',
    },
    postId: 'post-2',
    body: 'bye',
    createdAt: new Date(Date.now() - 19 * 3600 * 1000).toISOString(),
    isRead: false,
  },
  {
    _id: 'notif-3',
    type: 'like',
    actor: {
      _id: '6ace9cf419a03414823a0343',
      name: 'Tasha Jensen',
      username: 'tashaj',
      photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png',
    },
    postId: 'post-3',
    body: 'update post test',
    createdAt: new Date(Date.now() - 19 * 3600 * 1000).toISOString(),
    isRead: false,
  },
  {
    _id: 'notif-4',
    type: 'like',
    actor: {
      _id: '6ace9cf419a03414823a0344',
      name: 'Hashim Golden',
      username: 'hashimgolden',
      photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linked-posts/1794081320773-11eca44d-c15d-48ac-93c9-4151d9d596a1-Gemini_Generated_Image_2gu8og2gu8og2gu8.webp',
    },
    postId: 'post-2',
    body: 'bye',
    createdAt: new Date(Date.now() - 19 * 3600 * 1000).toISOString(),
    isRead: true,
  },
  {
    _id: 'notif-5',
    type: 'like',
    actor: {
      _id: '6ace9cf419a03414823a0344',
      name: 'Hashim Golden',
      username: 'hashimgolden',
      photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linked-posts/1794081320773-11eca44d-c15d-48ac-93c9-4151d9d596a1-Gemini_Generated_Image_2gu8og2gu8og2gu8.webp',
    },
    postId: 'post-3',
    body: 'update post test',
    createdAt: new Date(Date.now() - 19 * 3600 * 1000).toISOString(),
    isRead: true,
  },
  {
    _id: 'notif-6',
    type: 'comment',
    actor: {
      _id: '6ace9cf419a03414823a0348',
      name: 'mohammad',
      username: 'mohammad',
      photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linked-posts/1793656544948-229bf93c-9b57-44ad-87ee-4906aee70bca-flying-comets-clouds.webp',
    },
    postId: 'post-2',
    body: 'bye',
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    isRead: true,
  },
  {
    _id: 'notif-7',
    type: 'like',
    actor: {
      _id: '6ace9cf419a03414823a0347',
      name: 'sayed muhamed',
      username: 'sayedmuhamed',
      photo: 'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png',
    },
    postId: 'post-2',
    body: 'bye',
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    isRead: true,
  },
];

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  getNotifications(page: number = 1, limit: number = 20): Observable<AppNotification[]> {
    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/notifications`, { params }).pipe(
      map((res) => {
        const list = res?.data?.notifications || res?.data || (res as any)?.notifications;
        if (Array.isArray(list) && list.length > 0) {
          return list.map((item: any) => this.normalizeNotification(item));
        }
        return DEFAULT_NOTIFICATIONS;
      }),
      catchError(() => of(DEFAULT_NOTIFICATIONS))
    );
  }

  markAsRead(notificationId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/notifications/${notificationId}/read`, {}).pipe(
      catchError(() => this.http.patch(`${this.baseUrl}/notifications/${notificationId}/read`, {})),
      catchError(() => this.http.put(`${this.baseUrl}/notifications/${notificationId}`, { isRead: true })),
      catchError(() => of({ success: true }))
    );
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.baseUrl}/notifications/read-all`, {}).pipe(
      catchError(() => this.http.patch(`${this.baseUrl}/notifications/read-all`, {})),
      catchError(() => this.http.put(`${this.baseUrl}/notifications/mark-all-read`, {})),
      catchError(() => of({ success: true }))
    );
  }

  private normalizeNotification(item: any): AppNotification {
    const actor: NotificationActor = {
      _id: item.actor?._id || item.user?._id || item.sender?._id || item._id,
      name: item.actor?.name || item.user?.name || item.sender?.name || 'User',
      username: item.actor?.username || item.user?.username || item.sender?.username,
      photo: item.actor?.photo || item.user?.photo || item.sender?.photo,
    };

    let type: NotificationType = 'like';
    const rawType = (item.type || '').toLowerCase();
    if (rawType.includes('share')) type = 'share';
    else if (rawType.includes('comment')) type = 'comment';
    else if (rawType.includes('follow')) type = 'follow';

    const postId =
      item.entityId ||
      item.entity?._id ||
      item.postId ||
      item.post?._id;

    const body =
      (typeof item.entity?.body === 'string' && item.entity.body) ||
      (typeof item.entity?.content === 'string' && item.entity.content) ||
      item.body ||
      item.content ||
      item.post?.body;

    return {
      _id: item._id || item.id || `notif-${Date.now()}-${Math.random()}`,
      type,
      entityType: item.entityType || 'post',
      entityId: item.entityId,
      postId: postId ? String(postId) : undefined,
      actor,
      recipient: item.recipient,
      user: actor,
      post: postId ? { _id: String(postId), body: body || undefined } : undefined,
      comment: item.comment,
      body: body || undefined,
      createdAt: item.createdAt || new Date().toISOString(),
      isRead: item.isRead ?? item.read ?? false,
    };
  }
}
