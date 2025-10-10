import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Credentials, Role } from '@features/login/models/credentials.model';
import { toObservable } from '@angular/core/rxjs-interop';
import { catchError, Observable, switchMap, tap, throwError } from 'rxjs';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';

const KEY_STORAGE = 'credentials';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private storage = window.localStorage;

  private apiUrl = 'http://localhost:8000/api/v1'; //ALTERAR PARA ONDE ESTIVER A API

  credentials = signal<Credentials | null>(null);
  credentials$ = toObservable(this.credentials);
  isStudent = computed(() => this.credentials()?.role === Role.STUDENT)
  isPublic = computed(() => !this.credentials() || this.credentials()?.role === Role.PUBLIC);

  constructor() {
    const savedCredentials = this.storage.getItem(KEY_STORAGE);
    if (savedCredentials) {
      this.credentials.set(JSON.parse(savedCredentials));
    }
  }

  login(loginData: any): Observable<Credentials> {
  const body = new FormData();
  body.append('username', loginData.username);
  body.append('password', loginData.password);

  return this.http.post<any>(`${this.apiUrl}/auth/login`, body).pipe(
    switchMap(response => {
      const token = response.access_token;
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      return this.http.get<any>(`${this.apiUrl}/auth/me`, { headers }).pipe(
        tap(user => {
          const fullCredentials: Credentials = {
            accessToken: token,
            
            role: user.is_admin ? Role.ADMIN : Role.STUDENT,
            ...user
          };
          this.setCredentials(fullCredentials);
        })
      );
    }),
    catchError((error) => {
      return throwError(() => error); 
    })
  );
}

  setCredentials(credentials: Credentials): void {
    this.credentials.set(credentials);
    this.storage.setItem(KEY_STORAGE, JSON.stringify(credentials));
  }

  logout(redirect = true): void {
    this.credentials.set(null);
    this.storage.removeItem(KEY_STORAGE);
    if (redirect) this.router.navigate(['/login']);
  }

  get isAuthenticated(): boolean {
    return !!this.credentials()?.accessToken;
  }

  canActivate(): boolean {
    if (!this.isAuthenticated) {
        this.router.navigate(['/login']);
    }
    return this.isAuthenticated;
  }

  canActivateByRole(role: Role): boolean {
    if (!this.isAuthenticated || this.credentials()?.role !== role) {
        this.router.navigate(['/login']);
        return false;
    }

    return true;
  }
}

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return inject(AuthService).canActivate();
};

export const authGuardStudent: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return inject(AuthService).canActivateByRole(Role.STUDENT);
};