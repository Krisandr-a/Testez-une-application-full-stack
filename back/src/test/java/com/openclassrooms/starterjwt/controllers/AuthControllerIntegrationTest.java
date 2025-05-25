package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void registerUser_returnsSuccessMessage_whenValid() throws Exception {
        SignupRequest signup = new SignupRequest();
        signup.setEmail("newuser@example.com");
        signup.setFirstName("New");
        signup.setLastName("User");
        signup.setPassword("securePassword");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully!"));
    }

    @Test
    void registerUser_returnsError_whenEmailExists() throws Exception {
        // Pre-populate DB
        User existing = User.builder()
                .email("existing@example.com")
                .firstName("Exist")
                .lastName("User")
                .password(passwordEncoder.encode("password"))
                .admin(false)
                .build();
        userRepository.save(existing);

        SignupRequest signup = new SignupRequest();
        signup.setEmail("existing@example.com");
        signup.setFirstName("New");
        signup.setLastName("User");
        signup.setPassword("securePassword");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Error: Email is already taken!"));
    }

    @Test
    void authenticateUser_returnsJwtAndUserInfo_whenCredentialsValid() throws Exception {
        // Pre-create user
        User user = User.builder()
                .email("login@example.com")
                .firstName("Login")
                .lastName("User")
                .password(passwordEncoder.encode("password"))
                .admin(true)
                .build();
        userRepository.save(user);

        LoginRequest login = new LoginRequest();
        login.setEmail("login@example.com");
        login.setPassword("password");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.username").value("login@example.com"))
                .andExpect(jsonPath("$.firstName").value("Login"))
                .andExpect(jsonPath("$.lastName").value("User"))
                .andExpect(jsonPath("$.admin").value(true));
    }

    @Test
    void authenticateUser_returns401_whenInvalidCredentials() throws Exception {
        LoginRequest login = new LoginRequest();
        login.setEmail("wrong@example.com");
        login.setPassword("wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isUnauthorized());
    }
}
