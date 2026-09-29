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

  it('should accept image files and reject non-image files', () => {
    const input = fixture.nativeElement.querySelector('input[type="file"]') as HTMLInputElement;
    const documentFile = new File(['not an image'], 'notes.txt', { type: 'text/plain' });
    Object.defineProperty(input, 'files', { value: [documentFile], configurable: true });
    input.dispatchEvent(new Event('change'));

    expect(input.accept).toBe('image/*');
    expect(fixture.componentInstance.errorMessage).toBe('Choose an image file.');
    expect(fixture.componentInstance.imageUrl).toBeNull();
  });
});