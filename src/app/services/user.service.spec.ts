import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { User } from '../models/user.model';
import { UserService } from './user.service';

const users: User[] = [
  {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    phone: '555-0100',
    city: 'London',
    department: 'Engineering',
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

describe('UserService', () => {
  let service: UserService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UserService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function respondWithUsers(): void {
    const request = httpTesting.expectOne('assets/users.json');
    expect(request.request.method).toBe('GET');
    request.flush(users);
  }

  it('should load all users from the assets file', () => {
    let result: User[] | undefined;
    service.getAllUsers().subscribe((loadedUsers) => (result = loadedUsers));

    respondWithUsers();

    expect(result).toEqual(users);
  });

  it('should cache the users file for later requests', () => {
    service.getAllUsers().subscribe();
    respondWithUsers();

    let result: User[] | undefined;
    service.getAllUsers().subscribe((loadedUsers) => (result = loadedUsers));

    expect(result).toEqual(users);
    httpTesting.expectNone('assets/users.json');
  });

  it('should return a user by ID', () => {
    let result: User | undefined;
    service.getUserById(2).subscribe((user) => (result = user));

    respondWithUsers();

    expect(result).toEqual(users[1]);
  });

  it('should add a user with the next available ID', () => {
    const userDetails = {
      name: 'Katherine Johnson',
      email: 'katherine@example.com',
      phone: '555-0102',
      city: 'Hampton',
      department: 'Research',
    };
    let result: User | undefined;
    service.addUser(userDetails).subscribe((user) => (result = user));
    respondWithUsers();

    expect(result).toEqual({ ...userDetails, id: 3 });
    service.getAllUsers().subscribe((loadedUsers) => expect(loadedUsers.at(-1)).toEqual(result));
  });

  it('should update an existing user using the original ID', () => {
    const updatedUser = { ...users[0], id: 3, name: 'Augusta King' };
    let result: User | undefined;
    service.updateUser(updatedUser, users[0].id).subscribe((updated) => (result = updated));
    respondWithUsers();

    expect(result).toEqual(updatedUser);
    service.getAllUsers().subscribe((loadedUsers) => (result = loadedUsers[0]));
    expect(result).toEqual(updatedUser);
  });

  it('should reject an update when the new ID is already in use', () => {
    let error: unknown;
    service.updateUser({ ...users[0], id: users[1].id }, users[0].id).subscribe({
      error: (updateError) => (error = updateError),
    });
    respondWithUsers();

    expect(error).toEqual(new Error('That user ID is already in use.'));
  });

  it('should reject an update when the original user does not exist', () => {
    let error: unknown;
    service.updateUser(users[0], 99).subscribe({
      error: (updateError) => (error = updateError),
    });
    respondWithUsers();

    expect(error).toEqual(new Error('The user could not be found.'));
  });
});
