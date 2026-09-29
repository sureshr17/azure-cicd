import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileUploadComponent } from './profile-upload.component';

describe('ProfileUploadComponent', () => {
  let fixture: ComponentFixture<ProfileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileUploadComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileUploadComponent);
    fixture.detectChanges();
  });

  function selectFile(file: File): HTMLInputElement {
    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    return input;
  }

  it('should accept image files and reject non-image files', () => {
    const documentFile = new File(['not an image'], 'notes.txt', { type: 'text/plain' });
    const input = selectFile(documentFile);

    expect(input.accept).toBe('image/*');
    expect(fixture.componentInstance.errorMessage).toBe('Choose an image file.');
    expect(fixture.componentInstance.imageUrl).toBeNull();
    expect(input.value).toBe('');
  });

  it('should reject images larger than 5 MB', () => {
    const oversizedImage = {
      name: 'large.png',
      type: 'image/png',
      size: 5 * 1024 * 1024 + 1,
    } as File;
    const input = selectFile(oversizedImage);

    expect(fixture.componentInstance.errorMessage).toBe('The image must be 5 MB or smaller.');
    expect(input.value).toBe('');
  });

  it('should read a valid image and emit its data URL', (done) => {
    const image = new File(['image data'], 'avatar.png', { type: 'image/png' });
    const expectedPrefix = 'data:image/png;base64,';

    fixture.componentInstance.imageUrlChange.subscribe((imageUrl) => {
      expect(imageUrl).toMatch(new RegExp(`^${expectedPrefix}`));
      expect(fixture.componentInstance.errorMessage).toBe('');
      done();
    });

    selectFile(image);
  });

  it('should emit null when the selected image is removed', () => {
    const imageUrl = 'data:image/png;base64,aW1hZ2U=';
    fixture.componentRef.setInput('imageUrl', imageUrl);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    let emittedImageUrl: string | null | undefined;
    fixture.componentInstance.imageUrlChange.subscribe((value) => (emittedImageUrl = value));

    const removeButton = fixture.nativeElement.querySelector('.remove-image') as HTMLButtonElement;
    removeButton.click();

    expect(emittedImageUrl).toBeNull();
    expect(fixture.componentInstance.errorMessage).toBe('');
  });
});