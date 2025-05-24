package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class SessionServiceIntegrationTest {

    @Autowired
    private SessionService sessionService;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;

    private Session session;
    private User user;

    @BeforeEach
    void setUp() {
        sessionRepository.deleteAll();
        userRepository.deleteAll();

        user = User.builder()
                .email("user@example.com")
                .firstName("John")
                .lastName("Doe")
                .password("password")
                .admin(false)
                .build();
        user = userRepository.save(user);

        session = Session.builder()
                .name("Test Session")
                .description("Integration test session")
                .date(new Date())
                .users(List.of())
                .build();
        session = sessionRepository.save(session);
    }

    @Test
    void create_returnsSavedSession_ifSessionIsValid() {
        Session newSession = Session.builder()
                .name("Another Session")
                .description("A different test session")
                .date(new Date())
                .build();

        Session result = sessionService.create(newSession);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isNotNull();
        assertThat(result.getName()).isEqualTo("Another Session");
    }

    @Test
    void delete_removesSession_ifSessionExists() {
        sessionService.delete(session.getId());

        assertThat(sessionRepository.findById(session.getId())).isEmpty();
    }

    @Test
    void findAll_returnsSessions_ifAnyExist() {
        List<Session> sessions = sessionService.findAll();

        assertThat(sessions).isNotEmpty();
    }

    @Test
    void getById_returnsSession_ifExists() {
        Session found = sessionService.getById(session.getId());

        assertThat(found).isNotNull();
        assertThat(found.getId()).isEqualTo(session.getId());
    }

    @Test
    void getById_returnsNull_ifNotExists() {
        Session found = sessionService.getById(999L);

        assertThat(found).isNull();
    }

    @Test
    void update_returnsUpdatedSession_ifSessionIsValid() {
        session.setName("Updated Name");

        Session updated = sessionService.update(session.getId(), session);

        assertThat(updated).isNotNull();
        assertThat(updated.getName()).isEqualTo("Updated Name");
    }

    @Test
    void participate_addsUserToSession_ifValid() {
        sessionService.participate(session.getId(), user.getId());

        Session updated = sessionRepository.findById(session.getId()).orElse(null);
        assertThat(updated).isNotNull();
        assertThat(updated.getUsers()).contains(user);
    }

    @Test
    void noLongerParticipate_removesUserFromSession_ifUserParticipated() {
        // Add user first
        sessionService.participate(session.getId(), user.getId());

        // Then remove
        sessionService.noLongerParticipate(session.getId(), user.getId());

        Session updated = sessionRepository.findById(session.getId()).orElse(null);
        assertThat(updated).isNotNull();
        assertThat(updated.getUsers()).doesNotContain(user);
    }
}

