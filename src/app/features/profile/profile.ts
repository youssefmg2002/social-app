import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService, User } from '../../core/auth/services/auth.service';
import { PostsService } from '../../core/services/posts.service';
import { Post, PostPrivacy } from '../../core/models/post.model';
import { PostCard } from '../../shared/components/post-card/post-card';

@Component({
  selector: 'app-profile',
  imports: [FormsModule, PostCard],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly postsService = inject(PostsService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);

  readonly defaultPhoto =
    'https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png';

  // Own vs Other profile state
  readonly isOwnProfile = signal(true);
  readonly otherUserId = signal('');
  readonly otherUser = signal<User | null>(null);
  readonly isFollowing = signal(false);
  readonly otherUserPosts = signal<Post[]>([]);
  readonly isLoadingOtherProfile = signal(false);

  // Own profile state
  readonly user = signal<User | null>(this.authService.getCurrentUser());
  readonly activeTab = signal<'myPosts' | 'saved'>('myPosts');
  readonly myPosts = signal<Post[]>([]);
  readonly savedPosts = signal<Post[]>([]);
  readonly isLoadingPosts = signal(false);

  // Cover photo modal
  readonly showCoverModal = signal(false);
  readonly isSavingCover = signal(false);
  readonly isRemovingCover = signal(false);
  selectedCoverFile: File | null = null;
  coverPrivacy: PostPrivacy = 'public';

  // Profile photo modal & cropping
  readonly showProfilePhotoModal = signal(false);
  readonly isSavingPhoto = signal(false);
  readonly cropPreviewUrl = signal<string>('');
  readonly cropX = signal<number>(0);
  readonly cropY = signal<number>(0);
  readonly cropZoom = signal<number>(1.0);
  selectedProfileFile: File | null = null;
  profilePhotoPrivacy: PostPrivacy = 'public';

  // Lightbox / view image
  readonly previewImage = signal<string | null>(null);
  readonly previewTitle = signal<string>('');

  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      const currentUserId = this.authService.getUserId();

      if (id && id !== currentUserId) {
        this.isOwnProfile.set(false);
        this.otherUserId.set(id);
        this.loadOtherProfile(id);
      } else {
        this.isOwnProfile.set(true);
        this.otherUserId.set('');
        this.refreshUser();
        this.loadMyPosts();
        this.loadSavedPosts();
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  toggleFollow(): void {
    this.isFollowing.update((v) => !v);
  }

  loadOtherProfile(id: string): void {
    this.isLoadingOtherProfile.set(true);
    this.otherUserPosts.set([]);

    // Check if user info was passed in navigation state
    const stateUser = history.state?.user;
    if (stateUser && (stateUser._id === id || stateUser.id === id)) {
      this.otherUser.set(stateUser);
    }

    this.postsService.getUserPosts(id, { page: 1, limit: 50 }).subscribe({
      next: (res) => {
        this.isLoadingOtherProfile.set(false);
        const posts = res?.data?.posts || [];
        this.otherUserPosts.set(posts);

        if (posts.length > 0 && posts[0].user) {
          const u = posts[0].user;
          this.otherUser.set({
            _id: u._id,
            name: u.name,
            username: u.username,
            photo: u.photo,
            cover: (u as any).cover || '',
          });
        }
      },
      error: () => {
        this.isLoadingOtherProfile.set(false);
      },
    });
  }

  refreshUser(): void {
    const current = this.authService.getCurrentUser();
    if (current) this.user.set(current);

    this.authService.getProfileData().subscribe({
      next: (res) => {
        const u = res?.data?.user || res?.user;
        if (u) {
          const updated = this.authService.updateUserInStorage(u);
          this.user.set(updated || u);
        }
      },
      error: () => {},
    });
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  formatJoinedDate(dateStr?: string): string {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  }

  loadMyPosts(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.isLoadingPosts.set(true);
    this.postsService.getUserPosts(userId, { page: 1, limit: 50 }).subscribe({
      next: (res) => {
        this.isLoadingPosts.set(false);
        this.myPosts.set(res?.data?.posts || []);
      },
      error: () => {
        this.isLoadingPosts.set(false);
      },
    });
  }

  loadSavedPosts(): void {
    this.postsService.getBookmarks({ page: 1, limit: 50 }).subscribe({
      next: (res) => {
        const list = res?.data?.bookmarks || res?.data?.posts || [];
        this.savedPosts.set(list);
      },
      error: () => {},
    });
  }

  // --- Cover photo handlers ---
  onCoverFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.selectedCoverFile = input.files[0];
    this.coverPrivacy = 'public';
    this.showCoverModal.set(true);
    input.value = '';
  }

  closeCoverModal(): void {
    this.showCoverModal.set(false);
    this.selectedCoverFile = null;
    this.isSavingCover.set(false);
  }

  saveCoverPhoto(): void {
    if (!this.selectedCoverFile) return;

    this.isSavingCover.set(true);
    const file = this.selectedCoverFile;
    const currentUser = this.authService.getCurrentUser();

    // 1. Upload to /users/upload-cover to persist in the database
    this.authService.uploadCoverPhoto(file).subscribe({
      next: (coverRes) => {
        const serverCoverUrl =
          coverRes?.data?.user?.cover ||
          coverRes?.user?.cover ||
          coverRes?.cover ||
          coverRes?.data?.cover;

        // 2. Create the post "updated cover photo."
        this.postsService
          .createPost({
            body: 'updated cover photo.',
            image: file,
            privacy: this.coverPrivacy,
          })
          .subscribe({
            next: (postRes) => {
              this.isSavingCover.set(false);
              const newPost = postRes?.data?.post;
              const finalCoverUrl =
                serverCoverUrl || newPost?.image || URL.createObjectURL(file);

              // Attach full user details to the post immediately
              if (newPost && currentUser) {
                newPost.user = {
                  _id: currentUser._id,
                  name: currentUser.name,
                  username: currentUser.username,
                  photo: currentUser.photo,
                };
                this.myPosts.update((list) => [newPost, ...list]);
              }

              const updated = this.authService.updateUserInStorage({
                cover: finalCoverUrl,
              });
              this.user.set(updated);

              this.closeCoverModal();
            },
            error: () => {
              this.isSavingCover.set(false);
              const finalCoverUrl = serverCoverUrl || URL.createObjectURL(file);
              const updated = this.authService.updateUserInStorage({
                cover: finalCoverUrl,
              });
              this.user.set(updated);
              this.closeCoverModal();
            },
          });
      },
      error: () => {
        // Fallback: create post and update locally
        this.postsService
          .createPost({
            body: 'updated cover photo.',
            image: file,
            privacy: this.coverPrivacy,
          })
          .subscribe({
            next: (postRes) => {
              this.isSavingCover.set(false);
              const newPost = postRes?.data?.post;
              const finalCoverUrl = newPost?.image || URL.createObjectURL(file);

              if (newPost && currentUser) {
                newPost.user = {
                  _id: currentUser._id,
                  name: currentUser.name,
                  username: currentUser.username,
                  photo: currentUser.photo,
                };
                this.myPosts.update((list) => [newPost, ...list]);
              }

              const updated = this.authService.updateUserInStorage({
                cover: finalCoverUrl,
              });
              if (updated) this.user.set(updated);
              this.closeCoverModal();
            },
            error: () => {
              this.isSavingCover.set(false);
              const localUrl = URL.createObjectURL(file);
              const updated = this.authService.updateUserInStorage({
                cover: localUrl,
              });
              if (updated) this.user.set(updated);
              this.closeCoverModal();
            },
          });
      },
    });
  }

  viewCoverPhoto(): void {
    const cover = this.user()?.cover;
    if (!cover) return;
    this.previewTitle.set('Cover Photo');
    this.previewImage.set(cover);
  }

  removeCoverPhoto(): void {
    if (this.isRemovingCover()) return;
    this.isRemovingCover.set(true);

    this.authService.deleteCoverPhoto().subscribe({
      next: () => {
        this.isRemovingCover.set(false);
        const updated = this.authService.updateUserInStorage({ cover: '' });
        this.user.set(updated);
      },
      error: () => {
        this.isRemovingCover.set(false);
        const updated = this.authService.updateUserInStorage({ cover: '' });
        this.user.set(updated);
      },
    });
  }

  // --- Profile photo handlers ---
  onProfilePhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    this.selectedProfileFile = input.files[0];
    this.cropX.set(0);
    this.cropY.set(0);
    this.cropZoom.set(1.0);
    this.profilePhotoPrivacy = 'public';

    const reader = new FileReader();
    reader.onload = (e) => {
      this.cropPreviewUrl.set(e.target?.result as string);
      this.showProfilePhotoModal.set(true);
    };
    reader.readAsDataURL(this.selectedProfileFile);
    input.value = '';
  }

  closeProfilePhotoModal(): void {
    this.showProfilePhotoModal.set(false);
    this.selectedProfileFile = null;
    this.isSavingPhoto.set(false);
    this.cropPreviewUrl.set('');
  }

  onZoomChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.cropZoom.set(parseFloat(target.value));
  }

  onCropMouseDown(event: MouseEvent): void {
    this.isDragging = true;
    this.dragStartX = event.clientX - this.cropX();
    this.dragStartY = event.clientY - this.cropY();
  }

  @HostListener('window:mousemove', ['$event'])
  onWindowMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.cropX.set(event.clientX - this.dragStartX);
    this.cropY.set(event.clientY - this.dragStartY);
  }

  @HostListener('window:mouseup')
  onWindowMouseUp(): void {
    this.isDragging = false;
  }

  onCropTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      this.isDragging = true;
      this.dragStartX = event.touches[0].clientX - this.cropX();
      this.dragStartY = event.touches[0].clientY - this.cropY();
    }
  }

  @HostListener('window:touchmove', ['$event'])
  onWindowTouchMove(event: TouchEvent): void {
    if (!this.isDragging || event.touches.length !== 1) return;
    this.cropX.set(event.touches[0].clientX - this.dragStartX);
    this.cropY.set(event.touches[0].clientY - this.dragStartY);
  }

  @HostListener('window:touchend')
  onWindowTouchEnd(): void {
    this.isDragging = false;
  }

  saveProfilePhoto(): void {
    if (!this.selectedProfileFile) return;

    this.isSavingPhoto.set(true);
    const file = this.selectedProfileFile;
    const currentUser = this.authService.getCurrentUser();

    this.authService.uploadProfilePhoto(file).subscribe({
      next: (res) => {
        const newPhoto =
          res?.data?.user?.photo ||
          res?.user?.photo ||
          res?.data?.photo ||
          res?.photo ||
          URL.createObjectURL(file);
        const updated = this.authService.updateUserInStorage({ photo: newPhoto });
        this.user.set(updated);

        // Also create a post for the updated profile photo
        this.postsService
          .createPost({
            body: 'updated profile photo.',
            image: file,
            privacy: this.profilePhotoPrivacy,
          })
          .subscribe({
            next: (postRes) => {
              const newPost = postRes?.data?.post;
              if (newPost && currentUser) {
                newPost.user = {
                  _id: currentUser._id,
                  name: currentUser.name,
                  username: currentUser.username,
                  photo: newPhoto,
                };
                this.myPosts.update((list) => [newPost, ...list]);
              }
            },
          });

        this.isSavingPhoto.set(false);
        this.closeProfilePhotoModal();
      },
      error: () => {
        this.postsService
          .createPost({
            body: 'updated profile photo.',
            image: file,
            privacy: this.profilePhotoPrivacy,
          })
          .subscribe({
            next: (postRes) => {
              const newPost = postRes?.data?.post;
              const newPhoto = newPost?.image || URL.createObjectURL(file);
              const updated = this.authService.updateUserInStorage({
                photo: newPhoto,
              });
              if (updated) this.user.set(updated);
              if (newPost && currentUser) {
                newPost.user = {
                  _id: currentUser._id,
                  name: currentUser.name,
                  username: currentUser.username,
                  photo: newPhoto,
                };
                this.myPosts.update((list) => [newPost, ...list]);
              }
              this.isSavingPhoto.set(false);
              this.closeProfilePhotoModal();
            },
            error: () => {
              const localUrl = URL.createObjectURL(file);
              const updated = this.authService.updateUserInStorage({
                photo: localUrl,
              });
              if (updated) this.user.set(updated);
              this.isSavingPhoto.set(false);
              this.closeProfilePhotoModal();
            },
          });
      },
    });
  }

  viewProfilePhoto(): void {
    const photo = this.user()?.photo || this.defaultPhoto;
    this.previewTitle.set('Profile Photo');
    this.previewImage.set(photo);
  }

  openImagePreview(imageUrl: string, title = 'Photo'): void {
    this.previewTitle.set(title);
    this.previewImage.set(imageUrl);
  }

  closeImagePreview(): void {
    this.previewImage.set(null);
  }
}
