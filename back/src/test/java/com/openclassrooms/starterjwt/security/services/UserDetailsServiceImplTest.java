package com.openclassrooms.starterjwt.security.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class UserDetailsServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

//    @Test
//    void loadUserByUsername_ReturnsUserDetails_WhenUserExists() {
//        // Arrange
//        String email = "test@example.com";
//        User mockUser = new User();
//        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));
//
//        // Act
//        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
//
//        // Assert
//        assertNotNull(userDetails);
//        verify(userRepository).findByEmail(email);
//    }

    @Test
    void loadUserByUsername_ReturnsUserDetails_WhenUserExists() {
        // Arrange
        String email = "test@example.com";
        User mockUser = new User()
                .setId(1L)
                .setEmail(email)
                .setFirstName("John")
                .setLastName("Doe")
                .setPassword("password123")
                .setAdmin(true);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(mockUser));

        // Act
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);

        // Assert
        assertNotNull(userDetails);
        verify(userRepository).findByEmail(email);

        // Verify UserDetailsImpl has correct values
        assertThat(userDetails).isInstanceOf(UserDetailsImpl.class);
        UserDetailsImpl impl = (UserDetailsImpl) userDetails;
        assertThat(impl.getId()).isEqualTo(mockUser.getId());
        assertThat(impl.getUsername()).isEqualTo(mockUser.getEmail());
        assertThat(impl.getFirstName()).isEqualTo(mockUser.getFirstName());
        assertThat(impl.getLastName()).isEqualTo(mockUser.getLastName());
        assertThat(impl.getPassword()).isEqualTo(mockUser.getPassword());
    }

    @Test
    void loadUserByUsername_ThrowsException_WhenUserNotFound() {
        // Arrange
        String email = "missing@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act & Assert
        UsernameNotFoundException thrown = assertThrows(
                UsernameNotFoundException.class,
                () -> userDetailsService.loadUserByUsername(email)
        );

        assertThat(thrown.getMessage()).isEqualTo("User Not Found with email: " + email);
        verify(userRepository).findByEmail(email);
    }
}
