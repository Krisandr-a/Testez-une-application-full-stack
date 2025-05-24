package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import com.openclassrooms.starterjwt.models.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Date;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class SessionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    private String jwtToken;
    private Session testSession;

    @BeforeEach
    void setUp() {
        sessionRepository.deleteAll();
        teacherRepository.deleteAll();
        userRepository.deleteAll();

        // Create user for JWT auth
        User user = User.builder()
                .email("user@example.com")
                .firstName("Test")
                .lastName("User")
                .password("password")  // Plain for testing; normally hashed
                .admin(false)
                .build();
        user = userRepository.save(user);

        // Generate JWT token for this user
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(user.getId())
                .username(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .admin(user.isAdmin())
                .password(user.getPassword())
                .build();

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        jwtToken = jwtUtils.generateJwtToken(authentication);

        // Create teacher
        Teacher teacher = Teacher.builder()
                .firstName("Jane")
                .lastName("Doe")
                .build();
        teacher = teacherRepository.save(teacher);

        // Create session
        testSession = Session.builder()
                .name("Test Session")
                .date(new Date())
                .description("Basic test session")
                .teacher(teacher)
                .build();
        testSession = sessionRepository.save(testSession);
    }

    @Test
    void findById_shouldReturnSessionDto() throws Exception {
        mockMvc.perform(get("/api/session/{id}", testSession.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testSession.getId()))
                .andExpect(jsonPath("$.name").value("Test Session"));
    }

    @Test
    void findById_shouldReturnBadRequest_forInvalidIdFormat() throws Exception {
        mockMvc.perform(get("/api/session/invalid-id")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isBadRequest());
    }

    @Test
    void findAll_shouldReturnListOfSessions() throws Exception {
        mockMvc.perform(get("/api/session")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").value(testSession.getId()))
                .andExpect(jsonPath("$[0].name").value("Test Session"));
    }

    @Test
    void create_shouldReturnCreatedSession() throws Exception {
        SessionDto newSession = new SessionDto();
        newSession.setName("New Session");
        newSession.setDate(new Date());
        newSession.setDescription("Description of new session");
        newSession.setTeacher_id(testSession.getTeacher().getId());

        mockMvc.perform(post("/api/session")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(newSession)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("New Session"));
    }

    @Test
    void create_shouldReturnBadRequest_forInvalidInput() throws Exception {
        SessionDto invalidSession = new SessionDto();
        // missing required fields like name

        mockMvc.perform(post("/api/session")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(invalidSession)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void update_shouldReturnBadRequest_forInvalidId() throws Exception {
        SessionDto updateSession = new SessionDto();
        updateSession.setName("Updated Name");
        updateSession.setDate(new Date());
        updateSession.setDescription("Updated description");
        updateSession.setTeacher_id(testSession.getTeacher().getId());

        mockMvc.perform(put("/api/session/invalid-id")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(updateSession)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void update_shouldReturnUpdatedSession_forValidId() throws Exception {
        SessionDto updateSession = new SessionDto();
        updateSession.setName("Updated Name");
        updateSession.setDate(new Date());
        updateSession.setDescription("Updated description");
        updateSession.setTeacher_id(testSession.getTeacher().getId());

        mockMvc.perform(put("/api/session/{id}", testSession.getId())
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(new ObjectMapper().writeValueAsString(updateSession)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"));
    }
    // save is delete mapping: strangely named in the class
    @Test
    void save_shouldReturnNotFound_forNonExistingId() throws Exception {
        mockMvc.perform(delete("/api/session/{id}", 9999L)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void save_shouldReturnOk_forExistingId() throws Exception {
        mockMvc.perform(delete("/api/session/{id}", testSession.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());
    }

    @Test
    void participate_shouldReturnOk_whenUserAdded() throws Exception {
        // Create a new user to participate
        User newUser = User.builder()
                .email("participant@example.com")
                .firstName("Participant")
                .lastName("User")
                .password("password")
                .admin(false)
                .build();
        newUser = userRepository.save(newUser);

        mockMvc.perform(post("/api/session/{id}/participate/{userId}", testSession.getId(), newUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());
    }

    @Test
    void noLongerParticipate_shouldReturnOk_whenUserRemoved() throws Exception {
        // Create a user and add participation first
        User participant = User.builder()
                .email("leaver@example.com")
                .firstName("Leaver")
                .lastName("User")
                .password("password")
                .admin(false)
                .build();
        participant = userRepository.save(participant);

        // Add participation
        mockMvc.perform(post("/api/session/{id}/participate/{userId}", testSession.getId(), participant.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());

        // Remove participation
        mockMvc.perform(delete("/api/session/{id}/participate/{userId}", testSession.getId(), participant.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());
    }
}
