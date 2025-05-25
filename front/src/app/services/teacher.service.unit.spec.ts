// import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { expect } from '@jest/globals';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TeacherService } from './teacher.service';
import { Teacher } from '../interfaces/teacher.interface';

describe('TeacherService', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  // Define mock data for teachers
  const mockTeachers: Teacher[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, firstName: 'Jane', lastName: 'Smith', createdAt: new Date(), updatedAt: new Date() }
  ];

  const mockTeacher: Teacher = { id: 1, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports:[
        HttpClientTestingModule
      ],
      providers: [TeacherService]
    });
    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Ensure that there are no outstanding requests
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

   it('should fetch all teachers', () => {
      // Call the service method
      service.all().subscribe((teachers) => {
        // Verify the result
        expect(teachers).toEqual(mockTeachers);
      });

      // Set up the mock HTTP request and return mock data
      const req = httpMock.expectOne('api/teacher');
      expect(req.request.method).toBe('GET');
      req.flush(mockTeachers); // Respond with mockTeachers data
    });

    it('should fetch teacher details by id', () => {
      // Call the service method with a specific ID
      service.detail('1').subscribe((teacher) => {
        // Verify the result
        expect(teacher).toEqual(mockTeacher);
      });

      // Set up the mock HTTP request and return mock data
      const req = httpMock.expectOne('api/teacher/1');
      expect(req.request.method).toBe('GET');
      req.flush(mockTeacher); // Respond with mockTeacher data
    });

});
