
package com.expensetracker.backend.service;

import com.expensetracker.backend.dto.LoginRequest;
import com.expensetracker.backend.dto.RegisterRequest;
import com.expensetracker.backend.entity.User;
import com.expensetracker.backend.exception.DuplicateResourceException;
import com.expensetracker.backend.exception.UnauthorizedException;
import com.expensetracker.backend.repository.UserRepository;
import com.expensetracker.backend.security.JwtUtils;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthService authService;

    // Test 1: Registration succeeds and returns a JWT token
    @Test
    void registerShouldSaveUserAndReturnToken() {

        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("Password123");

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode("Password123"))
                .thenReturn("$2a$12$fakeHashedPasswordForTesting");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setName("Test User");
        savedUser.setEmail("test@example.com");
        savedUser.setPassword("$2a$12$fakeHashedPasswordForTesting");

        when(userRepository.save(any(User.class)))
                .thenReturn(savedUser);

        when(jwtUtils.generateToken("test@example.com", 1L))
                .thenReturn("mock-jwt-token");

        Map<String, Object> response = authService.register(request);

        assertEquals(1L, response.get("id"));
        assertEquals("Test User", response.get("name"));
        assertEquals("test@example.com", response.get("email"));
        assertEquals("mock-jwt-token", response.get("token"));

        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode("Password123");
        verify(jwtUtils).generateToken("test@example.com", 1L);
    }

    // Test 2: Login succeeds with the correct password
    @Test
    void loginShouldSucceedWithCorrectPassword() {

        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("Password123");

        User user = new User();
        user.setId(1L);
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPassword("$2a$12$mockedPasswordHash");

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "Password123",
                "$2a$12$mockedPasswordHash"
        )).thenReturn(true);

        when(jwtUtils.generateToken("test@example.com", 1L))
                .thenReturn("mock-jwt-token");

        Map<String, Object> response = authService.login(request);

        assertEquals(1L, response.get("id"));
        assertEquals("Test User", response.get("name"));
        assertEquals("test@example.com", response.get("email"));
        assertEquals("mock-jwt-token", response.get("token"));

        verify(passwordEncoder).matches(
                "Password123",
                "$2a$12$mockedPasswordHash"
        );

        verify(jwtUtils).generateToken("test@example.com", 1L);
    }

    // Test 3: Login fails when the password is incorrect
    @Test
    void loginShouldFailWithIncorrectPassword() {

        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("WrongPassword123");

        User user = new User();
        user.setId(1L);
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setPassword("$2a$12$mockedPasswordHash");

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(user));

        when(passwordEncoder.matches(
                "WrongPassword123",
                "$2a$12$mockedPasswordHash"
        )).thenReturn(false);

        assertThrows(
                UnauthorizedException.class,
                () -> authService.login(request)
        );

        verify(jwtUtils, never())
                .generateToken(anyString(), anyLong());
    }

    // Test 4: Login fails when the email does not exist
    @Test
    void loginShouldFailWhenEmailDoesNotExist() {

        LoginRequest request = new LoginRequest();
        request.setEmail("unknown@example.com");
        request.setPassword("Password123");

        when(userRepository.findByEmail("unknown@example.com"))
                .thenReturn(Optional.empty());

        assertThrows(
                UnauthorizedException.class,
                () -> authService.login(request)
        );

        verify(passwordEncoder, never())
                .matches(anyString(), anyString());

        verify(jwtUtils, never())
                .generateToken(anyString(), anyLong());
    }

    // Test 5: Registration stores the encoded password, not the plain password
    @Test
    void registerShouldStoreHashedPassword() {

        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("hashcheck@example.com");
        request.setPassword("Password123");

        when(userRepository.findByEmail("hashcheck@example.com"))
                .thenReturn(Optional.empty());

        when(passwordEncoder.encode("Password123"))
                .thenReturn("mock-bcrypt-hash");

        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> {
                    User user = invocation.getArgument(0);
                    user.setId(2L);
                    return user;
                });

        when(jwtUtils.generateToken("hashcheck@example.com", 2L))
                .thenReturn("mock-jwt-token");

        authService.register(request);

        verify(passwordEncoder).encode("Password123");

        verify(userRepository).save(argThat(user ->
                "mock-bcrypt-hash".equals(user.getPassword())
                        && !"Password123".equals(user.getPassword())
        ));
    }

    // Test 6: Registration fails when the email already exists
    @Test
    void registerShouldFailWhenEmailAlreadyExists() {

        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("Password123");

        User existingUser = new User();
        existingUser.setId(1L);
        existingUser.setName("Existing User");
        existingUser.setEmail("test@example.com");

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(Optional.of(existingUser));

        assertThrows(
                DuplicateResourceException.class,
                () -> authService.register(request)
        );

        verify(userRepository).findByEmail("test@example.com");

        verify(userRepository, never())
                .save(any(User.class));

        verify(passwordEncoder, never())
                .encode(anyString());

        verify(jwtUtils, never())
                .generateToken(anyString(), anyLong());
    }
}
