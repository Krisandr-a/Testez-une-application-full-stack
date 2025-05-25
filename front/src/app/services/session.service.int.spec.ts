import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { SessionInformation } from '../interfaces/sessionInformation.interface';

describe('SessionService Integration Tests', () => {
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
    TestBed.configureTestingModule({
      providers: [SessionService],
    });
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false initially from $isLogged', (done) => {
    service.$isLogged().subscribe((isLogged) => {
      expect(isLogged).toBe(false);
      done();
    });
  });

  it('should return true after login', (done) => {
    service.logIn(mockSessionInformation);
    service.$isLogged().subscribe((isLogged) => {
      expect(isLogged).toBe(true);
      expect(service.sessionInformation).toEqual(mockSessionInformation);
      done();
    });
  });

  it('should reset session state on logout', (done) => {
    service.logIn(mockSessionInformation);
    service.logOut();
    service.$isLogged().subscribe((isLogged) => {
      expect(isLogged).toBe(false);
      expect(service.sessionInformation).toBeUndefined();
      done();
    });
  });

  it('should toggle isLogged from true to false correctly', (done) => {
    const results: boolean[] = [];

    service.$isLogged().subscribe((isLogged) => {
      results.push(isLogged);
      if (results.length === 3) {
        expect(results).toEqual([false, true, false]);
        done();
      }
    });

    service.logIn(mockSessionInformation);
    service.logOut();
  });
});
