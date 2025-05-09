package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.mapper.TeacherMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.services.TeacherService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeacherControllerTest {

    @Mock
    private TeacherService teacherService;

    @Mock
    private TeacherMapper teacherMapper;

    @InjectMocks
    private TeacherController teacherController;

    @Test
    void findById_ShouldReturnTeacherDto_WhenTeacherExists() {
        // Arrange
        Long id = 1L;
        Teacher teacher = Teacher.builder()
                .id(id)
                .firstName("Jane")
                .lastName("Doe")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        TeacherDto teacherDto = new TeacherDto(id, "Doe", "Jane", teacher.getCreatedAt(), teacher.getUpdatedAt());

        when(teacherService.findById(id)).thenReturn(teacher);
        when(teacherMapper.toDto(teacher)).thenReturn(teacherDto);

        // Act
        ResponseEntity<?> response = teacherController.findById(String.valueOf(id));

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isInstanceOf(TeacherDto.class);
        TeacherDto responseBody = (TeacherDto) response.getBody();
        assertThat(responseBody.getId()).isEqualTo(id);
        assertThat(responseBody.getFirstName()).isEqualTo("Jane");
        assertThat(responseBody.getLastName()).isEqualTo("Doe");
    }

    @Test
    void findById_ShouldReturnNotFound_WhenTeacherDoesNotExist() {
        // Arrange
        Long id = 1L;
        when(teacherService.findById(id)).thenReturn(null);

        // Act
        ResponseEntity<?> response = teacherController.findById(String.valueOf(id));

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(404);
    }

    @Test
    void findById_ShouldReturnBadRequest_WhenIdIsInvalid() {
        // Act
        ResponseEntity<?> response = teacherController.findById("invalid-id");

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(400);
    }

    @Test
    void findAll_ShouldReturnListOfTeacherDtos() {
        // Arrange
        Teacher teacher1 = Teacher.builder().id(1L).firstName("Alice").lastName("Smith").build();
        Teacher teacher2 = Teacher.builder().id(2L).firstName("Bob").lastName("Johnson").build();
        List<Teacher> teachers = Arrays.asList(teacher1, teacher2);

        TeacherDto dto1 = new TeacherDto(1L, "Smith", "Alice", null, null);
        TeacherDto dto2 = new TeacherDto(2L, "Johnson", "Bob", null, null);
        List<TeacherDto> dtos = Arrays.asList(dto1, dto2);

        when(teacherService.findAll()).thenReturn(teachers);
        when(teacherMapper.toDto(teachers)).thenReturn(dtos);

        // Act
        ResponseEntity<?> response = teacherController.findAll();

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(200);
        assertThat(response.getBody()).isInstanceOf(List.class);
        List<?> responseBody = (List<?>) response.getBody();
        assertThat(responseBody).hasSize(2);
        assertThat(responseBody.get(0)).isInstanceOf(TeacherDto.class);
    }
}