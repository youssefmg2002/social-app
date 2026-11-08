import {
  Component,
  computed,
  effect,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Post, PostComment } from '../../../core/models/post.model';
import { AuthService } from '../../../core/auth/services/auth.service';
import { PostsService } from '../../../core/services/posts.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { DEFAULT_PROFILE_PHOTO } from '../../constants';
import { PostComments } from '../post-comments/post-comments';

@Component({
  selector: 'app-post-card',
  imports: [TimeAgoPipe, RouterLink, PostComments],
  templateUrl: './post-card.html',
  host: {
    class: 'block',
  },
})
export class PostCard {
  private readonly authService = inject(AuthService);
  private readonly postsService = inject(PostsService);
  readonly defaultPhoto = DEFAULT_PROFILE_PHOTO;

  post = input.required<Post>();
  postDeleted = output<string>();
  postUpdated = output<{ postId: string; body: string }>();
  postShared = output<any>();

  isLiked = signal<boolean>(false);
  likesCount = signal<number>(0);
  commentsCount = signal<number>(0);
  sharesCount = signal<number>(0);
  showComments = signal<boolean>(false);
  isBookmarked = signal<boolean>(false);
  menuOpen = signal<boolean>(false);
  isDeleting = signal<boolean>(false);

  isEditing = signal<boolean>(false);
  editBody = signal<string>('');
  currentBody = signal<string>('');
  isSaving = signal<boolean>(false);
  showDeleteModal = signal<boolean>(false);
  previewImage = signal<string | null>(null);

  showShareModal = signal<boolean>(false);
  shareCaption = signal<string>('');
  isSharing = signal<boolean>(false);

  targetPostAuthor = computed(() => {
    const p = this.post();
    const user = p.user;
    return {
      name: user?.name || 'User',
      username: user?.username || '',
      photo: user?.photo || this.defaultPhoto,
    };
  });

  targetPostBody = computed(() => {
    return this.currentBody() || this.post().body || '';
  });

  targetPostImage = computed(() => {
    return this.post().image || (this.post().sharedPost as any)?.image || null;
  });

  isOwner = computed(() => {
    const currentUserId = this.authService.getUserId();
    const currentUser = this.authService.getCurrentUser();
    const postUser = this.post().user;
    if (!postUser) return false;
    const postUserId = postUser._id || (postUser as any).id;
    if (currentUserId && postUserId && currentUserId === postUserId) return true;
    if (currentUser?.username && postUser.username && currentUser.username === postUser.username) return true;
    if (currentUser?.name && postUser.name && currentUser.name === postUser.name) return true;
    return false;
  });

  readonly currentPrivacy = signal<string>('public');
  readonly privacyMenuOpen = signal<boolean>(false);
  readonly isUpdatingPrivacy = signal<boolean>(false);

  private isLikeLoading = signal<boolean>(false);
  private isBookmarkLoading = signal<boolean>(false);

  constructor() {
    effect(() => {
      const p = this.post();
      const userId = this.authService.getUserId();
      this.isLiked.set(!!userId && (p.likes?.includes(userId) ?? false));
      this.likesCount.set(p.likesCount ?? p.likes?.length ?? 0);
      this.commentsCount.set(p.commentsCount ?? 0);
      this.sharesCount.set(p.sharesCount ?? 0);
      this.isBookmarked.set(p.bookmarked ?? false);
      this.currentBody.set(p.body || '');
      this.currentPrivacy.set(p.privacy || 'public');
    });
  }

  toggleComments(): void {
    this.showComments.update((v) => !v);
  }

  openComments(): void {
    this.showComments.set(true);
  }

  onCommentAdded(): void {
    this.commentsCount.update((c) => c + 1);
  }

  onCommentDeleted(): void {
    this.commentsCount.update((c) => Math.max(0, c - 1));
  }

  openShareModal(): void {
    this.shareCaption.set('');
    this.showShareModal.set(true);
  }

  closeShareModal(): void {
    if (this.isSharing()) return;
    this.showShareModal.set(false);
  }

  onShareCaptionChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.shareCaption.set(target.value);
  }

  confirmSharePost(): void {
    if (this.isSharing()) return;
    const postId = this.post()._id || this.post().id;
    if (!postId) return;

    this.isSharing.set(true);
    const caption = this.shareCaption().trim();
    this.postsService.sharePost(postId, { body: caption }).subscribe({
      next: (res) => {
        this.isSharing.set(false);
        this.showShareModal.set(false);
        this.sharesCount.update((c) => c + 1);
        this.shareCaption.set('');
        this.postShared.emit(res?.data || res);
      },
      error: (err) => {
        console.error('Failed to share post:', err);
        this.isSharing.set(false);
      },
    });
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.menuOpen.set(false);
    this.privacyMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.previewImage()) {
      this.closeImageModal();
    }
    if (this.showShareModal()) {
      this.closeShareModal();
    }
  }

  openImageModal(src?: string): void {
    if (src) {
      this.previewImage.set(src);
    }
  }

  closeImageModal(): void {
    this.previewImage.set(null);
  }

  toggleMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.set(!this.menuOpen());
  }

  toggleLike(): void {
    if (this.isLikeLoading()) return;

    const currentLiked = this.isLiked();
    const currentCount = this.likesCount();

    // Optimistic UI update
    this.isLiked.set(!currentLiked);
    this.likesCount.set(
      currentLiked ? Math.max(0, currentCount - 1) : currentCount + 1
    );
    this.isLikeLoading.set(true);

    const postId = this.post()._id || this.post().id;
    this.postsService.toggleLike(postId).subscribe({
      next: () => {
        this.isLikeLoading.set(false);
      },
      error: () => {
        // Rollback on error
        this.isLiked.set(currentLiked);
        this.likesCount.set(currentCount);
        this.isLikeLoading.set(false);
      },
    });
  }

  toggleBookmark(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.set(false);

    if (this.isBookmarkLoading()) return;

    const currentBookmarked = this.isBookmarked();

    // Optimistic UI update
    this.isBookmarked.set(!currentBookmarked);
    this.isBookmarkLoading.set(true);

    const postId = this.post()._id || this.post().id;
    this.postsService.toggleBookmark(postId).subscribe({
      next: () => {
        this.isBookmarkLoading.set(false);
      },
      error: () => {
        // Rollback on error
        this.isBookmarked.set(currentBookmarked);
        this.isBookmarkLoading.set(false);
      },
    });
  }

  editPost(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.editBody.set(this.currentBody());
    this.isEditing.set(true);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
    this.editBody.set(this.currentBody());
  }

  onEditBodyChange(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.editBody.set(target.value);
  }

  saveEdit(): void {
    const newBody = this.editBody().trim();
    if (!newBody || this.isSaving()) return;

    const postId = this.post()._id || this.post().id;
    if (!postId) return;

    this.isSaving.set(true);
    this.postsService.updatePost(postId, { body: newBody }).subscribe({
      next: () => {
        this.currentBody.set(newBody);
        this.isEditing.set(false);
        this.isSaving.set(false);
        this.postUpdated.emit({ postId, body: newBody });
      },
      error: (err) => {
        console.error('Failed to update post:', err);
        this.isSaving.set(false);
      },
    });
  }

  openDeleteModal(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    if (this.isDeleting()) return;
    this.showDeleteModal.set(false);
  }

  confirmDeletePost(): void {
    if (this.isDeleting()) return;

    const postId = this.post()._id || this.post().id;
    if (!postId) return;

    this.isDeleting.set(true);
    this.postsService.deletePost(postId).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.showDeleteModal.set(false);
        this.postDeleted.emit(postId);
      },
      error: (err) => {
        console.error('Failed to delete post:', err);
        this.isDeleting.set(false);
      },
    });
  }

  commentAuthor(comment: PostComment | any): { _id?: string; name: string; photo: string } {
    const creator = comment?.commentCreator || comment?.user || comment?.author;
    const _id = creator?._id || creator?.id;
    const name = creator?.name || creator?.username || 'User';
    const photo =
      creator?.photo && typeof creator.photo === 'string' && creator.photo.trim() !== ''
        ? creator.photo
        : this.defaultPhoto;
    return { _id, name, photo };
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultPhoto;
  }

  privacyLabel(privacy: string): string {
    switch (privacy) {
      case 'following':
        return 'Followers';
      case 'only_me':
        return 'Only me';
      default:
        return 'Public';
    }
  }

  togglePrivacyMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.set(false);
    this.privacyMenuOpen.update((v) => !v);
  }

  changePrivacy(newPrivacy: string, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.privacyMenuOpen.set(false);
    if (this.currentPrivacy() === newPrivacy) return;

    const postId = this.post()._id || this.post().id;
    this.currentPrivacy.set(newPrivacy);
    this.post().privacy = newPrivacy;

    this.isUpdatingPrivacy.set(true);
    this.postsService.updatePrivacy(postId, newPrivacy).subscribe({
      next: () => {
        this.isUpdatingPrivacy.set(false);
      },
      error: () => {
        this.isUpdatingPrivacy.set(false);
      },
    });
  }
}

