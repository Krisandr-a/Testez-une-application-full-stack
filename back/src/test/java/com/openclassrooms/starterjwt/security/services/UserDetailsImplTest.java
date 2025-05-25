package com.openclassrooms.starterjwt.security.services;

import org.junit.jupiter.api.Test;

import java.util.Collection;

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
    void getAdmin_ReturnsCorrectValue_WhenTrueAndFalse() {
        UserDetailsImpl userDetailsTrue = UserDetailsImpl.builder()
                .admin(true)
                .build();
        assertThat(userDetailsTrue.getAdmin()).isTrue();

        UserDetailsImpl userDetailsFalse = UserDetailsImpl.builder()
                .admin(false)
                .build();
        assertThat(userDetailsFalse.getAdmin()).isFalse();
    }

    @Test
    void getAuthorities_ReturnsEmptyCollection() {
        UserDetailsImpl userDetails = UserDetailsImpl.builder()
                .id(1L)
                .username("user")
                .firstName("First")
                .lastName("Last")
                .admin(false)
                .password("pwd")
                .build();

        Collection<?> authorities = userDetails.getAuthorities();

        assertThat(authorities).isNotNull();
        assertThat(authorities).isEmpty();
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

    @Test
    void equals_ReturnsFalse_WhenIdIsNull() {
        UserDetailsImpl userWithNullId = UserDetailsImpl.builder()
                .id(null)
                .username("userNull")
                .firstName("First")
                .lastName("Last")
                .admin(true)
                .password("pwd")
                .build();

        UserDetailsImpl userWithNonNullId = UserDetailsImpl.builder()
                .id(1L)
                .username("user")
                .firstName("First")
                .lastName("Last")
                .admin(true)
                .password("pwd")
                .build();

        assertThat(userWithNullId).isNotEqualTo(userWithNonNullId);
        assertThat(userWithNonNullId).isNotEqualTo(userWithNullId);
    }

    @Test
    void equals_ReturnsTrue_WhenComparingSameInstance() {
        UserDetailsImpl user = UserDetailsImpl.builder()
                .id(1L)
                .username("sameUser")
                .firstName("Same")
                .lastName("User")
                .admin(true)
                .password("pwd")
                .build();

        // this == o check
        assertThat(user.equals(user)).isTrue();
    }

    @Test
    void equals_ReturnsFalse_WhenComparedToNull() {
        UserDetailsImpl user = UserDetailsImpl.builder()
                .id(1L)
                .username("userNull")
                .firstName("First")
                .lastName("Last")
                .admin(true)
                .password("pwd")
                .build();

        // o == null check
        assertThat(user.equals(null)).isFalse();
    }


    @Test
    void equals_ReturnsFalse_WhenComparedToDifferentClass() {
        UserDetailsImpl user = UserDetailsImpl.builder()
                .id(1L)
                .username("userDiffClass")
                .firstName("First")
                .lastName("Last")
                .admin(true)
                .password("pwd")
                .build();

        // getClass() != o.getClass() check
        assertThat(user.equals("a string")).isFalse();
    }




}
