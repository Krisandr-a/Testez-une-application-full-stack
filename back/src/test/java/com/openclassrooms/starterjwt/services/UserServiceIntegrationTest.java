package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class UserServiceIntegrationTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void findById_returnsUser_ifIdExists() {
        // Arrange
        User user = new User()
                .setEmail("integration@test.com")
                .setFirstName("Test")
                .setLastName("User")
                .setPassword("securePassword")
                .setAdmin(false);
        user.setCreatedAt(LocalDateTime.now()); // manually set for test
        User savedUser = userRepository.save(user);

        // Act
        User found = userService.findById(savedUser.getId());

        // Assert
        assertThat(found).isNotNull();
        assertThat(found.getEmail()).isEqualTo("integration@test.com");
    }
}
