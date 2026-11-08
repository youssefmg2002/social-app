import { Routes } from '@angular/router';
import { Register } from './features/register/register';
import { AuthLayout } from './layout/auth-layout/auth-layout';
import { UserLayout } from './layout/user-layout/user-layout';
import { Login } from './features/login/login';
import { ForgetPassword } from './features/forget-password/forget-password';
import { Feed } from './features/feed/feed';
import { Profile } from './features/profile/profile';
import { NotFound } from './features/not-found/not-found';
import { Notification } from './features/notification/notification';
import { ChangePassword } from './features/change-password/change-password';
import { SinglePost } from './features/single-post/single-post';
import { Suggestions } from './features/suggestions/suggestions';
import { authGuard } from './core/guards/auth.guard';
import { logedGuard } from './core/guards/loged.guard';

export const routes: Routes = [
  {
    path: '',
    component: AuthLayout,
    canActivate: [logedGuard],
    children: [
      {
        path: 'register',
        component: Register,
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        component: Login,
      },
      {
        path: 'forgot-password',
        component: ForgetPassword,
      },
    ],
  },
  {
    path: '',
    component: UserLayout,
    canActivate: [authGuard],
    children: [
      {
        path: 'feed',
        component: Feed,
      },
      {
        path: '',
        redirectTo: 'feed',
        pathMatch: 'full',
      },
      {
        path: 'notifications',
        component: Notification,
      },
      {
        path: 'suggestions',
        component: Suggestions,
      },
      {
        path: 'profile',
        component: Profile,
      },
      {
        path: 'profile/:id',
        component: Profile,
      },
      {
        path: 'settings',
        component: ChangePassword,
      },
      {
        path: 'posts/:id',
        component: SinglePost,
      },
      {
        path: 'post/:id',
        redirectTo: 'posts/:id',
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'feed',
  },
];
