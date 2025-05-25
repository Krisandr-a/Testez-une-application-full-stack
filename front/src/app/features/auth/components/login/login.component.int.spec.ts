import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { SessionService } from 'src/app/services/session.service';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';

describe('LoginComponent Integration Tests', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: AuthService;
  let sessionService: SessionService;
  let router: Router;

  const mockSessionInformation: SessionInformation = {
    token: 'abc123',
    type: 'Bearer',
    id: 1,
    username: 'user@example.com',
    firstName: 'User',
    lastName: 'Example',
    admin: false
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn()
          }
        },
        {
          provide: SessionService,
          useValue: {
            logIn: jest.fn()
          }
        },
        {
          provide: Router,
          useValue: {
            navigate: jest.fn()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    sessionService = TestBed.inject(SessionService);
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should submit and log in user successfully', fakeAsync(() => {
    jest.spyOn(authService, 'login').mockReturnValue(of(mockSessionInformation));
    const logInSpy = jest.spyOn(sessionService, 'logIn');
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.form.setValue({
      email: 'user@example.com',
      password: 'validPassword'
    });

    component.submit();
    tick(); // simulate async

    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'validPassword'
    });
    expect(logInSpy).toHaveBeenCalledWith(mockSessionInformation);
    expect(navigateSpy).toHaveBeenCalledWith(['/sessions']);
    expect(component.onError).toBe(false);
  }));

  it('should show error on failed login attempt', fakeAsync(() => {
    jest.spyOn(authService, 'login').mockReturnValue(throwError(() => new Error('Invalid credentials')));

    component.form.setValue({
      email: 'user@example.com',
      password: 'wrongPassword'
    });

    component.submit();
    tick();

    expect(authService.login).toHaveBeenCalled();
    expect(component.onError).toBe(true);
  }));




});
