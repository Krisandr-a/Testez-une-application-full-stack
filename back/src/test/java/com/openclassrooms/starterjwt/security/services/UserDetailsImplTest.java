package com.openclassrooms.starterjwt.security.services;

import org.junit.jupiter.api.Test;
import static org.assertj.core.api.Assertions.assertThat;

class UserDetailsImplTest {

    @Test
    void isAccountNonExpired_ReturnsTrue_WhenUserIsConstructed() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("testUser")
                .firstName("Test")
                .lastName("User")
                .admin(true)
                .password("password")
                .build();

        assertThat(userDetails.isAccountNonExpired()).isTrue();
    }

    @Test
    void isAccountNonLocked_ReturnsTrue_WhenUserIsConstructed() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("testUser")
                .firstName("Test")
                .lastName("User")
                .admin(true)
                .password("password")
                .build();

        assertThat(userDetails.isAccountNonLocked()).isTrue();
    }

    @Test
    void isCredentialsNonExpired_ReturnsTrue_WhenUserIsConstructed() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("testUser")
                .firstName("Test")
                .lastName("User")
                .admin(true)
                .password("password")
                .build();

        assertThat(userDetails.isCredentialsNonExpired()).isTrue();
    }

    @Test
    void isEnabled_ReturnsTrue_WhenUserIsConstructed() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("testUser")
                .firstName("Test")
                .lastName("User")
                .admin(true)
                .password("password")
                .build();

        assertThat(userDetails.isEnabled()).isTrue();
    }

    @Test
    void equals_ReturnsExpectedResult_WhenComparingUsersWithSameOrDifferentIds() {
        UserDetailsImpl user1 = UserDetailsImpl.builder()
                .id(1L)
                .username("testUser")
                .firstName("Test")
                .lastName("User")
                .admin(true)
                .password("password")
                .build();

        UserDetailsImpl user2 = UserDetailsImpl.builder()
                .id(1L)
                .username("testUser")
                .firstName("Test")
                .lastName("User")
                .admin(true)
                .password("password")
                .build();

        UserDetailsImpl user3 = UserDetailsImpl.builder()
                .id(2L)
                .username("anotherUser")
                .firstName("Another")
                .lastName("User")
                .admin(true)
                .password("password")
                .build();

        // Same id, so they should be equal
        assertThat(user1).isEqualTo(user2);

        // Different ids, so not equal
        assertThat(user1).isNotEqualTo(user3);

        // Object with null id, should not be equal to user1
        UserDetailsImpl userNull = UserDetailsImpl.builder()
                .id(null)
                .username("testUser")
                .firstName("Test")
                .lastName("User")
                .admin(true)
                .password("password")
                .build();
        assertThat(user1).isNotEqualTo(userNull);
    }

}
