import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FormComponent } from './form.component';
import { SessionService } from 'src/app/services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { TeacherService } from 'src/app/services/teacher.service';
import { Session } from '../../interfaces/session.interface';

describe('FormComponent Integration Tests', () => {
  let component: FormComponent;
  let fixture: ComponentFixture<FormComponent>;

  const mockSession: Session = {
    id: 1,
    name: 'Test Session',
    description: 'A description',
    date: new Date('2025-06-01T00:00:00Z'),
    teacher_id: 42,
    users: []
  };

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

  const mockRouter = {
    navigate: jest.fn(),
    url: '/sessions/update/1'
  };

  const mockSessionApiService = {
    detail: jest.fn().mockReturnValue(of(mockSession)),
    create: jest.fn().mockReturnValue(of(mockSession)),
    update: jest.fn().mockReturnValue(of(mockSession))
  };

  const mockTeacherService = {
    all: jest.fn().mockReturnValue(of([]))
  };

  const mockSnackBar = {
    open: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule,
        MatSelectModule,
        BrowserAnimationsModule
      ],
      declarations: [FormComponent],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: MatSnackBar, useValue: mockSnackBar }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect if user is not admin', () => {
    mockSessionService.sessionInformation.admin = false;
    component.ngOnInit();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/sessions']);
    mockSessionService.sessionInformation.admin = true; // restore for other tests
  });

  it('should load session in update mode and populate form', () => {
    component.ngOnInit();
    expect(component.onUpdate).toBe(true);
    expect(component.sessionForm?.value).toEqual({
      name: mockSession.name,
      date: '2025-06-01',
      teacher_id: mockSession.teacher_id,
      description: mockSession.description
    });
  });

  it('should call create and navigate on submit in create mode', () => {
    component.onUpdate = false;

    component.sessionForm?.setValue({
      name: mockSession.name,
      description: mockSession.description,
      date: '2025-06-01',
      teacher_id: mockSession.teacher_id
    });

    component.submit();

    expect(mockSessionApiService.create).toHaveBeenCalled();
    expect(mockSnackBar.open).toHaveBeenCalledWith('Session created !', 'Close', { duration: 3000 });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('should call update and navigate on submit in update mode', () => {
    component.onUpdate = true;
    component['id'] = '1';

    component.sessionForm?.setValue({
      name: mockSession.name,
      description: mockSession.description,
      date: '2025-06-01',
      teacher_id: mockSession.teacher_id
    });

    component.submit();

    expect(mockSessionApiService.update).toHaveBeenCalledWith('1', {
      name: mockSession.name,
      description: mockSession.description,
      date: '2025-06-01',
      teacher_id: mockSession.teacher_id
    });

    expect(mockSnackBar.open).toHaveBeenCalledWith('Session updated !', 'Close', { duration: 3000 });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  });
});
