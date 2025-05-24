package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    private User testUser;
    private String jwtToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        testUser = User.builder()
                .email("user@example.com")
                .firstName("John")
                .lastName("Doe")
                .password("password")
                .admin(false)
                .build();
        testUser = userRepository.save(testUser);

        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(testUser.getId())
                .username(testUser.getEmail())
                .firstName(testUser.getFirstName())
                .lastName(testUser.getLastName())
                .admin(testUser.isAdmin())  // or getAdmin() if your getter is named that
                .password(testUser.getPassword())
                .build();

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);

        jwtToken = jwtUtils.generateJwtToken(authentication);
    }

    @Test
    void findById_ReturnsUser_IfExists() throws Exception {
        mockMvc.perform(get("/api/user/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(testUser.getEmail()));
    }

    @Test
    void findById_ReturnsNotFound_WhenUserDoesNotExist() throws Exception {
        long nonExistentUserId = 99999L;

        mockMvc.perform(get("/api/user/" + nonExistentUserId)
                        .header("Authorization", "Bearer " + jwtToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    // save is actually delete mapping: the original code has a strangely named method
    @Test
    void save_ReturnsNotFound_WhenUserDoesNotExist() throws Exception {
        Long nonExistentUserId = 9999L; // Assuming this ID doesn't exist

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/user/" + nonExistentUserId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void save_ReturnsOk_WhenUserIsOwner() throws Exception {
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/user/" + testUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk());
    }

    @Test
    void save_ReturnsUnauthorized_WhenUserIsNotOwner() throws Exception {
        // Create a second user different from the authenticated user
        User anotherUser = User.builder()
                .email("other@example.com")
                .firstName("Jane")
                .lastName("Smith")
                .password("password")
                .admin(false)
                .build();
        anotherUser = userRepository.save(anotherUser);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/user/" + anotherUser.getId())
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isUnauthorized());
    }


}
