package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.UserService;
import com.openclassrooms.starterjwt.mapper.UserMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserService userService;

    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private UserController userController;

    @Test
    void findById_ShouldReturnUserDto_WhenUserExists() {
        // Arrange
        Long userId = 1L;
        User user = User.builder()
                .email("user@example.com")
                .lastName("Doe")
                .firstName("John")
                .password("password")
                .admin(true)
                .build();
        user.setId(userId);
        UserDto userDto = new UserDto(userId, "user@example.com", "Doe", "John", true, null, null, null);

        // Mock the service to return a User
        when(userService.findById(userId)).thenReturn(user);
        // Mock the mapper to return a UserDto
        when(userMapper.toDto(user)).thenReturn(userDto);

        // Act
        ResponseEntity<?> response = userController.findById(String.valueOf(userId));

        // Assert
        assertThat(response.getBody()).isInstanceOf(UserDto.class);
        UserDto responseBody = (UserDto) response.getBody();
        assertThat(responseBody.getId()).isEqualTo(userId);
        assertThat(responseBody.getEmail()).isEqualTo("user@example.com");
        assertThat(responseBody.getFirstName()).isEqualTo("John");
        assertThat(responseBody.getLastName()).isEqualTo("Doe");
    }

    @Test
    void findById_ShouldReturnNotFound_WhenUserDoesNotExist() {
        // Arrange
        Long userId = 1L;
        when(userService.findById(userId)).thenReturn(null);

        // Act
        ResponseEntity<?> response = userController.findById(String.valueOf(userId));

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(404);
    }

    @Test
    void findById_ShouldReturnBadRequest_WhenIdIsInvalid() {
        // Act
        ResponseEntity<?> response = userController.findById("invalid");

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(400);
    }

    // UserController has a strangely named method for DeleteMapping: save
    @Test
    void save_ShouldReturnOk_WhenUserIsDeletedSuccessfully() {
        // Arrange
        Long userId = 1L;
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("user@example.com");

        // Mocking SecurityContextHolder to return the authenticated user
        SecurityContextHolder.getContext().setAuthentication(mock(Authentication.class));
        when(SecurityContextHolder.getContext().getAuthentication().getPrincipal()).thenReturn(userDetails);

        // Mock the service to return a valid user
        User user = User.builder()
                .id(userId)
                .email("user@example.com")
                .lastName("Doe")
                .firstName("John")
                .password("password")
                .admin(true)
                .build();

        when(userService.findById(userId)).thenReturn(user);

        // Act
        ResponseEntity<?> response = userController.save(String.valueOf(userId));

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(200);  // 200 OK status
        verify(userService, times(1)).delete(userId);  // Ensure the delete method was called
    }

    @Test
    void save_ShouldReturnUnauthorized_WhenUserIsNotOwner() {
        // Arrange
        Long userId = 1L;

        User user = User.builder()
                .id(userId)
                .email("user@example.com") // actual user email
                .lastName("Doe")
                .firstName("John")
                .password("password")
                .admin(true)
                .build();

        when(userService.findById(userId)).thenReturn(user);

        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("otheruser@example.com"); // does not match

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Act
        ResponseEntity<?> response = userController.save(String.valueOf(userId));

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(401); // Unauthorized
        verify(userService, never()).delete(anyLong()); // Should not delete
    }

    @Test
    void save_ShouldReturnBadRequest_WhenIdIsInvalid() {
        // Act
        ResponseEntity<?> response = userController.save("invalid-id");

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(400); // Bad Request
    }

    @Test
    void save_ShouldReturnNotFound_WhenUserDoesNotExist() {
        // Arrange
        Long userId = 1L;
        when(userService.findById(userId)).thenReturn(null);

        // Act
        ResponseEntity<?> response = userController.save(String.valueOf(userId));

        // Assert
        assertThat(response.getStatusCodeValue()).isEqualTo(404); // Not Found
    }

}
