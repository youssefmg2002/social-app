import { HttpInterceptorFn } from '@angular/common/http';

export const headersInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('userToken')?.replace(/^Bearer\s+/i, '') || '';

  req = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token || localStorage.getItem('userToken') || ''}`,
      token: token || localStorage.getItem('userToken') || '',
    },
  });

  return next(req);
};
