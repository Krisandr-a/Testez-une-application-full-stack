package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)  // Use MockitoExtension to automatically initialize mocks
class TeacherServiceTest {

    @Mock
    private TeacherRepository teacherRepository;

    @InjectMocks
    private TeacherService teacherService;

    private Teacher mockTeacher;

    @BeforeEach
    void setUp() {
        mockTeacher = Teacher.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .build();
    }

    @Test
    void findAll_returnsTeacherList_ifTeachersExist() {
        when(teacherRepository.findAll()).thenReturn(List.of(mockTeacher));

        List<Teacher> result = teacherService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getFirstName()).isEqualTo("John");
    }

    @Test
    void findById_returnsTeacher_ifIdExists() {
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(mockTeacher));

        Teacher result = teacherService.findById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getFirstName()).isEqualTo("John");
    }

    @Test
    void findById_returnsNull_ifIdDoesNotExist() {
        when(teacherRepository.findById(2L)).thenReturn(Optional.empty());

        Teacher result = teacherService.findById(2L);

        assertThat(result).isNull();
    }
}
