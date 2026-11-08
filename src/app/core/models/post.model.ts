/** Basic user info embedded inside a post (author). */
export interface PostUser {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface CommentCreator {
  _id: string;
  name: string;
  username?: string;
  photo?: string;
}

export interface CommentReply {
  _id: string;
  content?: string;
  body?: string;
  image?: string;
  commentCreator?: CommentCreator;
  user?: PostUser | CommentCreator;
  createdAt?: string;
  likes?: string[];
  likesCount?: number;
  isLiked?: boolean;
}

/**
 * Comment shown as `topComment` on a post.
 * Supports both `commentCreator` (standard Route Posts API) and `user`.
 */
export interface PostComment {
  _id: string;
  content?: string;
  body?: string;
  image?: string;
  commentCreator?: CommentCreator;
  user?: PostUser | CommentCreator;
  createdAt?: string;
  likes?: string[];
  likesCount?: number;
  repliesCount?: number;
  replies?: CommentReply[];
  isLiked?: boolean;
}

/** GET /posts/:postId/comments */
export interface CommentsData {
  comments?: PostComment[];
}

/** POST /posts/:postId/comments (sent as form-data) */
export interface CreateCommentPayload {
  content?: string;
  image?: File | null;
}

export interface Post {
  _id: string;
  id: string;
  body: string;
  image?: string;
  privacy: string;
  user: PostUser;
  sharedPost: Post | null;
  likes: string[];
  createdAt: string;
  commentsCount: number;
  topComment: PostComment | null;
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  bookmarked: boolean;
}

export interface PaginationMeta {
  currentPage: number;
  limit: number;
  total: number;
  numberOfPages: number;
  nextPage?: number | null;
}

export interface ApiMeta {
  feedMode?: string;
  pagination?: PaginationMeta;
}

/** Generic API envelope: { success, message, data, meta } */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface PostsData {
  posts: Post[];
}

export interface SinglePostData {
  post: Post;
}

/**
 * GET /users/bookmarks.
 * NOTE: the key holding the list is not confirmed yet, so both are allowed.
 */
export interface BookmarksData {
  bookmarks?: Post[];
  posts?: Post[];
}

export type PostPrivacy = 'public' | 'following' | 'only_me';

/** Body of POST /posts (sent as form-data) */
export interface CreatePostPayload {
  body?: string;
  image?: File | null;
  privacy?: PostPrivacy;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** Query params supported by GET /posts/feed */
export interface FeedParams extends PaginationParams {
  only?: 'following' | string;
  hasImage?: boolean;
  cursor?: string;
}

