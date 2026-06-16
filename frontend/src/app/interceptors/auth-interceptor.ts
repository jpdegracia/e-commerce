import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Grab the token from local storage safely
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // If we have a token, clone the request and attach it to the headers
  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  // If no token (like logging in or registering), just send the normal request
  return next(req);
};