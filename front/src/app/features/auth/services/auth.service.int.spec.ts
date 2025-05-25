import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { RegisterRequest } from '../interfaces/registerRequest.interface';
import { LoginRequest } from '../interfaces/loginRequest.interface';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';

describe('AuthService Integration Tests', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockRegisterRequest: RegisterRequest = {
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    password: 'password123',
  };

  const mockLoginRequest: LoginRequest = {
    email: 'john.doe@example.com',
    password: 'password123',
  };

  const mockSession: SessionInformation = {
    token: 'mock-token',
    type: 'Bearer',
    id: 1,
    username: 'john.doe',
    firstName: 'John',
    lastName: 'Doe',
    admin: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensures that no HTTP calls are left open
  });

  it('should register the user', (done) => {
    service.register(mockRegisterRequest).subscribe({
      next: (response) => {
        expect(response).toBeNull(); // Matches what req.flush(null) returns
        done();
      },
      error: (err) => {
        fail(err);
        done();
      },
    });

    const req = httpMock.expectOne('api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockRegisterRequest);
    req.flush(null); // Simulate void response
  });


  it('should login and return session information', (done) => {
    service.login(mockLoginRequest).subscribe({
      next: (session) => {
        expect(session).toEqual(mockSession);
        done();
      },
      error: (err) => {
        fail(err);
        done();
      },
    });

    const req = httpMock.expectOne('api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockLoginRequest);
    req.flush(mockSession); // simulate valid response
  });

});
