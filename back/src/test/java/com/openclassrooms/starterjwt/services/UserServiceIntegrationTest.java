package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.BeforeEach;
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

    private User testUser;

    @BeforeEach
    void setUp() {
        // Clean up
        userRepository.deleteAll();

        // Create and save a user to use in each test
        testUser = new User()
                .setEmail("commonuser@test.com")
                .setFirstName("Common")
                .setLastName("User")
                .setPassword("securePassword")
                .setAdmin(false);
        testUser.setCreatedAt(LocalDateTime.now());

        testUser = userRepository.save(testUser);
    }

    @Test
    void findById_returnsUser_ifIdExists() {
        // Act
        User found = userService.findById(testUser.getId());

        // Assert
        assertThat(found).isNotNull();
        assertThat(found.getEmail()).isEqualTo("commonuser@test.com");
    }

    @Test
    void delete_removesUser_ifIdExists() {
        // Act
        userService.delete(testUser.getId());

        // Assert
        User deleted = userService.findById(testUser.getId());
        assertThat(deleted).isNull();
    }

}
