import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProfileUploadComponent } from '../profile-upload/profile-upload.component';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [ProfileUploadComponent, ReactiveFormsModule, RouterLink],
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
  photoUrl: string | null = null;

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.errorMessage = '';
    const userDetails = this.photoUrl
      ? { ...this.form.getRawValue(), photoUrl: this.photoUrl }
      : this.form.getRawValue();
    this.userService.addUser(userDetails).subscribe({
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