import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SessionApiService } from './session-api.service';
import { Session } from '../interfaces/session.interface';

describe('SessionApiService Integration Tests', () => {
  let service: SessionApiService;
  let httpMock: HttpTestingController;
  const baseUrl = 'http://localhost:8080/api/session';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SessionApiService],
    });

    service = TestBed.inject(SessionApiService);
    httpMock = TestBed.inject(HttpTestingController);

    // Override the private pathService property to your expected API URL
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    service['pathService'] = baseUrl;
  });

  afterEach(() => {
    httpMock.verify(); // Verify no outstanding requests after each test
  });

  it('should fetch all sessions', () => {
    const mockSessions: Session[] = [
      { id: 1, name: 'Session 1', description: 'Desc 1', date: new Date(), teacher_id: 1, users: [] },
      { id: 2, name: 'Session 2', description: 'Desc 2', date: new Date(), teacher_id: 2, users: [] },
    ];

    service.all().subscribe(sessions => {
      expect(sessions.length).toBe(2);
      expect(sessions).toEqual(mockSessions);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockSessions);
  });

  it('should create a session', () => {
    const newSession: Session = {
      id: 0,
      name: 'Test Session',
      description: 'Created in test',
      date: new Date(),
      teacher_id: 1,
      users: []
    };

    const createdSession: Session = { ...newSession, id: 123 };

    service.create(newSession).subscribe(created => {
      expect(created.id).toBe(123);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    req.flush(createdSession);
  });

  it('should update a session', () => {
    const updatedSession: Session = {
      id: 123,
      name: 'Test Session',
      description: 'Updated description',
      date: new Date(),
      teacher_id: 1,
      users: []
    };

    service.update('123', updatedSession).subscribe(updated => {
      expect(updated.description).toBe('Updated description');
    });

    const req = httpMock.expectOne(`${baseUrl}/123`);
    expect(req.request.method).toBe('PUT');
    req.flush(updatedSession);
  });

  it('should delete a session', () => {
    service.delete('123').subscribe(() => {
      // success - no content returned
    });

    const req = httpMock.expectOne(`${baseUrl}/123`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

});
