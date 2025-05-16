import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { BehaviorSubject } from 'rxjs';
import { SessionService } from './session.service';
import { SessionInformation } from '../interfaces/sessionInformation.interface';

describe('SessionService', () => {
  let service: SessionService;

  const mockSessionInformation: SessionInformation = {
    token: 'sample-token',
    type: 'Bearer',
    id: 1,
    username: 'johndoe',
    firstName: 'John',
    lastName: 'Doe',
    admin: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should be logged out initially', (done) => {
    service.$isLogged().subscribe((isLogged) => {
      expect(isLogged).toBe(false);
      done();
    });
  });

  it('should log in the user', (done) => {
    service.logIn(mockSessionInformation);

    service.$isLogged().subscribe((isLogged) => {
      expect(isLogged).toBe(true);
      expect(service.sessionInformation).toEqual(mockSessionInformation);
      done();
    });
  });

  it('should log out the user', (done) => {
    // First, log the user in
    service.logIn(mockSessionInformation);

    // Now log the user out
    service.logOut();

    service.$isLogged().subscribe((isLogged) => {
      expect(isLogged).toBe(false);
      expect(service.sessionInformation).toBeUndefined();
      done();
    });
  });

  it('should update the login state when logged in or out', (done) => {
    // Test logging in
    service.logIn(mockSessionInformation);
    service.$isLogged().subscribe((isLogged) => {
      expect(isLogged).toBe(true);
    });

    // Test logging out
    service.logOut();
    service.$isLogged().subscribe((isLogged) => {
      expect(isLogged).toBe(false);
      done();
    });
  });
});
