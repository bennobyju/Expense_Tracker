
package com.expensetracker.backend.controller;

import com.expensetracker.backend.dto.LoginRequest;
import com.expensetracker.backend.dto.RegisterRequest;
import com.expensetracker.backend.repository.CategoryRepository;
import com.expensetracker.backend.security.JwtUtils;
import com.expensetracker.backend.service.AuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.expensetracker.backend.exception.UnauthorizedException;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private CategoryRepository categoryRepository;

    // 1. Registration succeeds
    @Test
    void registerShouldReturnCreatedStatus() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("Test@12345");

        when(authService.register(any(RegisterRequest.class)))
                .thenReturn(Map.of(
                        "id", 1L,
                        "name", "Test User",
                        "email", "test@example.com",
                        "token", "mock-jwt-token"
                ));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.token").value("mock-jwt-token"));

        verify(authService).register(any(RegisterRequest.class));
    }

    // 2. Login succeeds
    @Test
    void loginShouldReturnOkStatus() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("Test@12345");

        when(authService.login(any(LoginRequest.class)))
                .thenReturn(Map.of(
                        "id", 1L,
                        "name", "Test User",
                        "email", "test@example.com",
                        "token", "mock-jwt-token"
                ));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Test User"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.token").value("mock-jwt-token"));

        verify(authService).login(any(LoginRequest.class));
    }

    // 3. Registration rejects invalid input
    @Test
    void registerShouldRejectInvalidRequest() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("");
        request.setEmail("invalid-email");
        request.setPassword("");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(authService);
    }

    // 4. Login rejects invalid input
    @Test
    void loginShouldRejectInvalidRequest() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("invalid-email");
        request.setPassword("");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(authService);
    }

    // 5. Registration handles a service exception
    @Test
    void registerShouldPropagateServiceException() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("test@example.com");
        request.setPassword("Test@12345");

        when(authService.register(any(RegisterRequest.class)))
                .thenThrow(new IllegalArgumentException("Email already exists"));

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().is5xxServerError());
    }

    // 6. Login handles a service exception
    @Test
    void loginShouldPropagateServiceException() throws Exception {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("Wrong@12345");

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new UnauthorizedException("Invalid email or password"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}
