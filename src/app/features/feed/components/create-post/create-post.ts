import {
  Component,
  computed,
  HostListener,
  inject,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { AuthService, User } from '../../../../core/auth/services/auth.service';
import { PostsService } from '../../../../core/services/posts.service';
import { PostPrivacy } from '../../../../core/models/post.model';
import { DEFAULT_PROFILE_PHOTO } from '../../../../shared/constants';
import { EmojiPicker } from '../../../../shared/components/emoji-picker/emoji-picker';

@Component({
  selector: 'app-create-post',
  imports: [EmojiPicker],
  templateUrl: './create-post.html',
  host: {
    class: 'block',
  },
})
export class CreatePost implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly postsService = inject(PostsService);

  /** Emitted after a post is created successfully. */
  postCreated = output<void>();

  get user(): User | null {
    return this.authService.getCurrentUser();
  }
  readonly defaultPhoto = DEFAULT_PROFILE_PHOTO;
  get firstName(): string {
    return this.user?.name?.split(' ')[0] ?? '';
  }
  get placeholder(): string {
    return `What's on your mind${this.firstName ? ', ' + this.firstName : ''}?`;
  }

  body = signal('');
  privacy = signal<PostPrivacy>('public');
  privacyOpen = signal(false);
  image = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  isPosting = signal(false);
  errorMessage = signal('');
  showEmoji = signal(false);

  privacyLabel = computed(() => {
    switch (this.privacy()) {
      case 'following':
        return 'Followers';
      case 'only_me':
        return 'Only me';
      default:
        return 'Public';
    }
  });

  canPost = computed(() => (!!this.body().trim() || !!this.image()) && !this.isPosting());

  @HostListener('document:click')
  closePrivacy(): void {
    this.privacyOpen.set(false);
  }

  togglePrivacy(event: MouseEvent): void {
    event.stopPropagation();
    this.privacyOpen.set(!this.privacyOpen());
  }

  selectPrivacy(privacy: PostPrivacy, event: MouseEvent): void {
    event.stopPropagation();
    this.privacy.set(privacy);
    this.privacyOpen.set(false);
  }

  toggleEmoji(event: MouseEvent): void {
    event.stopPropagation();
    this.showEmoji.set(!this.showEmoji());
  }

  addEmoji(emoji: string): void {
    this.body.update((v) => v + emoji);
  }

  onBodyInput(event: Event): void {
    this.body.set((event.target as HTMLTextAreaElement).value);
    this.errorMessage.set('');
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // allow choosing the same file again later
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
    if (!this.canPost()) return;

    this.isPosting.set(true);
    this.errorMessage.set('');

    this.postsService
      .createPost({ body: this.body(), image: this.image(), privacy: this.privacy() })
      .subscribe({
        next: () => {
          this.isPosting.set(false);
          this.body.set('');
          this.removeImage();
          this.postCreated.emit();
        },
        error: (err) => {
          this.isPosting.set(false);
          this.errorMessage.set(err.error?.message || 'Could not create the post. Please try again.');
        },
      });
  }

  ngOnDestroy(): void {
    this.clearPreview();
  }

  private clearPreview(): void {
    const preview = this.imagePreview();
    if (preview) URL.revokeObjectURL(preview);
    this.imagePreview.set(null);
  }
}
