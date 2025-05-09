package com.openclassrooms.starterjwt.repository;

import com.openclassrooms.starterjwt.models.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

//@DataJpaTest
public class UserRepositoryTest {
//
//    @Autowired
//    private UserRepository userRepository;
//    //method name, then expects, then test
//    @Test
//    void findByEmail_ExpectUserExists_Test() {
//        // Arrange/Given
//        User user = new User();
//        user.setEmail("user@gmail.com");
//        user.setPassword("password");
//        user.setFirstName("Bob");
//        user.setLastName("Dole");
//        user.setAdmin(false);
//        userRepository.save(user);
//
//        // Act/When
//        Optional<User> userRequested = userRepository.findByEmail("user@gmail.com");
//
//        // Assert/Then
//        assertThat(userRequested).isPresent();
//        assertThat(userRequested.get().getFirstName()).isEqualTo("Bob");
//    }

}
