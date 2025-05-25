// import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { UserService } from './user.service';
import { User } from '../interfaces/user.interface';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

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
      imports:[
        HttpClientTestingModule
      ],
      providers: [UserService],
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no pending requests are left after each test
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get user by id', () => {
      service.getById('1').subscribe((user) => {
        expect(user).toEqual(mockUser); // Expect the returned user to match the mock
      });

      const req = httpMock.expectOne('api/user/1'); // Expect the API call
      expect(req.request.method).toBe('GET'); // Ensure it's a GET request
      req.flush(mockUser); // Respond with the mock user
    });

    it('should delete user by id', () => {
      service.delete('1').subscribe((response) => {
        expect(response).toBeNull(); // Expect the response to be null (assuming successful deletion)
      });

      const req = httpMock.expectOne('api/user/1'); // Expect the DELETE request
      expect(req.request.method).toBe('DELETE'); // Ensure it's a DELETE request
      req.flush(null); // Respond with null (successful delete)
    });




});
