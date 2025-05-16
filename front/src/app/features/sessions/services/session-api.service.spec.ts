// import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';

import { SessionApiService } from './session-api.service';
import { Session } from '../interfaces/session.interface';  // Import Session interface

describe('SessionsService', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;

  const mockSession: Session = {
      id: 1,
      name: 'Math 101',
      description: 'Basic Math Course',
      date: new Date(),
      teacher_id: 1,
      users: [1, 2, 3],
    };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[
        HttpClientTestingModule
      ],
      providers: [SessionApiService],
    });
    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verifies that no HTTP requests are pending
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

it('should fetch all sessions', () => {
    service.all().subscribe(sessions => {
      expect(sessions).toEqual([mockSession]); // Simulate mock response
    });

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('GET');
    req.flush([mockSession]); // Mock the response
  });

  it('should fetch session details by id', () => {
    const sessionId = '1';

    service.detail(sessionId).subscribe(session => {
      expect(session).toEqual(mockSession);
    });

    const req = httpMock.expectOne(`api/session/${sessionId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSession); // Mock the response
  });

  it('should create a session', () => {
    const newSession: Session = { ...mockSession, id: undefined };

    service.create(newSession).subscribe(session => {
      expect(session).toEqual(mockSession);
    });

    const req = httpMock.expectOne('api/session');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newSession);
    req.flush(mockSession); // Mock the response
  });

  it('should update a session', () => {
    const sessionId = '1';
    const updatedSession: Session = { ...mockSession, description: 'Updated description' };

    service.update(sessionId, updatedSession).subscribe(session => {
      expect(session).toEqual(updatedSession);
    });

    const req = httpMock.expectOne(`api/session/${sessionId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedSession);
    req.flush(updatedSession); // Mock the response
  });

  it('should delete a session', () => {
    const sessionId = '1';

    service.delete(sessionId).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`api/session/${sessionId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null); // Mock the response
  });

  it('should allow a user to participate in a session', () => {
    const sessionId = '1';
    const userId = '2';

    service.participate(sessionId, userId).subscribe(response => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
    expect(req.request.method).toBe('POST');
    req.flush(null); // Mock the response
  });

  it('should allow a user to unparticipate in a session', () => {
    const sessionId = '1';
    const userId = '2';

    service.unParticipate(sessionId, userId).subscribe(response => {
      expect(response).toBeUndefined();
    });

    const req = httpMock.expectOne(`api/session/${sessionId}/participate/${userId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null); // Mock the response
  });
});
