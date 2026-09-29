import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { UserCreateComponent } from './user-create.component';

const createdUser: User = {
  id: 3,
  name: 'Katherine Johnson',
  email: 'katherine@example.com',
  phone: '555-0102',
  city: 'Hampton',
  department: 'Research',
};

describe('UserCreateComponent', () => {
  let fixture: ComponentFixture<UserCreateComponent>;
  let userService: { addUser: jasmine.Spy };
  let router: {
    navigate: jasmine.Spy;
    createUrlTree: jasmine.Spy;
    serializeUrl: jasmine.Spy;
  };

  beforeEach(async () => {
    userService = { addUser: jasmine.createSpy().and.returnValue(of(createdUser)) };
    router = {
      navigate: jasmine.createSpy(),
      createUrlTree: jasmine.createSpy().and.returnValue([]),
      serializeUrl: jasmine.createSpy().and.returnValue('/users'),
    };

    await TestBed.configureTestingModule({
      imports: [UserCreateComponent],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: UserService, useValue: userService },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCreateComponent);
    fixture.detectChanges();
  });

  it('should mark required fields as touched without adding an incomplete user', () => {
    fixture.componentInstance.save();

    expect(fixture.componentInstance.form.controls.name.touched).toBe(true);
    expect(userService.addUser).not.toHaveBeenCalled();
  });

  it('should add a valid user and return to the directory', () => {
    fixture.componentInstance.form.setValue({
      name: 'Katherine Johnson',
      email: 'katherine@example.com',
      phone: '555-0102',
      city: 'Hampton',
      department: 'Research',
    });

    fixture.componentInstance.save();

    expect(userService.addUser).toHaveBeenCalledWith({
      name: 'Katherine Johnson',
      email: 'katherine@example.com',
      phone: '555-0102',
      city: 'Hampton',
      department: 'Research',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/users'], {
      state: { successMessage: 'Katherine Johnson was added successfully.' },
    });
  });
});