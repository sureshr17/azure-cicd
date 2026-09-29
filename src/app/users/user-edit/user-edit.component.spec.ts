import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { UserEditComponent } from './user-edit.component';

const user: User = {
  id: 1,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  phone: '555-0100',
  city: 'London',
  department: 'Engineering',
};

describe('UserEditComponent', () => {
  let fixture: ComponentFixture<UserEditComponent>;
  let userService: {
    getUserById: jasmine.Spy;
    updateUser: jasmine.Spy;
  };
  let router: { navigate: jasmine.Spy };
  let route: { snapshot: { paramMap: { get: jasmine.Spy } } };

  function createComponent(routeId = '1'): void {
    route.snapshot.paramMap.get.and.returnValue(routeId);
    fixture = TestBed.createComponent(UserEditComponent);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    userService = {
      getUserById: jasmine.createSpy().and.returnValue(of(user)),
      updateUser: jasmine.createSpy().and.returnValue(of(user)),
    };
    router = { navigate: jasmine.createSpy() };
    route = {
      snapshot: { paramMap: { get: jasmine.createSpy() } },
    };

    await TestBed.configureTestingModule({
      imports: [UserEditComponent],
      providers: [
        { provide: UserService, useValue: userService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: route },
      ],
    }).compileComponents();
  });

  it('should create and populate the form with the requested user', () => {
    createComponent();

    expect(fixture.componentInstance).toBeTruthy();
    expect(fixture.componentInstance.form.getRawValue()).toEqual(user);
    expect(userService.getUserById).toHaveBeenCalledWith(1);
    expect(fixture.nativeElement.textContent).toContain('User information');
  });

  it('should show an error and skip loading for an invalid user ID', () => {
    createComponent('invalid');

    const element = fixture.nativeElement as HTMLElement;

    expect(userService.getUserById).not.toHaveBeenCalled();
    expect(fixture.componentInstance.errorMessage).toBe('The requested user ID is invalid.');
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('invalid');
  });

  it('should show an error when the user does not exist', () => {
    userService.getUserById.and.returnValue(of(undefined));
    createComponent();

    expect(fixture.componentInstance.errorMessage).toBe('This user could not be found.');
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('should show an error when loading fails', () => {
    userService.getUserById.and.returnValue(throwError(() => new Error('load failed')));
    createComponent();

    expect(fixture.componentInstance.errorMessage).toBe('User records could not be loaded. Please try again.');
  });

  it('should mark an invalid form as touched without saving', () => {
    createComponent();
    fixture.componentInstance.form.controls.name.setValue('');

    fixture.componentInstance.save();

    expect(fixture.componentInstance.form.controls.name.touched).toBe(true);
    expect(userService.updateUser).not.toHaveBeenCalled();
  });

  it('should save valid changes and navigate to the user list', () => {
    createComponent();
    fixture.componentInstance.form.patchValue({ name: 'Augusta King' });

    fixture.componentInstance.save();

    expect(userService.updateUser).toHaveBeenCalledWith(
      { ...user, name: 'Augusta King' },
      1,
    );
    expect(router.navigate).toHaveBeenCalledWith(['/users'], {
      state: { successMessage: 'Augusta King was updated successfully.' },
    });
  });

  it('should show the service error when saving fails', () => {
    userService.updateUser.and.returnValue(throwError(() => new Error('duplicate ID')));
    createComponent();

    fixture.componentInstance.save();

    expect(fixture.componentInstance.saving).toBe(false);
    expect(fixture.componentInstance.errorMessage).toBe('duplicate ID');
  });
});
