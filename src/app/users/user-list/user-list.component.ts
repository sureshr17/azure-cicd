import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  readonly users$ = this.userService.getAllUsers();
  readonly successMessage = this.router.getCurrentNavigation()?.extras.state?.['successMessage'] as
    | string
    | undefined;
}