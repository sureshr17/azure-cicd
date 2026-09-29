import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-profile-upload',
  standalone: true,
  templateUrl: './profile-upload.component.html',
  styleUrl: './profile-upload.component.css',
})
export class ProfileUploadComponent {
  @Input() imageUrl: string | null = null;
  @Output() readonly imageUrlChange = new EventEmitter<string | null>();
  errorMessage = '';

  private readonly maxFileSize = 5 * 1024 * 1024;

  onFileSelected(event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.errorMessage = '';
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Choose an image file.';
      input.value = '';
      return;
    }

    if (file.size > this.maxFileSize) {
      this.errorMessage = 'The image must be 5 MB or smaller.';
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        this.errorMessage = 'The image could not be read. Choose another file.';
        return;
      }

      this.imageUrlChange.emit(reader.result);
      input.value = '';
    };
    reader.onerror = () => {
      this.errorMessage = 'The image could not be read. Choose another file.';
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  removeImage(input: HTMLInputElement): void {
    this.imageUrlChange.emit(null);
    this.errorMessage = '';
    input.value = '';
  }
}