import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Observable, Subscription, throwError } from 'rxjs';
import { PostsService } from '../../core/services/posts.service';
import { AuthService } from '../../core/auth/services/auth.service';
import { ApiMeta, ApiResponse, Post } from '../../core/models/post.model';
import { PostCard } from '../../shared/components/post-card/post-card';
import { CreatePost } from './components/create-post/create-post';
import { SuggestedFriends } from './components/suggested-friends/suggested-friends';

export type FeedTab = 'feed' | 'my-posts' | 'community' | 'saved';

@Component({
  selector: 'app-feed',
  imports: [NgTemplateOutlet, PostCard, CreatePost, SuggestedFriends],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit {
  private readonly postsService = inject(PostsService);
  private readonly authService = inject(AuthService);

  readonly tabs: { id: FeedTab; label: string; empty: string }[] = [
    { id: 'feed', label: 'Feed', empty: 'No posts from people you follow yet.' },
    { id: 'my-posts', label: 'My Posts', empty: "You haven't posted anything yet." },
    { id: 'community', label: 'Community', empty: 'No posts in the community yet.' },
    { id: 'saved', label: 'Saved', empty: "You haven't saved any posts yet." },
  ];

  readonly limit = 20;

  activeTab = signal<FeedTab>('feed');
  posts = signal<Post[]>([]);
  currentPage = signal<number>(1);
  nextPage = signal<number | null>(null);
  hasMore = signal<boolean>(true);
  meta = signal<ApiMeta | null>(null);

  isLoading = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  errorMessage = signal<string>('');
  showSuggestions = signal<boolean>(false);

  private postsSub?: Subscription;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.postsSub?.unsubscribe());
  }

  ngOnInit(): void {
    this.loadPosts(1, false);
  }

  selectTab(tab: FeedTab): void {
    if (tab === this.activeTab()) return;
    this.activeTab.set(tab);
    this.currentPage.set(1);
    this.nextPage.set(null);
    this.hasMore.set(true);
    this.meta.set(null);
    this.posts.set([]);
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    this.loadPosts(1, false);
  }

  onPostDeleted(postId: string): void {
    this.posts.update((list) => list.filter((p) => (p._id || p.id) !== postId));
  }

  onPostUpdated(updated: { postId: string; body: string }): void {
    this.posts.update((list) =>
      list.map((p) =>
        (p._id || p.id) === updated.postId ? { ...p, body: updated.body } : p
      )
    );
  }

  onPostShared(newPost?: any): void {
    const post = newPost?.post || newPost;
    if (post && (post._id || post.id)) {
      this.posts.update((list) => [post, ...list]);
    } else {
      this.loadPosts(1, false);
    }
  }

  emptyMessage(): string {
    return this.tabs.find((t) => t.id === this.activeTab())?.empty ?? 'No posts yet.';
  }

  loadPosts(page = 1, append = false): void {
    if (append) {
      if (this.isLoadingMore() || !this.hasMore()) return;
      this.isLoadingMore.set(true);
    } else {
      this.postsSub?.unsubscribe();
      this.isLoading.set(true);
      this.errorMessage.set('');
    }

    this.postsSub = this.requestFor(this.activeTab(), page).subscribe({
      next: (res) => {
        const newPosts = this.extractPosts(res);

        if (append) {
          this.posts.update((prev) => [...prev, ...newPosts]);
        } else {
          this.posts.set(newPosts);
        }

        if (res.meta) {
          this.meta.set(res.meta);
          const pagination = res.meta.pagination;
          if (pagination) {
            this.currentPage.set(pagination.currentPage);
            this.nextPage.set(pagination.nextPage ?? null);
            const more =
              pagination.nextPage != null &&
              pagination.currentPage < pagination.numberOfPages;
            this.hasMore.set(more);
          } else {
            this.currentPage.set(page);
            this.hasMore.set(newPosts.length >= this.limit);
            this.nextPage.set(newPosts.length >= this.limit ? page + 1 : null);
          }
        } else {
          this.currentPage.set(page);
          this.hasMore.set(newPosts.length >= this.limit);
          this.nextPage.set(newPosts.length >= this.limit ? page + 1 : null);
        }

        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
      error: (err) => {
        if (!append) {
          this.errorMessage.set(
            err.error?.message || err.message || 'Could not load posts.'
          );
        }
        this.isLoading.set(false);
        this.isLoadingMore.set(false);
      },
    });
  }

  loadMore(): void {
    if (this.isLoading() || this.isLoadingMore() || !this.hasMore()) {
      return;
    }
    const targetPage = this.nextPage() ?? this.currentPage() + 1;
    this.loadPosts(targetPage, true);
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.isLoading() || this.isLoadingMore() || !this.hasMore()) {
      return;
    }
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.scrollHeight - 350;
    if (scrollPosition >= threshold) {
      this.loadMore();
    }
  }

  private extractPosts(res: ApiResponse<any>): Post[] {
    if (!res || !res.data) return [];
    if (Array.isArray(res.data.posts)) return res.data.posts;
    if (Array.isArray(res.data.bookmarks)) return res.data.bookmarks;
    if (Array.isArray(res.data)) return res.data;
    return [];
  }

  private requestFor(tab: FeedTab, page: number): Observable<ApiResponse<any>> {
    const params = { page, limit: this.limit };

    switch (tab) {
      case 'feed':
        return this.postsService.getHomeFeed({ ...params, only: 'following' });

      case 'my-posts': {
        const userId = this.authService.getUserId();
        if (!userId) {
          return throwError(() => new Error('Please log in again to see your posts.'));
        }
        return this.postsService.getUserPosts(userId, params);
      }

      case 'community':
        return this.postsService.getAllPosts(params);

      case 'saved':
        return this.postsService.getBookmarks(params);
    }
  }
}
