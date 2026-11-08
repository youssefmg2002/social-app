import { Component, inject, OnInit, signal } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PostsService } from '../../core/services/posts.service';
import { Post } from '../../core/models/post.model';
import { PostCard } from '../../shared/components/post-card/post-card';

@Component({
  selector: 'app-single-post',
  imports: [PostCard],
  templateUrl: './single-post.html',
  host: {
    class: 'block',
  },
})
export class SinglePost implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly postsService = inject(PostsService);

  postId = signal<string>('');
  post = signal<Post | null>(null);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.postId.set(id);
        this.loadPost(id);
      } else {
        this.errorMessage.set('Post not found.');
        this.isLoading.set(false);
      }
    });
  }

  loadPost(id = this.postId()): void {
    if (!id) return;
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.postsService.getSinglePost(id).subscribe({
      next: (res) => {
        const p = (res as any).data?.post || (res as any).post || res.data;
        if (p) {
          this.post.set(p);
        } else {
          this.errorMessage.set('Post not found.');
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err.error?.message || err.message || 'Could not load this post.'
        );
        this.isLoading.set(false);
      },
    });
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/feed']);
    }
  }

  onPostDeleted(): void {
    this.router.navigate(['/feed']);
  }
}

