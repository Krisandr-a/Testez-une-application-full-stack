package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.mapper.SessionMapper;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.services.SessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class SessionControllerTest {

    @Mock
    private SessionService sessionService;

    @Mock
    private SessionMapper sessionMapper;

    @InjectMocks
    private SessionController sessionController;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this); // Initializes the mocks
    }

    @Test
    void findById_shouldReturnSessionDto() {
        // Arrange
        Session session = new Session();
        session.setId(1L);

        SessionDto dto = new SessionDto();
        dto.setId(1L);

        when(sessionService.getById(1L)).thenReturn(session);
        when(sessionMapper.toDto(session)).thenReturn(dto);

        // Act
        ResponseEntity<?> response = sessionController.findById("1");

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(dto, response.getBody());
    }

    @Test
    void findById_shouldReturnNotFound() {
        // Arrange
        when(sessionService.getById(1L)).thenReturn(null);

        // Act
        ResponseEntity<?> response = sessionController.findById("1");

        // Assert
        assertEquals(404, response.getStatusCodeValue());
    }

    @Test
    void findById_shouldReturnBadRequest_onInvalidId() {
        // Act
        ResponseEntity<?> response = sessionController.findById("abc");

        // Assert
        assertEquals(400, response.getStatusCodeValue());
    }

    @Test
    void findAll_shouldReturnListOfSessionDtos() {
        // Arrange
        Session session = new Session();
        SessionDto dto = new SessionDto();

        when(sessionService.findAll()).thenReturn(List.of(session));
        when(sessionMapper.toDto(List.of(session))).thenReturn(List.of(dto));

        // Act
        ResponseEntity<?> response = sessionController.findAll();

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(List.of(dto), response.getBody());
    }

    @Test
    void create_shouldReturnCreatedSessionDto() {
        // Arrange
        SessionDto dto = new SessionDto(1L, "name", new Date(), 1L, "desc", Collections.emptyList(), LocalDateTime.now(), LocalDateTime.now());
        Session entity = new Session();
        entity.setId(1L);

        when(sessionMapper.toEntity(dto)).thenReturn(entity);
        when(sessionService.create(entity)).thenReturn(entity);
        when(sessionMapper.toDto(entity)).thenReturn(dto);

        // Act
        ResponseEntity<?> response = sessionController.create(dto);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(dto, response.getBody());
    }

    @Test
    void update_shouldReturnUpdatedSessionDto() {
        // Arrange
        SessionDto dto = new SessionDto(1L, "name", new Date(), 1L, "desc", Collections.emptyList(), LocalDateTime.now(), LocalDateTime.now());
        Session entity = new Session();
        entity.setId(1L);

        when(sessionMapper.toEntity(dto)).thenReturn(entity);
        when(sessionService.update(1L, entity)).thenReturn(entity);
        when(sessionMapper.toDto(entity)).thenReturn(dto);

        // Act
        ResponseEntity<?> response = sessionController.update("1", dto);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(dto, response.getBody());
    }

    @Test
    void update_shouldReturnBadRequest_onInvalidId() {
        // Arrange
        SessionDto dto = new SessionDto();

        // Act
        ResponseEntity<?> response = sessionController.update("abc", dto);

        // Assert
        assertEquals(400, response.getStatusCodeValue());
    }

    @Test
    void delete_shouldReturnOk_whenSessionExists() {
        // Arrange
        Session session = new Session();
        when(sessionService.getById(1L)).thenReturn(session);

        // Act
        ResponseEntity<?> response = sessionController.save("1");

        // Assert
        verify(sessionService).delete(1L);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void delete_shouldReturnNotFound_whenSessionIsNull() {
        // Arrange
        when(sessionService.getById(1L)).thenReturn(null);

        // Act
        ResponseEntity<?> response = sessionController.save("1");

        // Assert
        assertEquals(404, response.getStatusCodeValue());
    }

    @Test
    void delete_shouldReturnBadRequest_onInvalidId() {
        // Act
        ResponseEntity<?> response = sessionController.save("abc");

        // Assert
        assertEquals(400, response.getStatusCodeValue());
    }

    @Test
    void participate_shouldReturnOk() {
        // Act
        ResponseEntity<?> response = sessionController.participate("1", "2");

        // Assert
        verify(sessionService).participate(1L, 2L);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void participate_shouldReturnBadRequest_onInvalidId() {
        // Act
        ResponseEntity<?> response = sessionController.participate("a", "2");

        // Assert
        assertEquals(400, response.getStatusCodeValue());
    }

    @Test
    void noLongerParticipate_shouldReturnOk() {
        // Act
        ResponseEntity<?> response = sessionController.noLongerParticipate("1", "2");

        // Assert
        verify(sessionService).noLongerParticipate(1L, 2L);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void noLongerParticipate_shouldReturnBadRequest_onInvalidId() {
        // Act
        ResponseEntity<?> response = sessionController.noLongerParticipate("a", "2");

        // Assert
        assertEquals(400, response.getStatusCodeValue());
    }
}
