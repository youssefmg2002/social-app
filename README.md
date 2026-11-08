# Route Posts — Social Media Application

A modern, responsive social media web application built with **Angular 21**, **Tailwind CSS**, and **Font Awesome**. Inspired by modern social network feeds, it features rich post creation, interactive comments with nested replies, real-time notifications, user profiles with customizable avatar & cover photos, friend suggestions, and bookmarks.

---

## 🚀 Features

### 🔐 Authentication & Account Management
- **User Registration & Login**: Full JWT authentication lifecycle with persistent sessions.
- **Auto-Token Interception**: HTTP interceptor automatically attaches `Bearer <token>` to all protected API calls.
- **Route Guards**: Protected application routes (`/feed`, `/profile`, `/notifications`, `/settings`, `/suggestions`) secured via `AuthGuard`.
- **Change Password**: Secure password update form (`/settings`) with instant validation and feedback.
- **Complete Logout**: Safely purges session tokens, user profile metadata, and clears local storage before redirecting to `/login`.

### 📰 Feed & Post Interactions
- **Multi-Category Feeds**:
  - **Feed**: Posts exclusively from users you follow.
  - **Community**: Global stream of all published posts across the platform.
  - **My Posts**: Quick filter to view your own published posts.
  - **Saved**: Access all bookmarked and favorited posts.
- **Rich Post Creation**:
  - Compose text updates with emoji picker integration.
  - Upload image attachments with live previews and removal controls.
  - Custom post privacy controls: **Public**, **Followers Only**, or **Only Me** (editable anytime).
- **Post Engagements**:
  - **Like / Unlike**: Real-time optimistic like counter updates.
  - **Bookmark / Save**: Instant post saving and retrieval.
  - **Share Posts**: Repost content with attribution.
  - **Edit & Delete**: Full control over your own posts with inline edit and delete confirmation modals.
  - **Dedicated Post Detail View**: View any post directly with full comments on `/posts/:id`.

### 💬 Comments & Nested Replies
- **Threaded Discussions**: Top-level comments with expandable/collapsible nested reply chains.
- **Interactive Engagements**: Like comments and replies with live counters.
- **Rich Comment Input**: Attach images and emojis to comments and replies.
- **Comment Management**: Authors can edit or delete their own comments and replies.
- **Smart Sorting**: Filter comments by **Most relevant**, **Newest**, and **Oldest**.

### 👤 Profile & Cover Customization
- **Own Profile (`/profile`) & Other Users' Profiles (`/profile/:id`)**:
  - Detailed user statistics: **Followers**, **Following**, **Bookmarks**, and **Posts Count**.
  - About info: Email, Gender, formatted Date of Birth (e.g. `Born Aug 23, 2002`), and Join Date.
  - Tabbed navigation between **My Posts** and **Saved** posts.
- **Profile Photo Customizer**:
  - Interactive crop modal with drag-to-reposition and zoom controls.
  - Set privacy for the automatically generated "Updated profile photo" feed post.
- **Cover Photo Management**:
  - Upload and update cover photos (`PUT /users/upload-cover`).
  - Remove cover photo via backend API (`DELETE /users/cover`).
  - Full-screen lightbox image preview for profile and cover photos.
- **Follow / Unfollow**: Toggle follow state directly from any user's profile card or header.

### 👥 Friend Suggestions (`/suggestions`)
- **Feed Sidebar Widget**: Quick suggestion list with live counters.
- **Full Suggestions Page**: Search members by name or username.
- **Dynamic Pagination**: Load more friends in increments of 20 with continuous scroll support.

### 🔔 Notifications (`/notifications`)
- **Activity Feed**: Real-time notifications for likes, comments, shares, and new followers.
- **Filters**: Quickly toggle between **All** and **Unread** notifications.
- **Direct Navigation**: Clicking a notification navigates directly to the referenced post.
- **Bulk Actions**: Mark all notifications as read in a single click.

---

## 🛠️ Tech Stack

- **Framework**: [Angular 21](https://angular.dev/) (Standalone Components, Signals, Reactive Architecture)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) with `@tailwindcss/postcss`
- **Icons**: [Font Awesome Free](https://fontawesome.com/) (Exclusively using icon font classes)
- **State & Reactivity**: Angular Signals & RxJS
- **HTTP**: Angular `HttpClient` with functional interceptors
- **Build Tooling**: Angular CLI & Vite/Vitest

---

## 📁 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── auth/
│   │   │   ├── guards/          # Route protection guards (authGuard)
│   │   │   └── services/        # AuthService (login, signup, session, profile)
│   │   ├── interceptors/        # headersInterceptor (Bearer token injection)
│   │   ├── models/              # TypeScript interfaces (Post, Comment, User, Notification)
│   │   └── services/            # PostsService, CommentsService, SuggestionsService, NotificationsService
│   ├── features/
│   │   ├── feed/                # Feed view, post creation, categories, sidebar widgets
│   │   ├── login/               # Sign in page
│   │   ├── register/            # Sign up page
│   │   ├── profile/             # Profile page, cover & avatar modals, user stats
│   │   ├── notifications/       # Notifications center with read/unread filters
│   │   ├── suggestions/         # Friend suggestions page with search & load more
│   │   ├── settings/            # Change password & account preferences
│   │   └── post-detail/         # Dedicated single post page (/posts/:id)
│   ├── layout/
│   │   └── user-layout/         # Main layout wrapper with responsive navbar
│   └── shared/
│       ├── components/          # Reusable UI components (post-card, post-comments, etc.)
│       └── constants/           # Global assets and fallback image URLs
└── environments/                # Base API endpoints & environment configurations
```

---

## 🔌 API Endpoints Reference

The application interfaces with the **Route LinkedPosts API**:

| Category | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/users/signup` | Register new user account |
| **Auth** | `POST` | `/users/signin` | Sign in & receive JWT token |
| **Auth** | `PATCH` | `/users/change-password` | Update account password |
| **User** | `GET` | `/users/profile-data` | Fetch current user profile & statistics |
| **User** | `PUT` | `/users/upload-photo` | Upload user profile picture |
| **User** | `PUT` | `/users/upload-cover` | Upload user cover picture |
| **User** | `DELETE`| `/users/cover` | Remove user cover picture |
| **Posts** | `GET` | `/posts` | Get paginated community posts |
| **Posts** | `GET` | `/posts/feed` | Get posts from followed users |
| **Posts** | `GET` | `/posts/:id` | Get single post details |
| **Posts** | `POST` | `/posts` | Create new post (multipart form-data) |
| **Posts** | `PUT` | `/posts/:id` | Update existing post |
| **Posts** | `DELETE`| `/posts/:id` | Delete post |
| **Engagement** | `PUT` | `/posts/:id/like` | Like or unlike a post |
| **Engagement** | `PUT` | `/posts/:id/bookmark` | Bookmark / save post |
| **Engagement** | `POST` | `/posts/:id/share` | Share post |
| **Comments** | `GET` | `/posts/:id/comments` | Fetch post comments |
| **Comments** | `POST` | `/posts/:id/comments` | Add new comment or reply |
| **Comments** | `PUT` | `/posts/:id/comments/:commentId` | Edit comment |
| **Comments** | `DELETE`| `/posts/:id/comments/:commentId` | Delete comment |
| **Social** | `GET` | `/users/suggestions` | Get suggested friends |
| **Social** | `PUT` | `/users/:id/follow` | Follow a user |
| **Social** | `PUT` | `/users/:id/unfollow` | Unfollow a user |
| **Notifications** | `GET` | `/notifications` | Get user notifications list |
| **Notifications** | `PATCH` | `/notifications/mark-read` | Mark notifications as read |

---

## 💻 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher (v20+ recommended)
- **npm** or **pnpm**
- **Angular CLI**: v21.x (`npm install -g @angular/cli`)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/social-app.git
   cd social-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment:**
   Review `src/environments/environment.ts` and ensure the `baseUrl` points to your active backend API.

4. **Start Development Server:**
   ```bash
   npm start
   # or
   ng serve
   ```
   Navigate to `http://localhost:4200/`. The app will reload automatically when files are modified.

---

## 🏗️ Production Build

To build the optimized production artifacts:

```bash
npm run build
# or
ng build
```

Compiled production files will be output to the `dist/social-app` directory ready for deployment to any static host (Vercel, Netlify, Firebase, AWS S3/CloudFront, etc.).

---

## 🧪 Testing

Run unit tests via Vitest:

```bash
npm test
# or
ng test
```
