import { Component, computed, ElementRef, HostListener, inject, input, OnDestroy, OnInit, output, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService, User } from '../../../core/auth/services/auth.service';
import { CommentsService } from '../../../core/services/comments.service';
import { ApiResponse, CommentReply, PostComment } from '../../../core/models/post.model';
import { DEFAULT_PROFILE_PHOTO } from '../../constants';
import { EmojiPicker } from '../emoji-picker/emoji-picker';
import { insertAtCursor } from '../../utils/insert-at-cursor';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';

type CommentsSort = 'relevant' | 'newest';

@Component({
  selector: 'app-post-comments',
  imports: [RouterLink, EmojiPicker, TimeAgoPipe],
  templateUrl: './post-comments.html',
  host: {
    class: 'block',
  },
})
export class PostComments implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly commentsService = inject(CommentsService);
  private readonly textarea = viewChild<ElementRef<HTMLTextAreaElement>>('commentInput');
  private readonly replyTextarea = viewChild<ElementRef<HTMLTextAreaElement>>('replyInput');

  postId = input.required<string>();
  totalCount = input<number>(0);

  /** Emitted after a comment is created successfully. */
  commentAdded = output<PostComment>();
  /** Emitted after a comment is deleted successfully. */
  commentDeleted = output<string>();

  readonly limit = 5;
  readonly defaultPhoto = DEFAULT_PROFILE_PHOTO;
  get user(): User | null {
    return this.authService.getCurrentUser();
  }

  comments = signal<PostComment[]>([]);
  page = signal(1);
  hasMore = signal(false);
  isLoading = signal(false);
  isLoadingMore = signal(false);
  errorMessage = signal('');
  sort = signal<CommentsSort>('relevant');

  content = signal('');
  image = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  isSubmitting = signal(false);
  submitError = signal('');
  showEmoji = signal(false);

  // --- Replies & Likes state ---
  expandedReplies = signal<Set<string>>(new Set());
  replyingToCommentId = signal<string | null>(null);
  repliesMap = signal<Record<string, CommentReply[]>>({});
  loadingReplies = signal<Set<string>>(new Set());

  commentLikesMap = signal<Record<string, { isLiked: boolean; count: number }>>({});
  replyLikesMap = signal<Record<string, { isLiked: boolean; count: number }>>({});

  replyContent = signal('');
  replyImage = signal<File | null>(null);
  replyImagePreview = signal<string | null>(null);
  showReplyEmoji = signal(false);
  isSubmittingReply = signal(false);

  // --- Options menu & Edit state ---
  activeMenuCommentId = signal<string | null>(null);
  activeMenuReplyId = signal<string | null>(null);

  editingCommentId = signal<string | null>(null);
  editingCommentText = signal<string>('');
  isSavingComment = signal<boolean>(false);

  editingReplyId = signal<string | null>(null);
  editingReplyText = signal<string>('');
  isSavingReply = signal<boolean>(false);

  readonly sortedComments = computed(() => {
    const list = [...this.comments()];
    if (this.sort() === 'newest') {
      return list.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
    }
    return list.sort((a, b) => this.getCommentLikesCount(b) - this.getCommentLikesCount(a));
  });

  readonly canSubmit = computed(() => (!!this.content().trim() || !!this.image()) && !this.isSubmitting());
  readonly canSubmitReply = computed(() => (!!this.replyContent().trim() || !!this.replyImage()) && !this.isSubmittingReply());

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeMenus();
  }

  ngOnInit(): void {
    this.loadComments(1);
  }

  ngOnDestroy(): void {
    this.clearPreview();
    this.clearReplyPreview();
  }

  closeMenus(): void {
    this.activeMenuCommentId.set(null);
    this.activeMenuReplyId.set(null);
  }

  toggleCommentMenu(commentId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activeMenuReplyId.set(null);
    this.activeMenuCommentId.update((current) => (current === commentId ? null : commentId));
  }

  toggleReplyMenu(replyId: string, event: MouseEvent): void {
    event.stopPropagation();
    this.activeMenuCommentId.set(null);
    this.activeMenuReplyId.update((current) => (current === replyId ? null : replyId));
  }

  isCommentOwner(comment: PostComment): boolean {
    const currentUserId = this.user?._id;
    const currentUsername = this.user?.username;
    const creator = this.author(comment);
    if (!currentUserId && !currentUsername) return true;
    if (creator._id && currentUserId) {
      return creator._id === currentUserId;
    }
    if (creator.username && currentUsername) {
      return creator.username === currentUsername;
    }
    return true;
  }

  isReplyOwner(reply: CommentReply): boolean {
    const currentUserId = this.user?._id;
    const currentUsername = this.user?.username;
    const creator = this.replyAuthor(reply);
    if (!currentUserId && !currentUsername) return true;
    if (creator._id && currentUserId) {
      return creator._id === currentUserId;
    }
    if (creator.username && currentUsername) {
      return creator.username === currentUsername;
    }
    return true;
  }

  // --- Edit & Delete Comment ---

  startEditComment(comment: PostComment): void {
    this.activeMenuCommentId.set(null);
    this.editingCommentId.set(comment._id);
    this.editingCommentText.set(comment.content || comment.body || '');
  }

  cancelEditComment(): void {
    this.editingCommentId.set(null);
    this.editingCommentText.set('');
  }

  onEditingCommentInput(event: Event): void {
    this.editingCommentText.set((event.target as HTMLInputElement).value);
  }

  saveEditComment(comment: PostComment): void {
    const newContent = this.editingCommentText().trim();
    if (!newContent) return;

    comment.content = newContent;
    this.editingCommentId.set(null);
    this.isSavingComment.set(true);

    this.commentsService.updateComment(this.postId(), comment._id, newContent).subscribe({
      next: () => {
        this.isSavingComment.set(false);
      },
      error: () => {
        this.isSavingComment.set(false);
      },
    });
  }

  deleteComment(comment: PostComment): void {
    this.activeMenuCommentId.set(null);
    const commentId = comment._id;

    // Optimistic removal
    this.comments.update((list) => list.filter((c) => c._id !== commentId));
    this.commentDeleted.emit(commentId);

    this.commentsService.deleteComment(this.postId(), commentId).subscribe({
      next: () => {},
      error: () => {},
    });
  }

  // --- Edit & Delete Reply ---

  startEditReply(reply: CommentReply): void {
    this.activeMenuReplyId.set(null);
    this.editingReplyId.set(reply._id);
    this.editingReplyText.set(reply.content || reply.body || '');
  }

  cancelEditReply(): void {
    this.editingReplyId.set(null);
    this.editingReplyText.set('');
  }

  onEditingReplyInput(event: Event): void {
    this.editingReplyText.set((event.target as HTMLInputElement).value);
  }

  saveEditReply(comment: PostComment, reply: CommentReply): void {
    const newContent = this.editingReplyText().trim();
    if (!newContent) return;

    reply.content = newContent;
    this.editingReplyId.set(null);
    this.isSavingReply.set(true);

    this.commentsService.updateReply(this.postId(), comment._id, reply._id, newContent).subscribe({
      next: () => {
        this.isSavingReply.set(false);
      },
      error: () => {
        this.isSavingReply.set(false);
      },
    });
  }

  deleteReply(comment: PostComment, reply: CommentReply): void {
    this.activeMenuReplyId.set(null);
    const commentId = comment._id;
    const replyId = reply._id;

    this.repliesMap.update((map) => ({
      ...map,
      [commentId]: (map[commentId] || comment.replies || []).filter((r) => r._id !== replyId),
    }));
    comment.repliesCount = Math.max(0, (comment.repliesCount || 1) - 1);

    this.commentsService.deleteReply(this.postId(), commentId, replyId).subscribe({
      next: () => {},
      error: () => {},
    });
  }

  // --- Comments pagination & loading ---

  loadComments(page: number): void {
    const append = page > 1;
    if (append) {
      if (this.isLoadingMore()) return;
      this.isLoadingMore.set(true);
    } else {
      this.isLoading.set(true);
      this.errorMessage.set('');
    }

    this.commentsService.getPostComments(this.postId(), { page, limit: this.limit }).subscribe({
      next: (res) => {
        const list = this.extractComments(res);
        this.comments.update((prev) => (append ? [...prev, ...list] : list));
        this.page.set(page);

        list.forEach((c) => {
          if (c.replies && c.replies.length > 0) {
            this.repliesMap.update((map) => ({ ...map, [c._id]: c.replies! }));
          }
        });

        const pagination = res.meta?.pagination;
        if (pagination) {
          this.hasMore.set(pagination.nextPage != null && pagination.currentPage < pagination.numberOfPages);
        } else {
          this.hasMore.set(list.length >= this.limit);
        }

        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
      error: (err) => {
        if (!append) {
          this.errorMessage.set(err.error?.message || 'Could not load comments.');
        }
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
    });
  }

  loadMore(): void {
    if (this.hasMore()) this.loadComments(this.page() + 1);
  }

  onSortChange(event: Event): void {
    this.sort.set((event.target as HTMLSelectElement).value as CommentsSort);
  }

  onContentInput(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    this.content.set(el.value);
    this.submitError.set('');
    this.autoResize(el);
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  toggleEmoji(event: MouseEvent): void {
    event.stopPropagation();
    this.showEmoji.set(!this.showEmoji());
  }

  addEmoji(emoji: string): void {
    const el = this.textarea()?.nativeElement;
    if (el) {
      this.content.set(insertAtCursor(el, emoji));
      this.autoResize(el);
    } else {
      this.content.update((v) => v + emoji);
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.clearPreview();
    this.image.set(file);
    this.imagePreview.set(URL.createObjectURL(file));
  }

  removeImage(): void {
    this.clearPreview();
    this.image.set(null);
  }

  submit(): void {
    if (!this.canSubmit()) return;

    this.isSubmitting.set(true);
    this.submitError.set('');

    this.commentsService
      .createComment(this.postId(), { content: this.content(), image: this.image() })
      .subscribe({
        next: (res) => {
          const created = this.buildCreatedComment(res);
          this.comments.update((prev) => [created, ...prev]);
          this.commentAdded.emit(created);

          this.content.set('');
          const el = this.textarea()?.nativeElement;
          if (el) {
            el.value = '';
            this.autoResize(el);
          }
          this.removeImage();
          this.showEmoji.set(false);
          this.isSubmitting.set(false);
        },
        error: (err) => {
          this.submitError.set(err.error?.message || 'Could not add the comment. Please try again.');
          this.isSubmitting.set(false);
        },
      });
  }

  author(comment: PostComment): { _id?: string; name: string; username: string; photo: string } {
    const creator: any = comment.commentCreator || comment.user;
    const _id = creator?._id || creator?.id;
    const photo = typeof creator?.photo === 'string' && creator.photo.trim() ? creator.photo : this.defaultPhoto;
    return {
      _id,
      name: creator?.name || creator?.username || 'User',
      username: creator?.username || '',
      photo,
    };
  }

  likesOf(comment: PostComment): number {
    return comment.likesCount ?? comment.likes?.length ?? 0;
  }

  // --- Likes Handling ---

  isCommentLiked(comment: PostComment): boolean {
    const local = this.commentLikesMap()[comment._id];
    if (local !== undefined) {
      return local.isLiked;
    }
    const currentUserId = this.user?._id;
    if (currentUserId && Array.isArray(comment.likes)) {
      return comment.likes.includes(currentUserId);
    }
    return Boolean(comment.isLiked);
  }

  getCommentLikesCount(comment: PostComment): number {
    const local = this.commentLikesMap()[comment._id];
    if (local !== undefined) {
      return local.count;
    }
    return this.likesOf(comment);
  }

  toggleCommentLike(comment: PostComment): void {
    const commentId = comment._id;
    const currentlyLiked = this.isCommentLiked(comment);
    const currentCount = this.getCommentLikesCount(comment);
    const newLiked = !currentlyLiked;
    const newCount = newLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

    this.commentLikesMap.update((map) => ({
      ...map,
      [commentId]: { isLiked: newLiked, count: newCount },
    }));

    this.commentsService.toggleCommentLike(this.postId(), commentId).subscribe({
      next: (res) => {
        const likesCount = res?.data?.likesCount ?? res?.data?.likes?.length;
        if (typeof likesCount === 'number') {
          this.commentLikesMap.update((map) => ({
            ...map,
            [commentId]: { isLiked: newLiked, count: likesCount },
          }));
        }
      },
      error: () => {},
    });
  }

  // --- Replies Handling ---

  isRepliesExpanded(commentId: string): boolean {
    return this.expandedReplies().has(commentId);
  }

  toggleReplies(comment: PostComment): void {
    const id = comment._id;
    const isExpanded = this.isRepliesExpanded(id);
    if (isExpanded) {
      this.expandedReplies.update((set) => {
        const s = new Set(set);
        s.delete(id);
        return s;
      });
      if (this.replyingToCommentId() === id) {
        this.replyingToCommentId.set(null);
      }
    } else {
      this.expandedReplies.update((set) => new Set(set).add(id));
      this.replyingToCommentId.set(id);
      this.loadReplies(comment);
      setTimeout(() => {
        this.replyTextarea()?.nativeElement.focus();
      }, 50);
    }
  }

  loadReplies(comment: PostComment): void {
    const commentId = comment._id;
    if (this.loadingReplies().has(commentId)) return;
    this.loadingReplies.update((set) => new Set(set).add(commentId));

    this.commentsService.getCommentReplies(this.postId(), commentId).subscribe({
      next: (res) => {
        const replies = this.extractReplies(res);
        this.repliesMap.update((map) => ({
          ...map,
          [commentId]: replies.length > 0 ? replies : (map[commentId] || comment.replies || []),
        }));
        this.loadingReplies.update((set) => {
          const next = new Set(set);
          next.delete(commentId);
          return next;
        });
      },
      error: () => {
        this.repliesMap.update((map) => ({
          ...map,
          [commentId]: map[commentId] || comment.replies || [],
        }));
        this.loadingReplies.update((set) => {
          const next = new Set(set);
          next.delete(commentId);
          return next;
        });
      },
    });
  }

  getReplies(comment: PostComment): CommentReply[] {
    return this.repliesMap()[comment._id] || comment.replies || [];
  }

  replyAuthor(reply: CommentReply): { _id?: string; name: string; username: string; photo: string } {
    const creator: any = reply.commentCreator || reply.user;
    const _id = creator?._id || creator?.id;
    const photo = typeof creator?.photo === 'string' && creator.photo.trim() ? creator.photo : this.defaultPhoto;
    return {
      _id,
      name: creator?.name || creator?.username || 'User',
      username: creator?.username || '',
      photo,
    };
  }

  isReplyLiked(reply: CommentReply): boolean {
    const local = this.replyLikesMap()[reply._id];
    if (local !== undefined) {
      return local.isLiked;
    }
    const currentUserId = this.user?._id;
    if (currentUserId && Array.isArray(reply.likes)) {
      return reply.likes.includes(currentUserId);
    }
    return Boolean(reply.isLiked);
  }

  getReplyLikesCount(reply: CommentReply): number {
    const local = this.replyLikesMap()[reply._id];
    if (local !== undefined) {
      return local.count;
    }
    return reply.likesCount ?? reply.likes?.length ?? 0;
  }

  toggleReplyLike(comment: PostComment, reply: CommentReply): void {
    const replyId = reply._id;
    const currentlyLiked = this.isReplyLiked(reply);
    const currentCount = this.getReplyLikesCount(reply);
    const newLiked = !currentlyLiked;
    const newCount = newLiked ? currentCount + 1 : Math.max(0, currentCount - 1);

    this.replyLikesMap.update((map) => ({
      ...map,
      [replyId]: { isLiked: newLiked, count: newCount },
    }));

    this.commentsService.toggleReplyLike(this.postId(), comment._id, replyId).subscribe({
      next: (res) => {
        const likesCount = res?.data?.likesCount ?? res?.data?.likes?.length;
        if (typeof likesCount === 'number') {
          this.replyLikesMap.update((map) => ({
            ...map,
            [replyId]: { isLiked: newLiked, count: likesCount },
          }));
        }
      },
      error: () => {},
    });
  }

  onReplyContentInput(event: Event): void {
    const el = event.target as HTMLTextAreaElement;
    this.replyContent.set(el.value);
    this.autoResizeReply(el);
  }

  onReplyKeydown(event: KeyboardEvent, comment: PostComment): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submitReply(comment);
    }
  }

  toggleReplyEmoji(event: MouseEvent): void {
    event.stopPropagation();
    this.showReplyEmoji.set(!this.showReplyEmoji());
  }

  addReplyEmoji(emoji: string): void {
    const el = this.replyTextarea()?.nativeElement;
    if (el) {
      this.replyContent.set(insertAtCursor(el, emoji));
      this.autoResizeReply(el);
    } else {
      this.replyContent.update((v) => v + emoji);
    }
  }

  onReplyImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.clearReplyPreview();
    this.replyImage.set(file);
    this.replyImagePreview.set(URL.createObjectURL(file));
  }

  removeReplyImage(): void {
    this.clearReplyPreview();
    this.replyImage.set(null);
  }

  submitReply(comment: PostComment): void {
    if (!this.canSubmitReply()) return;

    const content = this.replyContent().trim();
    const image = this.replyImage();
    const preview = this.replyImagePreview();
    const commentId = comment._id;

    this.isSubmittingReply.set(true);

    this.commentsService.createReply(this.postId(), commentId, { content, image }).subscribe({
      next: (res) => {
        const created = this.buildCreatedReply(res, content, preview);
        this.repliesMap.update((map) => ({
          ...map,
          [commentId]: [...(map[commentId] || comment.replies || []), created],
        }));
        comment.repliesCount = (comment.repliesCount || 0) + 1;

        this.replyContent.set('');
        const el = this.replyTextarea()?.nativeElement;
        if (el) {
          el.value = '';
          el.style.height = 'auto';
        }
        this.removeReplyImage();
        this.showReplyEmoji.set(false);
        this.isSubmittingReply.set(false);
      },
      error: () => {
        const created = this.buildCreatedReply(null, content, preview);
        this.repliesMap.update((map) => ({
          ...map,
          [commentId]: [...(map[commentId] || comment.replies || []), created],
        }));
        comment.repliesCount = (comment.repliesCount || 0) + 1;

        this.replyContent.set('');
        const el = this.replyTextarea()?.nativeElement;
        if (el) {
          el.value = '';
          el.style.height = 'auto';
        }
        this.removeReplyImage();
        this.showReplyEmoji.set(false);
        this.isSubmittingReply.set(false);
      },
    });
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultPhoto;
  }

  private extractComments(res: ApiResponse<any>): PostComment[] {
    const data = res?.data;
    if (Array.isArray(data?.comments)) return data.comments;
    if (Array.isArray(data)) return data;
    if (Array.isArray((res as any)?.comments)) return (res as any).comments;
    return [];
  }

  private extractReplies(res: ApiResponse<any>): CommentReply[] {
    const data = res?.data;
    if (Array.isArray(data?.replies)) return data.replies;
    if (Array.isArray(data?.comments)) return data.comments;
    if (Array.isArray(data)) return data;
    if (Array.isArray((res as any)?.replies)) return (res as any).replies;
    return [];
  }

  private buildCreatedComment(res: ApiResponse<any>): PostComment {
    const fromApi: PostComment | undefined = res?.data?.comment || (res as any)?.comment;
    const comment: PostComment = fromApi
      ? { ...fromApi }
      : { _id: `local-${Date.now()}`, content: this.content().trim() };

    const creator: any = comment.commentCreator;
    if (!creator || typeof creator === 'string' || !creator.name) {
      comment.commentCreator = {
        _id: this.user?._id ?? '',
        name: this.user?.name ?? 'You',
        username: this.user?.username,
        photo: this.user?.photo,
      };
    }
    comment.createdAt = comment.createdAt ?? new Date().toISOString();
    return comment;
  }

  private buildCreatedReply(res: ApiResponse<any> | null, content: string, imagePreview: string | null): CommentReply {
    const fromApi: CommentReply | undefined = res?.data?.reply || res?.data?.comment || (res as any)?.reply;
    const reply: CommentReply = fromApi
      ? { ...fromApi }
      : {
          _id: `local-reply-${Date.now()}`,
          content,
          image: imagePreview ?? undefined,
          createdAt: new Date().toISOString(),
          likesCount: 0,
          likes: [],
        };

    const creator: any = reply.commentCreator || reply.user;
    if (!creator || typeof creator === 'string' || !creator.name) {
      reply.user = {
        _id: this.user?._id ?? '',
        name: this.user?.name ?? 'You',
        username: this.user?.username ?? '',
        photo: this.user?.photo ?? this.defaultPhoto,
      };
    }
    reply.createdAt = reply.createdAt ?? new Date().toISOString();
    return reply;
  }

  private autoResize(el: HTMLTextAreaElement): void {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }

  private autoResizeReply(el: HTMLTextAreaElement): void {
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  private clearPreview(): void {
    const preview = this.imagePreview();
    if (preview) URL.revokeObjectURL(preview);
    this.imagePreview.set(null);
  }

  private clearReplyPreview(): void {
    const preview = this.replyImagePreview();
    if (preview) URL.revokeObjectURL(preview);
    this.replyImagePreview.set(null);
  }
}
