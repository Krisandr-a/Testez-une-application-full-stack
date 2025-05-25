import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { RegisterComponent } from './register.component';
import { AuthService } from '../../services/auth.service';

describe('RegisterComponent Integration Tests', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authService: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientTestingModule,
        BrowserAnimationsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
      ],
      providers: [
        // Provide a spy for Router to check navigation
        {
          provide: Router,
          useValue: { navigate: jest.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  afterEach(() => {
    // Verify no outstanding HTTP requests
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call AuthService.register and navigate on success', fakeAsync(() => {
    component.form.setValue({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123',
    });

    component.submit();

    // Expect a single POST request to /register (adjust URL as per your backend)
    const req = httpMock.expectOne('api/auth/register');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'password123',
    });

    // Respond with success (no body expected)
    req.flush(null);

    tick();

    // Check navigation called to /login after successful registration
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.onError).toBe(false);
  }));

  it('should set onError to true on registration failure', fakeAsync(() => {
    component.form.setValue({
      email: 'fail@example.com',
      firstName: 'Fail',
      lastName: 'User',
      password: 'failpass',
    });

    component.submit();

    const req = httpMock.expectOne('api/auth/register');
    expect(req.request.method).toBe('POST');

    // Respond with HTTP 400 error
    req.flush(
      { message: 'Registration failed' },
      { status: 400, statusText: 'Bad Request' }
    );

    tick();

    expect(component.onError).toBe(true);
  }));
});
