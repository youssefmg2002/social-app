import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  BookmarksData,
  CreatePostPayload,
  FeedParams,
  PaginationParams,
  PostsData,
  SinglePostData,
} from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  private buildParams(params: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return httpParams;
  }

  /** GET /posts?page=1&limit=20 */
  getAllPosts(params: PaginationParams = { page: 1, limit: 20 }): Observable<ApiResponse<PostsData>> {
    return this.http.get<ApiResponse<PostsData>>(`${this.baseUrl}/posts`, {
      params: this.buildParams(params),
    });
  }

  /** GET /posts/feed?only=following&limit=20&page=1 */
  getHomeFeed(params: FeedParams = { page: 1, limit: 20 }): Observable<ApiResponse<PostsData>> {
    return this.http.get<ApiResponse<PostsData>>(`${this.baseUrl}/posts/feed`, {
      params: this.buildParams(params),
    });
  }

  /** GET /posts/:postId */
  getSinglePost(postId: string): Observable<ApiResponse<SinglePostData>> {
    return this.http.get<ApiResponse<SinglePostData>>(`${this.baseUrl}/posts/${postId}`);
  }

  /** GET /users/:userId/posts?page=1&limit=20 */
  getUserPosts(
    userId: string,
    params: PaginationParams = { page: 1, limit: 20 }
  ): Observable<ApiResponse<PostsData>> {
    return this.http.get<ApiResponse<PostsData>>(`${this.baseUrl}/users/${userId}/posts`, {
      params: this.buildParams(params),
    });
  }

  /** GET /users/bookmarks?page=1&limit=20 */
  getBookmarks(
    params: PaginationParams = { page: 1, limit: 20 }
  ): Observable<ApiResponse<BookmarksData>> {
    return this.http.get<ApiResponse<BookmarksData>>(`${this.baseUrl}/users/bookmarks`, {
      params: this.buildParams(params),
    });
  }

  /** POST /posts (form-data: body, image, privacy) */
  createPost(payload: CreatePostPayload): Observable<ApiResponse<SinglePostData>> {
    const formData = new FormData();
    if (payload.body?.trim()) {
      formData.append('body', payload.body.trim());
    }
    if (payload.image) {
      formData.append('image', payload.image);
    }
    if (payload.privacy) {
      formData.append('privacy', payload.privacy);
    }

    // Content-Type is intentionally not set: the browser adds the multipart boundary.
    return this.http.post<ApiResponse<SinglePostData>>(`${this.baseUrl}/posts`, formData);
  }

  /** PUT /posts/:postId/like */
  toggleLike(postId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}/like`, {});
  }

  /** PUT /posts/:postId/bookmark */
  toggleBookmark(postId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}/bookmark`, {});
  }

  /** PUT /posts/:postId (body, optional image) */
  updatePost(
    postId: string,
    payload: { body?: string; image?: File } | FormData
  ): Observable<ApiResponse<any>> {
    let bodyToSend: any;
    if (payload instanceof FormData) {
      bodyToSend = payload;
    } else {
      const formData = new FormData();
      if (payload.body !== undefined) {
        formData.append('body', payload.body);
      }
      if (payload.image) {
        formData.append('image', payload.image);
      }
      bodyToSend = formData;
    }

    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}`, bodyToSend);
  }

  /** DELETE /posts/:postId */
  deletePost(postId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}`);
  }

  /** POST /posts/:postId/share */
  sharePost(postId: string, payload?: { body?: string }): Observable<ApiResponse<any>> {
    const bodyToSend = payload?.body?.trim() ? { body: payload.body.trim() } : {};
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}/share`, bodyToSend);
  }

  /** PUT /posts/:postId (update privacy) */
  updatePrivacy(postId: string, privacy: string): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('privacy', privacy);
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}`, formData).pipe(
      catchError(() => this.http.patch<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}`, formData)),
      catchError(() => this.http.put<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}`, { privacy })),
      catchError(() => this.http.patch<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}`, { privacy }))
    );
  }
}
