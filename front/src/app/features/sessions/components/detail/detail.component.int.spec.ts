import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';

import { DetailComponent } from './detail.component';
import { SessionService } from 'src/app/services/session.service';

@Component({ template: '' })
class DummyComponent {}

describe('DetailComponent Integration Tests (with mocked HTTP)', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockSessionInformation = {
    admin: true,
    id: 1
  };

  const mockSession = {
    id: '123',
    teacher_id: 42,
    users: [1]
  };

  const mockTeacher = {
    id: 42,
    name: 'Mr. Mock'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DetailComponent, DummyComponent],
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'sessions', component: DummyComponent }
        ]),
        HttpClientTestingModule,
        MatSnackBarModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        NoopAnimationsModule,
        ReactiveFormsModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '123'
              }
            }
          }
        },
        {
          provide: SessionService,
          useValue: { sessionInformation: mockSessionInformation }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges(); // triggers ngOnInit
  });

  afterEach(() => {
    httpMock.verify(); // verify all HTTP calls were handled
  });

  it('should fetch session and teacher on init', fakeAsync(() => {
    // Expect GET session
    const sessionReq = httpMock.expectOne(req => req.url === 'api/session/123' && req.method === 'GET');
    expect(sessionReq.request.method).toBe('GET');
    sessionReq.flush(mockSession);

    // Expect GET teacher
    const teacherReq = httpMock.expectOne(req => req.url === 'api/teacher/42' && req.method === 'GET');
    expect(teacherReq.request.method).toBe('GET');
    teacherReq.flush(mockTeacher);

    tick();

    expect(component.session).toEqual(mockSession);
    expect(component.teacher).toEqual(mockTeacher);
    expect(component.isParticipate).toBe(true);
  }));

  it('should participate and refetch session', fakeAsync(() => {
    component.participate();

    // POST participate
    const participateReq = httpMock.expectOne(req => req.url === 'api/session/123/participate/1' && req.method === 'POST');
    expect(participateReq.request.method).toBe('POST');
    participateReq.flush(null);

    // Multiple GET session requests after participation
    const sessionGetRequests = httpMock.match(req => req.url === 'api/session/123' && req.method === 'GET');
    sessionGetRequests.forEach(req => req.flush(mockSession));

    // Multiple GET teacher requests
    const teacherRequests = httpMock.match(req => req.url === 'api/teacher/42' && req.method === 'GET');
    teacherRequests.forEach(req => req.flush(mockTeacher));

    tick();

    expect(component.session).toEqual(mockSession);
  }));

  it('should unParticipate and refetch session', fakeAsync(() => {
    component.unParticipate();

    // DELETE unParticipate
    const unParticipateReq = httpMock.expectOne(req => req.url === 'api/session/123/participate/1' && req.method === 'DELETE');
    expect(unParticipateReq.request.method).toBe('DELETE');
    unParticipateReq.flush(null);

    // Multiple GET session requests after unparticipate
    const sessionGetRequests = httpMock.match(req => req.url === 'api/session/123' && req.method === 'GET');
    sessionGetRequests.forEach(req => req.flush(mockSession));

    // Multiple GET teacher requests
    const teacherRequests = httpMock.match(req => req.url === 'api/teacher/42' && req.method === 'GET');
    teacherRequests.forEach(req => req.flush(mockTeacher));

    tick();

    expect(component.session).toEqual(mockSession);
  }));

});
