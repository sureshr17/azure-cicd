import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private users: User[] | null = null;
  private usersRequest$: Observable<void> | null = null;

  getAllUsers(): Observable<User[]> {
    return this.loadUsers().pipe(map(() => (this.users ?? []).map((user) => ({ ...user }))));
  }

  getUserById(id: number): Observable<User | undefined> {
    return this.getAllUsers().pipe(map((users) => users.find((user) => user.id === id)));
  }

  addUser(userDetails: Omit<User, 'id'>): Observable<User> {
    return this.getAllUsers().pipe(
      map((users) => {
        const user: User = {
          ...userDetails,
          id: Math.max(0, ...users.map((currentUser) => currentUser.id)) + 1,
        };
        this.users = [...users, user];
        return { ...user };
      }),
    );
  }

  updateUser(user: User, originalId: number = user.id): Observable<User> {
    return this.getAllUsers().pipe(
      map((users) => {
        const userIndex = users.findIndex((currentUser) => currentUser.id === originalId);
        if (userIndex < 0) {
          throw new Error('The user could not be found.');
        }
        if (users.some((currentUser) => currentUser.id === user.id && currentUser.id !== originalId)) {
          throw new Error('That user ID is already in use.');
        }

        const updatedUsers = [...users];
        updatedUsers[userIndex] = { ...user };
        this.users = updatedUsers;
        return { ...user };
      }),
    );
  }

  private loadUsers(): Observable<void> {
    if (!this.usersRequest$) {
      this.usersRequest$ = this.http.get<User[]>('assets/users.json').pipe(
        tap((users) => (this.users = users)),
        map(() => undefined),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.usersRequest$;
  }
}