import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailComponent } from './detail.component';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { SessionService } from '../../../../services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { TeacherService } from '../../../../services/teacher.service';

import { ReactiveFormsModule } from '@angular/forms';  // <-- Import ReactiveFormsModule here

describe('DetailComponent Integration Tests', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;

  let mockSessionApiService: jest.Mocked<SessionApiService>;
  let mockTeacherService: jest.Mocked<TeacherService>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;
  let mockRouter: jest.Mocked<Router>;

  const session = {
    id: '123',
    teacher_id: 42,
    users: [1]
  };

  const teacher = {
    id: 42,
    name: 'Mr. Mock'
  };

  const mockSessionService: Partial<SessionService> = {
    sessionInformation: {
      id: 1,
      admin: true,
      token: 'mock-token',
      type: 'user',
      username: 'mockuser',
      firstName: 'Mock',
      lastName: 'User'
    }
  };

  beforeEach(async () => {
    mockSessionApiService = {
      detail: jest.fn().mockReturnValue(of(session)),
      delete: jest.fn().mockReturnValue(of(undefined)),
      participate: jest.fn().mockReturnValue(of(undefined)),
      unParticipate: jest.fn().mockReturnValue(of(undefined))
    } as unknown as jest.Mocked<SessionApiService>;

    mockTeacherService = {
      detail: jest.fn().mockReturnValue(of(teacher))
    } as unknown as jest.Mocked<TeacherService>;

    mockSnackBar = {
      open: jest.fn()
    } as unknown as jest.Mocked<MatSnackBar>;

    mockRouter = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      declarations: [DetailComponent],
      imports: [
        ReactiveFormsModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule
      ],
      providers: [
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '123'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch session/teacher', () => {
    expect(mockSessionApiService.detail).toHaveBeenCalledWith('123');
    expect(mockTeacherService.detail).toHaveBeenCalledWith('42');
    expect(component.session).toEqual(session);
    expect(component.teacher).toEqual(teacher);
    expect(component.isParticipate).toBe(true);
    expect(component.isAdmin).toBe(true);
  });

  it('should participate and refetch session', () => {
    component.participate();
    expect(mockSessionApiService.participate).toHaveBeenCalledWith('123', '1');
    expect(mockSessionApiService.detail).toHaveBeenCalledTimes(2);
  });

  it('should unParticipate and refetch session', () => {
    component.unParticipate();
    expect(mockSessionApiService.unParticipate).toHaveBeenCalledWith('123', '1');
    expect(mockSessionApiService.detail).toHaveBeenCalledTimes(2);
  });

  it('should delete the session and navigate', () => {
    component.delete();
    expect(mockSessionApiService.delete).toHaveBeenCalledWith('123');
    expect(mockSnackBar.open).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('should call window.history.back when back is called', () => {
    const backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    component.back();
    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });
});
