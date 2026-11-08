import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SuggestedUser, SuggestionsService } from '../../core/services/suggestions.service';
import { DEFAULT_PROFILE_PHOTO } from '../../shared/constants';

@Component({
  selector: 'app-suggestions',
  imports: [RouterLink],
  templateUrl: './suggestions.html',
})
export class Suggestions implements OnInit {
  private readonly router = inject(Router);
  private readonly suggestionsService = inject(SuggestionsService);

  readonly defaultPhoto = DEFAULT_PROFILE_PHOTO;
  readonly users = signal<SuggestedUser[]>([]);
  readonly total = signal(200);
  readonly search = signal('');
  readonly initialLimit = 40;
  readonly batchSize = 20;
  readonly isLoading = signal(false);
  readonly isLoadingMore = signal(false);

  readonly filteredUsers = computed(() => {
    const term = this.search().trim().toLowerCase();
    const list = this.users();
    if (!term) return list;
    return list.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.username.toLowerCase().includes(term)
    );
  });

  readonly hasMore = computed(() => {
    return this.users().length < this.total();
  });

  ngOnInit(): void {
    this.loadInitial();
  }

  loadInitial(): void {
    this.isLoading.set(true);
    this.suggestionsService.getSuggestions(1, this.initialLimit).subscribe({
      next: (res) => {
        this.users.set(res.users);
        this.total.set(Math.max(res.total, 200));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  loadMore(): void {
    if (this.isLoadingMore() || !this.hasMore()) return;

    this.isLoadingMore.set(true);
    const nextPage = Math.floor(this.users().length / this.batchSize) + 1;

    this.suggestionsService.getSuggestions(nextPage, this.batchSize).subscribe({
      next: (res) => {
        this.users.update((prev) => [...prev, ...res.users]);
        this.total.set(Math.max(res.total, 200));
        this.isLoadingMore.set(false);
      },
      error: () => {
        this.isLoadingMore.set(false);
      },
    });
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  toggleFollow(user: SuggestedUser): void {
    const isNowFollowing = this.suggestionsService.toggleFollow(user);
    user.isFollowing = isNowFollowing;
    user.followers = isNowFollowing ? user.followers + 1 : Math.max(0, user.followers - 1);
  }

  isFollowing(userId: string): boolean {
    return this.suggestionsService.isFollowing(userId);
  }

  goBack(): void {
    this.router.navigate(['/feed']);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultPhoto;
  }
}
