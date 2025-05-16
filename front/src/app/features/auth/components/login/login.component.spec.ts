import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { throwError } from 'rxjs';
import { expect } from '@jest/globals';
import { SessionService } from 'src/app/services/session.service';
import { AuthService } from '../../services/auth.service';

import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: {} },
        { provide: SessionService, useValue: {} },
        { provide: Router, useValue: { navigate: jest.fn() } }
      ],
      imports: [
        RouterTestingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatCardModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule]
    })
      .compileComponents();
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have an invalid form when initialized', () => {
    expect(component.form.valid).toBeFalsy();
  });

  it('should mark form as valid with correct email and password', () => {
    component.form.setValue({
      email: 'test@example.com',
      password: 'validPassword123'
    });

    expect(component.form.valid).toBe(true);
  });

  it('should call authService.login with form values on submit', () => {
    const mockLogin = jest.fn().mockReturnValue(of({}));
    (component as any).authService.login = mockLogin;

    component.form.setValue({
      email: 'user@example.com',
      password: 'securePass'
    });

    component.submit();

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'securePass'
    });
  });

  it('should log in the user and navigate to /sessions on successful login', () => {
    const mockSession = { token: 'abc123' };
    const mockLogin = jest.fn().mockReturnValue(of(mockSession));
    const mockLogIn = jest.fn();
    const mockNavigate = jest.fn();

    (component as any).authService.login = mockLogin;
    (component as any).sessionService.logIn = mockLogIn;
    (component as any).router.navigate = mockNavigate;

    component.form.setValue({
      email: 'user@example.com',
      password: 'securePass'
    });

    component.submit();

    expect(mockLogIn).toHaveBeenCalledWith(mockSession);
    expect(mockNavigate).toHaveBeenCalledWith(['/sessions']);
  });

  it('should set onError to true if login fails', () => {
    const mockLogin = jest.fn().mockReturnValue(throwError(() => new Error('Invalid credentials')));
    (component as any).authService.login = mockLogin;

    component.form.setValue({
      email: 'wrong@example.com',
      password: 'wrongPass'
    });

    component.submit();

    expect(component.onError).toBe(true);
  });


});
