import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  CommentReply,
  CommentsData,
  CreateCommentPayload,
  PaginationParams,
} from '../models/post.model';

@Injectable({
  providedIn: 'root',
})
export class CommentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  /** GET /posts/:postId/comments?page=1&limit=5 */
  getPostComments(
    postId: string,
    params: PaginationParams = { page: 1, limit: 5 }
  ): Observable<ApiResponse<CommentsData>> {
    let httpParams = new HttpParams();
    if (params.page) httpParams = httpParams.set('page', String(params.page));
    if (params.limit) httpParams = httpParams.set('limit', String(params.limit));

    return this.http.get<ApiResponse<CommentsData>>(
      `${this.baseUrl}/posts/${postId}/comments`,
      { params: httpParams }
    );
  }

  /** POST /posts/:postId/comments (form-data: content, image) */
  createComment(postId: string, payload: CreateCommentPayload): Observable<ApiResponse<any>> {
    const formData = new FormData();
    if (payload.content?.trim()) {
      formData.append('content', payload.content.trim());
    }
    if (payload.image) {
      formData.append('image', payload.image);
    }

    // Content-Type is intentionally not set: the browser adds the multipart boundary.
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}/posts/${postId}/comments`,
      formData
    );
  }

  /** PUT /posts/:postId/comments/:commentId or /comments/:commentId */
  updateComment(postId: string, commentId: string, content: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}/comments/${commentId}`, { content }).pipe(
      catchError(() => this.http.put<ApiResponse<any>>(`${this.baseUrl}/comments/${commentId}`, { content })),
      catchError(() => this.http.patch<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}/comments/${commentId}`, { content })),
      catchError(() => this.http.patch<ApiResponse<any>>(`${this.baseUrl}/comments/${commentId}`, { content }))
    );
  }

  /** DELETE /posts/:postId/comments/:commentId or /comments/:commentId */
  deleteComment(postId: string, commentId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}/comments/${commentId}`).pipe(
      catchError(() => this.http.delete<ApiResponse<any>>(`${this.baseUrl}/comments/${commentId}`))
    );
  }

  /** PUT /posts/:postId/comments/:commentId/like or /comments/:commentId/like */
  toggleCommentLike(postId: string, commentId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}/comments/${commentId}/like`, {}).pipe(
      catchError(() => this.http.put<ApiResponse<any>>(`${this.baseUrl}/comments/${commentId}/like`, {}))
    );
  }

  /** GET /posts/:postId/comments/:commentId/replies or /comments/:commentId/replies */
  getCommentReplies(postId: string, commentId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}/comments/${commentId}/replies`).pipe(
      catchError(() => this.http.get<ApiResponse<any>>(`${this.baseUrl}/comments/${commentId}/replies`))
    );
  }

  /** POST /posts/:postId/comments/:commentId/replies or /comments/:commentId/replies */
  createReply(postId: string, commentId: string, payload: { content?: string; image?: File | null }): Observable<ApiResponse<any>> {
    const formData = new FormData();
    if (payload.content?.trim()) {
      formData.append('content', payload.content.trim());
    }
    if (payload.image) {
      formData.append('image', payload.image);
    }

    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}/comments/${commentId}/replies`, formData).pipe(
      catchError(() => this.http.post<ApiResponse<any>>(`${this.baseUrl}/comments/${commentId}/replies`, formData))
    );
  }

  /** PUT /posts/:postId/comments/:commentId/replies/:replyId or /comments/:replyId */
  updateReply(postId: string, commentId: string, replyId: string, content: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}/comments/${commentId}/replies/${replyId}`, { content }).pipe(
      catchError(() => this.http.put<ApiResponse<any>>(`${this.baseUrl}/comments/${replyId}`, { content })),
      catchError(() => this.http.patch<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}/comments/${commentId}/replies/${replyId}`, { content })),
      catchError(() => this.http.patch<ApiResponse<any>>(`${this.baseUrl}/comments/${replyId}`, { content }))
    );
  }

  /** DELETE /posts/:postId/comments/:commentId/replies/:replyId or /comments/:replyId */
  deleteReply(postId: string, commentId: string, replyId: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}/comments/${commentId}/replies/${replyId}`).pipe(
      catchError(() => this.http.delete<ApiResponse<any>>(`${this.baseUrl}/comments/${replyId}`))
    );
  }

  /** PUT /posts/:postId/comments/:commentId/replies/:replyId/like or /comments/:replyId/like */
  toggleReplyLike(postId: string, commentId: string, replyId: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.baseUrl}/posts/${postId}/comments/${commentId}/replies/${replyId}/like`, {}).pipe(
      catchError(() => this.http.put<ApiResponse<any>>(`${this.baseUrl}/comments/${replyId}/like`, {}))
    );
  }
}
