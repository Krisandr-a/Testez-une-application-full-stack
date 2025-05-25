import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TeacherService } from './teacher.service';
import { Teacher } from '../interfaces/teacher.interface';

describe('TeacherService (shallow integration)', () => {
  let service: TeacherService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8080/api/teacher';

  const mockTeachers: Teacher[] = [
    { id: 1, firstName: 'John', lastName: 'Doe', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, firstName: 'Jane', lastName: 'Smith', createdAt: new Date(), updatedAt: new Date() }
  ];

  const mockTeacher: Teacher = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TeacherService],
    });

    service = TestBed.inject(TeacherService);
    httpMock = TestBed.inject(HttpTestingController);

    // Override pathService if needed for consistent test base URL
    // @ts-ignore
    service['pathService'] = baseUrl;
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no unmatched HTTP requests
  });

  it('all should return all teachers', () => {
    service.all().subscribe((teachers) => {
      expect(teachers).toEqual(mockTeachers);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockTeachers);
  });

  it('detail should return a teacher by id', () => {
    service.detail('1').subscribe((teacher) => {
      expect(teacher).toEqual(mockTeacher);
    });

    const req = httpMock.expectOne(`${baseUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTeacher);
  });
});
