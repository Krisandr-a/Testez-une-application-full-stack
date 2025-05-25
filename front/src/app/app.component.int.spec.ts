import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { expect } from '@jest/globals';

import { AppComponent } from './app.component';
import { SessionService } from './services/session.service';
import { AuthService } from './features/auth/services/auth.service';

@Component({ template: '' })
class DummyComponent {}

describe('AppComponent (shallow integration with mocked services)', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let router: Router;

  // Mock SessionService
  const mockSessionService = {
    $isLogged: jest.fn(),
    logOut: jest.fn()
  };

  // Mock AuthService (if used inside component, otherwise empty stub)
  const mockAuthService = {
    // Add methods you may call, e.g. login, logout if needed
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: '', component: DummyComponent }]),
        MatToolbarModule
      ],
      declarations: [AppComponent, DummyComponent],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call sessionService.$isLogged when $isLogged is called', () => {
    const expected$ = of(true);
    mockSessionService.$isLogged.mockReturnValue(expected$);

    const result = component.$isLogged();

    expect(mockSessionService.$isLogged).toHaveBeenCalled();
    expect(result).toBe(expected$);
  });

  it('should call sessionService.logOut and navigate to root on logout', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    component.logout();

    expect(mockSessionService.logOut).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['']);
  });
});
