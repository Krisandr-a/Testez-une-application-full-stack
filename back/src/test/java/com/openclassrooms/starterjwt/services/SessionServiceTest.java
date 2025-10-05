package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SessionService sessionService;

    private Session mockSession;
    private User mockUser;


    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .password("password")
                .admin(false)
                .build();

        mockSession = Session.builder()
                .id(1L)
                .name("Test Session")
                .description("Some description")
                .date(new Date())
                .users(new ArrayList<>())
                .build();
    }

    @Test
    void create_returnsSavedSession_ifSessionIsValid() {
        // Make sure the mock repository's save method returns the mock session when called
        when(sessionRepository.save(mockSession)).thenReturn(mockSession);

        // Call the service method
        Session created = sessionService.create(mockSession);

        // Validate the results
        assertThat(created).isNotNull();
        assertThat(created.getName()).isEqualTo("Test Session");

        // Ensure the repository's save method was called once with the mock session
        verify(sessionRepository).save(mockSession);
    }

    @Test
    void delete_deletesSession_ifSessionExists() {
        sessionService.delete(1L);

        // Verify that deleteById is called once
        verify(sessionRepository).deleteById(1L);
    }

    @Test
    void findAll_returnsSessionList_ifSessionsExist() {
        when(sessionRepository.findAll()).thenReturn(List.of(mockSession));

        List<Session> result = sessionService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Test Session");
    }

    @Test
    void getById_returnsSession_ifIdExists() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(mockSession));

        Session result = sessionService.getById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void getById_returnsNull_ifIdDoesNotExist() {
        when(sessionRepository.findById(2L)).thenReturn(Optional.empty());

        Session result = sessionService.getById(2L);

        assertThat(result).isNull();
    }

    @Test
    void update_setsIdAndSaves_ifSessionIsValid() {
        Session updatedSession = Session.builder()
                .name("Updated Name")
                .description("Updated Description")
                .date(new Date())
                .build();

        // Mock the repository's save method to return the updated session
        when(sessionRepository.save(any(Session.class))).thenReturn(updatedSession);

        // Call the update method
        Session result = sessionService.update(1L, updatedSession);

        // Ensure the updated session has the correct ID
        assertThat(result.getId()).isEqualTo(1L);

        // Verify that save was called once with the updated session
        verify(sessionRepository).save(updatedSession);
    }

    @Test
    void participate_throwsNotFound_ifSessionOrUserMissing() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> sessionService.participate(1L, 1L));

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(mockSession));
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> sessionService.participate(1L, 1L));
    }

    @Test
    void participate_throwsBadRequest_ifAlreadyParticipating() {
        mockSession.getUsers().add(mockUser);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(mockSession));
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        assertThrows(BadRequestException.class, () -> sessionService.participate(1L, 1L));
    }


    @Test
    void participate_addsUserAndSaves_ifValid() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(mockSession));
        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        sessionService.participate(1L, 1L);

        assertThat(mockSession.getUsers()).contains(mockUser);
        verify(sessionRepository).save(mockSession);
    }

    @Test
    void noLongerParticipate_throwsNotFound_ifSessionMissing() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> sessionService.noLongerParticipate(1L, 1L));
    }

    @Test
    void noLongerParticipate_throwsBadRequest_ifUserNotParticipating() {
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(mockSession));
        assertThrows(BadRequestException.class, () -> sessionService.noLongerParticipate(1L, 1L));
    }

    @Test
    void noLongerParticipate_removesUserAndSaves_ifParticipating() {
        User otherUser = User.builder()
                .id(2L)
                .email("other@example.com")
                .firstName("Jane")
                .lastName("Smith")
                .password("pass")
                .admin(false)
                .build();

        mockSession.setUsers(new ArrayList<>(List.of(mockUser, otherUser)));
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(mockSession));

        sessionService.noLongerParticipate(1L, 1L);

        assertThat(mockSession.getUsers()).containsExactly(otherUser);
        verify(sessionRepository).save(mockSession);
    }




}
