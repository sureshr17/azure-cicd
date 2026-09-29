import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-create.component.html',
  styleUrl: './user-create.component.css',
})
export class UserCreateComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userService = inject(UserService);

  readonly form = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    city: ['', Validators.required],
    department: ['', Validators.required],
  });

  saving = false;
  errorMessage = '';

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    this.userService.addUser(this.form.getRawValue()).subscribe({
      next: (user) => {
        this.router.navigate(['/users'], {
          state: { successMessage: `${user.name} was added successfully.` },
        });
      },
      error: (error: unknown) => {
        this.saving = false;
        this.errorMessage = error instanceof Error ? error.message : 'The user could not be added.';
      },
    });
  }
}