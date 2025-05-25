import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { expect } from '@jest/globals';
import { of, throwError } from 'rxjs';
import { fakeAsync, tick } from '@angular/core/testing';

import { Router } from '@angular/router'
import { AuthService } from 'src/app/features/auth/services/auth.service'
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockRouter: jest.Mocked<Router>;

  beforeEach(async () => {
    mockAuthService = {
      register: jest.fn()
    } as Partial<AuthService> as jest.Mocked<AuthService>;

    mockRouter = {
      navigate: jest.fn()
    } as Partial<Router> as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        BrowserAnimationsModule,
        HttpClientModule,
        ReactiveFormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        FormBuilder,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.register and navigate on successful submit', fakeAsync(() => {
    mockAuthService.register.mockReturnValue(of(undefined));

    component.form.setValue({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });

    component.submit();

    // Let async operations complete
    tick();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123'
    });

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('should set onError to true on registration failure', fakeAsync(() => {
    mockAuthService.register.mockReturnValue(
      throwError(() => new Error('Registration failed'))
    );

    component.form.setValue({
      email: 'fail@example.com',
      firstName: 'Fail',
      lastName: 'User',
      password: 'failpass'
    });

    component.submit();

    tick(); // Ensures the observable error is emitted

    expect(component.onError).toBe(true);
  }));

});
