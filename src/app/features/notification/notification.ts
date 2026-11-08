import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AppNotification, NotificationsService, NotificationType } from '../../core/services/notifications.service';
import { DEFAULT_PROFILE_PHOTO } from '../../shared/constants';
import { TimeAgoPipe } from '../../shared/pipes/time-ago.pipe';

type FilterType = 'all' | 'unread';

@Component({
  selector: 'app-notification',
  imports: [RouterLink, TimeAgoPipe],
  templateUrl: './notification.html',
  styleUrl: './notification.css',
})
export class Notification implements OnInit {
  private readonly router = inject(Router);
  private readonly notificationsService = inject(NotificationsService);

  readonly defaultPhoto = DEFAULT_PROFILE_PHOTO;
  readonly notifications = signal<AppNotification[]>([]);
  readonly filter = signal<FilterType>('all');
  readonly isLoading = signal(false);

  readonly filteredNotifications = computed(() => {
    const list = this.notifications();
    if (this.filter() === 'unread') {
      return list.filter((n) => !n.isRead);
    }
    return list;
  });

  readonly unreadCount = computed(() => {
    return this.notifications().filter((n) => !n.isRead).length;
  });

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);
    this.notificationsService.getNotifications().subscribe({
      next: (data) => {
        this.notifications.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  setFilter(filter: FilterType): void {
    this.filter.set(filter);
  }

  onNotificationClick(item: AppNotification): void {
    if (!item.isRead) {
      this.markOneAsRead(item);
    }

    if (item.postId) {
      this.router.navigate(['/posts', item.postId]);
    } else if (item.actor?._id) {
      this.router.navigate(['/profile', item.actor._id]);
    }
  }

  markOneAsRead(item: AppNotification, event?: MouseEvent): void {
    if (event) event.stopPropagation();
    if (item.isRead) return;

    this.notifications.update((list) =>
      list.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
    );

    this.notificationsService.markAsRead(item._id).subscribe();
  }

  markAllAsRead(): void {
    if (this.unreadCount() === 0) return;

    this.notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
    this.notificationsService.markAllAsRead().subscribe();
  }

  actionText(item: AppNotification): string {
    switch (item.type) {
      case 'share':
        return 'shared your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'like':
      default:
        return 'liked your post';
    }
  }

  badgeColor(type: NotificationType): string {
    switch (type) {
      case 'share':
        return 'text-emerald-600';
      case 'comment':
        return 'text-[#1877f2]';
      case 'follow':
        return 'text-indigo-600';
      case 'like':
      default:
        return 'text-rose-500';
    }
  }

  badgeIcon(type: NotificationType): string {
    switch (type) {
      case 'share':
        return 'fa-solid fa-repeat';
      case 'comment':
        return 'fa-solid fa-message';
      case 'follow':
        return 'fa-solid fa-user-plus';
      case 'like':
      default:
        return 'fa-solid fa-heart';
    }
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = this.defaultPhoto;
  }
}
