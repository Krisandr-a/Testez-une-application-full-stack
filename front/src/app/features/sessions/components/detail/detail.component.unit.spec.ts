import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { RouterTestingModule, } from '@angular/router/testing';
import { Router, ActivatedRoute } from '@angular/router';

import { expect } from '@jest/globals';
import { of } from 'rxjs';

import { SessionService } from '../../../../services/session.service';
import { SessionApiService } from 'src/app/features/sessions/services/session-api.service';
import { TeacherService } from 'src/app/services/teacher.service';

import { DetailComponent } from './detail.component';


describe('DetailComponent', () => {
  let component: DetailComponent;
  let fixture: ComponentFixture<DetailComponent>;
  let service: SessionService;
  let mockSessionApiService: jest.Mocked<SessionApiService>;
  let mockTeacherService: jest.Mocked<TeacherService>;
  let mockRouter: jest.Mocked<Router>;
  let mockSnackBar: jest.Mocked<MatSnackBar>;

  const session = {
    id: '123',
    teacher_id: 42,
    users: [1]
  };

  const teacher = {
    id: 42,
    name: 'Mr. Mock'
  };

  const mockSessionService = {
    sessionInformation: {
      admin: true,
      id: 1
    }
  }

  beforeEach(async () => {
    mockSessionApiService = {
      detail: jest.fn().mockReturnValue(of(session)),
      delete: jest.fn().mockReturnValue(of(undefined)),
      participate: jest.fn().mockReturnValue(of(undefined)),
      unParticipate: jest.fn().mockReturnValue(of(undefined))
    } as Partial<SessionApiService> as jest.Mocked<SessionApiService>;

    mockTeacherService = {
      detail: jest.fn().mockReturnValue(of(teacher))
    } as Partial<TeacherService> as jest.Mocked<TeacherService>;

    mockRouter = {
      navigate: jest.fn()
    } as Partial<Router> as jest.Mocked<Router>;

    mockSnackBar = {
      open: jest.fn()
    } as Partial<MatSnackBar> as jest.Mocked<MatSnackBar>;



    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatSnackBarModule,
        ReactiveFormsModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule
      ],
      declarations: [DetailComponent],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: mockSessionApiService },
        { provide: TeacherService, useValue: mockTeacherService },
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
        ],
    }).compileComponents();
    service = TestBed.inject(SessionService);
    fixture = TestBed.createComponent(DetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch session and teacher on init', () => {
    expect(mockSessionApiService.detail).toHaveBeenCalledWith('123');
    expect(mockTeacherService.detail).toHaveBeenCalledWith('42');
    expect(component.session).toEqual(session);
    expect(component.teacher).toEqual(teacher);
    expect(component.isParticipate).toBe(true);
  });

  it('should call sessionApiService.delete and navigate after deletion', () => {
    component.delete();
    expect(mockSessionApiService.delete).toHaveBeenCalledWith('123');
    expect(mockSnackBar.open).toHaveBeenCalledWith('Session deleted !', 'Close', { duration: 3000 });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['sessions']);
  });

  it('should call sessionApiService.participate and refetch session', () => {
    component.participate();
    expect(mockSessionApiService.participate).toHaveBeenCalledWith('123', '1');
    expect(mockSessionApiService.detail).toHaveBeenCalledTimes(2); // one from ngOnInit, one from participate
  });

  it('should call sessionApiService.unParticipate and refetch session', () => {
    component.unParticipate();
    expect(mockSessionApiService.unParticipate).toHaveBeenCalledWith('123', '1');
    expect(mockSessionApiService.detail).toHaveBeenCalledTimes(2); // one from ngOnInit, one from unParticipate
  });

  it('should call window.history.back when back() is called', () => {
    const backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    component.back();
    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });


});

