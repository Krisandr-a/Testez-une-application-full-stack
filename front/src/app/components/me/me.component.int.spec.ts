import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { MeComponent } from './me.component';
import { SessionService } from '../../services/session.service';
import { UserService } from '../../services/user.service';

describe('MeComponent Integration Tests', () => {
  let component: MeComponent;
  let fixture: ComponentFixture<MeComponent>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    lastName: 'User',
    firstName: 'Test',
    admin: false,
    password: 'secret',
    createdAt: new Date()
  };

  const mockUserService = {
    getById: jest.fn().mockReturnValue(of(mockUser)),
    delete: jest.fn().mockReturnValue(of({}))
  };

  const mockSessionService = {
    sessionInformation: {
      id: 1,
      admin: true
    },
    logOut: jest.fn()
  };

  const mockSnackBar = {
    open: jest.fn()
  };

  const mockRouter = {
    navigate: jest.fn()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MeComponent],
      imports: [
        MatSnackBarModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule
      ],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch user on init using userService and sessionService', () => {
    component.ngOnInit();

    expect(mockUserService.getById).toHaveBeenCalledWith('1');
    expect(component.user).toEqual(mockUser);
  });

  it('should call window.history.back when back() is invoked', () => {
    const backSpy = jest.spyOn(window.history, 'back').mockImplementation(() => {});
    component.back();
    expect(backSpy).toHaveBeenCalled();
    backSpy.mockRestore();
  });

  it('should delete user, show snackbar, logout, and navigate home', () => {
    component.delete();

    expect(mockUserService.delete).toHaveBeenCalledWith('1');
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Your account has been deleted !',
      'Close',
      { duration: 3000 }
    );
    expect(mockSessionService.logOut).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});
