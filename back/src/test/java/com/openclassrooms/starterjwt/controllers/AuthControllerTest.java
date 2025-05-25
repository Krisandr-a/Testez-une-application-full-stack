package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.response.JwtResponse;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.security.jwt.JwtUtils;
import com.openclassrooms.starterjwt.security.services.UserDetailsImpl;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.payload.response.MessageResponse;


import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.extension.ExtendWith;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuthController authController;

    @Test
    void authenticateUser_ShouldReturnJwtResponse_WhenCredentialsAreValid() {
        // Arrange
        String email = "user@example.com";
        String password = "password";
        String jwt = "mocked-jwt";

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username(email)
                .firstName("John")
                .lastName("Doe")
                .password(password)
                .admin(true)
                .build();

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn(jwt);

        User user = new User(email, "Doe", "John", password, true);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        // Act
        ResponseEntity<?> response = authController.authenticateUser(loginRequest);

        // Assert
        assertThat(response.getBody()).isInstanceOf(JwtResponse.class);
        JwtResponse jwtResponse = (JwtResponse) response.getBody();
        assertThat(jwtResponse.getToken()).isEqualTo(jwt);
        assertThat(jwtResponse.getUsername()).isEqualTo(email);
        assertThat(jwtResponse.getFirstName()).isEqualTo("John");
        assertThat(jwtResponse.getLastName()).isEqualTo("Doe");
        assertThat(jwtResponse.getAdmin()).isTrue();
    }

    @Test
    void authenticateUser_ShouldReturnJwtResponse_WhenUserNotFoundInRepository() {
        // Arrange
        String email = "user@example.com";
        String password = "password";
        String jwt = "mocked-jwt";

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(email);
        loginRequest.setPassword(password);

        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username(email)
                .firstName("John")
                .lastName("Doe")
                .password(password)
                .admin(false)
                .build();

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        when(jwtUtils.generateJwtToken(authentication)).thenReturn(jwt);

        // Simulate user not found in repository
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act
        ResponseEntity<?> response = authController.authenticateUser(loginRequest);

        // Assert
        assertThat(response.getBody()).isInstanceOf(JwtResponse.class);
        JwtResponse jwtResponse = (JwtResponse) response.getBody();
        assertThat(jwtResponse.getToken()).isEqualTo(jwt);
        assertThat(jwtResponse.getUsername()).isEqualTo(email);
        assertThat(jwtResponse.getFirstName()).isEqualTo("John");
        assertThat(jwtResponse.getLastName()).isEqualTo("Doe");
        assertThat(jwtResponse.getAdmin()).isFalse(); // Should default to false
    }

    @Test
    void registerUser_ShouldReturnSuccessMessage_WhenValidRequest() {
        // Arrange
        String email = "user@example.com";
        String firstName = "John";
        String lastName = "Doe";
        String password = "password";
        String encodedPassword = "encoded-password"; // Mocked encoded password

        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail(email);
        signupRequest.setFirstName(firstName);
        signupRequest.setLastName(lastName);
        signupRequest.setPassword(password);

        User user = new User(email, lastName, firstName, encodedPassword, false);

        // Mock behavior
        when(userRepository.existsByEmail(email)).thenReturn(false); // Simulate that the email is not already taken
        when(passwordEncoder.encode(password)).thenReturn(encodedPassword); // Simulate password encoding
        when(userRepository.save(any(User.class))).thenReturn(user); // Simulate saving the user in the database

        // Act
        ResponseEntity<?> response = authController.registerUser(signupRequest);

        // Assert
        assertThat(response.getBody()).isInstanceOf(MessageResponse.class);
        MessageResponse messageResponse = (MessageResponse) response.getBody();
        assertThat(messageResponse.getMessage()).isEqualTo("User registered successfully!");
        assertThat(response.getStatusCodeValue()).isEqualTo(200); // Ensure the status code is 200 OK
    }

    @Test
    void registerUser_ShouldReturnErrorMessage_WhenEmailAlreadyTaken() {
        // Arrange
        String email = "user@example.com";
        String firstName = "John";
        String lastName = "Doe";
        String password = "password";

        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail(email);
        signupRequest.setFirstName(firstName);
        signupRequest.setLastName(lastName);
        signupRequest.setPassword(password);

        when(userRepository.existsByEmail(email)).thenReturn(true); // Simulate that the email is already taken

        // Act
        ResponseEntity<?> response = authController.registerUser(signupRequest);

        // Assert
        assertThat(response.getBody()).isInstanceOf(MessageResponse.class);
        MessageResponse messageResponse = (MessageResponse) response.getBody();
        assertThat(messageResponse.getMessage()).isEqualTo("Error: Email is already taken!");
        assertThat(response.getStatusCodeValue()).isEqualTo(400); // Ensure the status code is 400 Bad Request
    }

}
