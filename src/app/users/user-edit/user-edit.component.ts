import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-edit.component.html',
  styleUrl: './user-edit.component.css',
})
export class UserEditComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  readonly form = this.formBuilder.nonNullable.group({
    id: [0, [Validators.required, Validators.min(1), Validators.pattern(/^[1-9]\d*$/)]],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    city: ['', Validators.required],
    department: ['', Validators.required],
  });

  loading = true;
  saving = false;
  errorMessage = '';
  private originalId = 0;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.loading = false;
      this.errorMessage = 'The requested user ID is invalid.';
      return;
    }

    this.originalId = id;
    this.userService.getUserById(id).subscribe({
      next: (user) => {
        this.loading = false;
        if (!user) {
          this.errorMessage = 'This user could not be found.';
          return;
        }
        this.form.patchValue(user);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'User records could not be loaded. Please try again.';
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    const updatedUser: User = this.form.getRawValue();
    this.userService.updateUser(updatedUser, this.originalId).subscribe({
      next: () => {
        this.router.navigate(['/users'], {
          state: { successMessage: `${updatedUser.name} was updated successfully.` },
        });
      },
      error: (error: unknown) => {
        this.saving = false;
        this.errorMessage = error instanceof Error ? error.message : 'The user could not be saved.';
      },
    });
  }
}