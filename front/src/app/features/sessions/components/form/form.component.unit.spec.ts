import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {  ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { Session } from '../../interfaces/session.interface';


import { FormComponent } from './form.component';

// dummy component for the route
@Component({ template: '' })
class DummyComponent {}

describe('FormComponent Unit Tests', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;
  let router: Router;

  const mockSessionService = {
    sessionInformation: {
      admin: true,
      id: 1
    }
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: jest.fn().mockReturnValue('1')
      }
    }
  };

  const mockSession: Session = {
   id: 1,
   name: 'Mock Session',
   description: 'Test description',
   date: new Date('2025-06-01T00:00:00Z'),
   teacher_id: 42,
   users: []
  };


  beforeEach(async () => {
    await TestBed.configureTestingModule({

      imports: [
        RouterTestingModule.withRoutes([
          { path: 'sessions', component: DummyComponent }
        ]),
        HttpClientModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        MatSnackBarModule,
        MatSelectModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        SessionApiService
      ],
      declarations: [FormComponent]
    })
      .compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    if (!Element.prototype.animate) {
      Element.prototype.animate = jest.fn().mockReturnValue({
        play: jest.fn(),
        pause: jest.fn(),
        finish: jest.fn(),
        cancel: jest.fn(),
        reverse: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        onfinish: null,
        oncancel: null,
      });
    }

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect non-admin users on init', () => {
    const originalAdmin = mockSessionService.sessionInformation.admin;
    mockSessionService.sessionInformation.admin = false;

    component.ngOnInit();

    expect(router.navigate).toHaveBeenCalledWith(['/sessions']);
    mockSessionService.sessionInformation.admin = originalAdmin; // restore
  });


   it('should initialize form with session data in update mode', () => {
     // Force update mode by mocking the URL and route param
     jest.spyOn(router, 'url', 'get').mockReturnValue('/sessions/update/1');

     const route = TestBed.inject(ActivatedRoute);
     jest.spyOn(route.snapshot.paramMap, 'get').mockReturnValue('1');

     const sessionApiService = TestBed.inject(SessionApiService);
     jest.spyOn(sessionApiService, 'detail').mockReturnValue({
       subscribe: (fn: (s: Session) => void) => fn(mockSession)
     } as any);

     // Act
     component.ngOnInit();

     // Assert
     expect(component.onUpdate).toBe(true);
     expect(component.sessionForm?.value).toEqual({
       name: mockSession.name,
       date: '2025-06-01', // formatted for form input
       teacher_id: mockSession.teacher_id,
       description: mockSession.description
     });
   });

  it('should create session and navigate on submit in create mode', () => {
    const sessionApiService = TestBed.inject(SessionApiService);
    jest.spyOn(sessionApiService, 'create').mockReturnValue({
      subscribe: (cb: (s: Session) => void) => cb(mockSession)
    } as any);

    const snackSpy = jest.spyOn(TestBed.inject(MatSnackBar), 'open');

    // Set form values (omit id, convert date to string format)
    component.sessionForm?.setValue({
      name: mockSession.name,
      description: mockSession.description,
      date: '2025-06-01',
      teacher_id: mockSession.teacher_id
    });

    component.submit();

    expect(sessionApiService.create).toHaveBeenCalled();
    expect(snackSpy).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
    expect(router.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('should call update and exitPage with success message when submitting in update mode', () => {
    // Arrange
    // Mock router URL to simulate update mode
    jest.spyOn(router, 'url', 'get').mockReturnValue('/sessions/update/1');

    // Set the route param ID so component.id is set
    const route = TestBed.inject(ActivatedRoute);
    jest.spyOn(route.snapshot.paramMap, 'get').mockReturnValue('1');

    // Spy on detail() to set the form with mockSession data during ngOnInit
    const sessionApiService = TestBed.inject(SessionApiService);
    jest.spyOn(sessionApiService, 'detail').mockReturnValue({
      subscribe: (fn: (s: Session) => void) => fn(mockSession)
    } as any);

    // Spy on update() to simulate successful update observable
    const updateSpy = jest.spyOn(sessionApiService, 'update').mockReturnValue({
      subscribe: (fn: (s: Session) => void) => fn(mockSession)
    } as any);

    // Spy on exitPage method to verify it gets called with proper message
    const exitPageSpy = jest.spyOn(component as any, 'exitPage');

    // Initialize component to populate form and set id
    component.ngOnInit();

    // Update form value for submit
    component.sessionForm?.setValue({
      name: mockSession.name,
      description: mockSession.description,
      date: '2025-06-01',
      teacher_id: mockSession.teacher_id
    });

    // Act: call submit() which should call update() inside
    component.submit();

    // Assert
    expect(updateSpy).toHaveBeenCalledWith('1', expect.objectContaining({
      name: mockSession.name,
      description: mockSession.description,
      teacher_id: mockSession.teacher_id,
      date: '2025-06-01'
    }));
    expect(exitPageSpy).toHaveBeenCalledWith('Session updated !');
  });


});
