import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { RouterTestingModule } from '@angular/router/testing';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { ListComponent } from './list.component';
import { SessionService } from 'src/app/services/session.service';
import { SessionApiService } from '../../services/session-api.service';
import { Session } from '../../interfaces/session.interface';
import { SessionInformation } from 'src/app/interfaces/sessionInformation.interface';

describe('ListComponent Integration Tests', () => {
  let component: ListComponent;
  let fixture: ComponentFixture<ListComponent>;

  const mockSessions: Session[] = [
    {
      id: 1,
      name: 'Session 1',
      description: 'Description 1',
      date: new Date(),
      teacher_id: 101,
      users: []
    },
    {
      id: 2,
      name: 'Session 2',
      description: 'Description 2',
      date: new Date(),
      teacher_id: 102,
      users: []
    }
  ];

  const mockSessionInfo: SessionInformation = {
    id: 1,
    admin: true,
    token: 'fake-token',
    type: 'Bearer',
    username: 'jdoe',
    firstName: 'John',
    lastName: 'Doe'
  };

  const mockSessionApiService = {
    all: jest.fn().mockReturnValue(of(mockSessions))
  };

  const mockSessionService = {
    sessionInformation: mockSessionInfo
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListComponent],
      imports: [MatCardModule, MatIconModule, RouterTestingModule],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: SessionApiService, useValue: mockSessionApiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the sessionInformation through the user getter', () => {
    expect(component.user).toEqual(mockSessionInfo);
  });

  it('should call sessionApiService.all on init and assign to sessions$', (done) => {
    component.sessions$.subscribe((sessions) => {
      expect(mockSessionApiService.all).toHaveBeenCalled();
      expect(sessions).toEqual(mockSessions);
      done();
    });
  });
});
