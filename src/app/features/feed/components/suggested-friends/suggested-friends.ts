import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ALL_SUGGESTED_USERS, SuggestedUser, SuggestionsService } from '../../../../core/services/suggestions.service';
import { DEFAULT_PROFILE_PHOTO } from '../../../../shared/constants';

@Component({
  selector: 'app-suggested-friends',
  imports: [RouterLink],
  templateUrl: './suggested-friends.html',
  host: {
    class: 'block',
  },
})
export class SuggestedFriends implements OnInit {
  private readonly suggestionsService = inject(SuggestionsService);

  readonly defaultPhoto = DEFAULT_PROFILE_PHOTO;
  readonly visibleCount = 5;

  private pool: SuggestedUser[] = [];

  readonly friends = signal<SuggestedUser[]>([]);
  readonly totalAvailable = signal<number>(40);
  readonly search = signal('');

  readonly filteredFriends = computed(() => {
    const term = this.search().trim().toLowerCase();
    const list = this.friends();
    if (!term) return list;
    return list.filter(
      (f) => f.name.toLowerCase().includes(term) || f.username.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.suggestionsService.getSuggestions(1, 40).subscribe({
      next: (res) => {
        this.pool = [...res.users];
        this.totalAvailable.set(res.total);
        this.refillDisplay();
      },
      error: () => {
        this.pool = [...ALL_SUGGESTED_USERS];
        this.totalAvailable.set(ALL_SUGGESTED_USERS.length);
        this.refillDisplay();
      },
    });
  }

  followFriend(friend: SuggestedUser): void {
    // 1. Trigger follow action
    this.suggestionsService.followUser(friend._id).subscribe();

    // 2. Remove the followed user from current display
    const current = this.friends().filter((f) => f._id !== friend._id);

    // 3. Find next available un-followed friend to fill the gap
    const currentIds = new Set(current.map((f) => f._id));
    const nextFriend = this.pool.find(
      (u) => !this.suggestionsService.isFollowing(u._id) && !currentIds.has(u._id) && u._id !== friend._id
    );

    if (nextFriend) {
      current.push(nextFriend);
    }

    this.friends.set(current);
  }

  private refillDisplay(): void {
    const unFollowed = this.pool.filter((u) => !this.suggestionsService.isFollowing(u._id));
    this.friends.set(unFollowed.slice(0, this.visibleCount));
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultPhoto;
  }
}
