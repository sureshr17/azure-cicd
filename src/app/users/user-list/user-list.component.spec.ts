import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { User } from '../../models/user.model';
import { UserService } from '../../services/user.service';
import { UserListComponent } from './user-list.component';

const users: User[] = [
  {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '555-0100',
    city: 'London',
    department: 'Engineering',
    photoUrl: 'data:image/png;base64,YWRh',
  },
  {
    id: 2,
    name: 'Grace Hopper',
    email: 'grace@example.com',
    phone: '555-0101',
    city: 'Arlington',
    department: 'Operations',
  },
];

describe('UserListComponent', () => {
  let fixture: ComponentFixture<UserListComponent>;
  let router: {
    getCurrentNavigation: jasmine.Spy;
    createUrlTree: jasmine.Spy;
    serializeUrl: jasmine.Spy;
  };

  function createComponent(userRecords: User[] = users): void {
    TestBed.overrideProvider(UserService, {
      useValue: { getAllUsers: () => of(userRecords) },
    });
    fixture = TestBed.createComponent(UserListComponent);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    router = {
      getCurrentNavigation: jasmine.createSpy().and.returnValue(null),
      createUrlTree: jasmine.createSpy().and.callFake((commands: unknown[]) => commands),
      serializeUrl: jasmine.createSpy().and.callFake((urlTree: unknown[]) => urlTree.join('/')),
    };

    await TestBed.configureTestingModule({
      imports: [UserListComponent],
      providers: [
        { provide: UserService, useValue: { getAllUsers: () => of(users) } },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: {} },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    createComponent();

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render user records and their edit links', () => {
    createComponent();

    const element = fixture.nativeElement as HTMLElement;
    const rows = element.querySelectorAll('tbody tr');
    const editLink = element.querySelector('.edit-link');

    expect(rows.length).toBe(2);
    expect(element.textContent).toContain('Ada Lovelace');
    expect(element.textContent).toContain('Engineering');
    expect(editLink?.getAttribute('href')).toBe('/users/edit/1');
    expect(element.textContent).toContain('2 records');
  });

  it('should render profile photos and initials when no photo is set', () => {
    createComponent();

    const element = fixture.nativeElement as HTMLElement;
    const photo = element.querySelector('.user-avatar[src]') as HTMLImageElement;
    const initial = element.querySelector('.avatar-initial');

    expect(photo.getAttribute('src')).toBe('data:image/png;base64,YWRh');
    expect(photo.alt).toBe('Ada Lovelace profile photo');
    expect(initial?.textContent?.trim()).toBe('G');
  });

  it('should link to the current add-user route', () => {
    createComponent();

    const addUserLink = fixture.nativeElement.querySelector('.add-user-link') as HTMLAnchorElement;

    expect(addUserLink.getAttribute('href')).toBe('/users/add');
  });

  it('should render the empty state when there are no users', () => {
    createComponent([]);

    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.empty-state')?.textContent).toContain('No user records found.');
    expect(element.textContent).toContain('0 records');
  });

  it('should render a success message from router navigation state', () => {
    router.getCurrentNavigation.and.returnValue({
      extras: { state: { successMessage: 'Ada Lovelace was updated successfully.' } },
    });
    createComponent();

    expect(fixture.nativeElement.textContent).toContain('Ada Lovelace was updated successfully.');
  });
});
