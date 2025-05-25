import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';
import { User } from '../interfaces/user.interface';

describe('UserService (shallow integration)', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8080/api/user';

  const mockUser: User = {
    id: 1,
    email: 'john.doe@example.com',
    lastName: 'Doe',
    firstName: 'John',
    admin: false,
    password: 'hashed_password',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);

    // Override default path if needed (for full endpoint clarity)
    // @ts-ignore
    service['pathService'] = baseUrl;
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding HTTP requests remain
  });

  it('should send GET request and return expected user', () => {
    service.getById('1').subscribe((user) => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should send DELETE request and return null', () => {
    service.delete('1').subscribe((response) => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
