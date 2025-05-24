package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class TeacherServiceIntegrationTest {

    @Autowired
    private TeacherService teacherService;

    @Autowired
    private TeacherRepository teacherRepository;

    private Teacher savedTeacher;

    @BeforeEach
    void setUp() {
        // Clean up
        teacherRepository.deleteAll();

        Teacher teacher = Teacher.builder()
                .firstName("Alice")
                .lastName("Smith")
                .build();

        savedTeacher = teacherRepository.save(teacher);
    }

    @Test
    void findAll_returnsTeacherList_ifTeachersExist() {
        List<Teacher> teachers = teacherService.findAll();

        assertThat(teachers).isNotEmpty();
        assertThat(teachers.get(0).getFirstName()).isEqualTo("Alice");
    }

    @Test
    void findById_returnsTeacher_ifIdExists() {
        Teacher found = teacherService.findById(savedTeacher.getId());

        assertThat(found).isNotNull();
        assertThat(found.getFirstName()).isEqualTo("Alice");
        assertThat(found.getLastName()).isEqualTo("Smith");
    }

    @Test
    void findById_returnsNull_ifIdDoesNotExist() {
        Teacher found = teacherService.findById(999L);

        assertThat(found).isNull();
    }
}
