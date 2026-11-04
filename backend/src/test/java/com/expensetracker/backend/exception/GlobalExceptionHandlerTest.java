
package com.expensetracker.backend.exception;

import com.expensetracker.backend.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();

        request = mock(HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/test");
    }

    @Test
    void handleNotFoundShouldReturn404() {
        ResponseEntity<ErrorResponse> response =
                handler.handleNotFound(
                        new ResourceNotFoundException("Resource not found"),
                        request
                );

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void handleDuplicateShouldReturn409() {
        ResponseEntity<ErrorResponse> response =
                handler.handleDuplicate(
                        new DuplicateResourceException("Resource already exists"),
                        request
                );

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void handleUnauthorizedShouldReturn401() {
        ResponseEntity<ErrorResponse> response =
                handler.handleUnauthorized(
                        new UnauthorizedException("Invalid credentials"),
                        request
                );

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void handleBadRequestShouldReturn400() {
        ResponseEntity<ErrorResponse> response =
                handler.handleBadRequest(
                        new BadRequestException("Invalid request"),
                        request
                );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void handleValidationErrorsShouldReturn400() throws Exception {
        Object target = new Object();

        BeanPropertyBindingResult bindingResult =
                new BeanPropertyBindingResult(target, "request");

        bindingResult.addError(
                new FieldError(
                        "request",
                        "email",
                        "Email is required"
                )
        );

        Method method = ValidationTestController.class
                .getDeclaredMethod("testMethod");

        MethodParameter parameter = new MethodParameter(method, -1);

        MethodArgumentNotValidException exception =
                new MethodArgumentNotValidException(
                        parameter,
                        bindingResult
                );

        ResponseEntity<ErrorResponse> response =
                handler.handleValidationErrors(exception, request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
    }

    @Test
    void handleGeneralExceptionShouldReturn500() {
        ResponseEntity<ErrorResponse> response =
                handler.handleGeneralException(
                        new RuntimeException("Internal details"),
                        request
                );

        assertEquals(
                HttpStatus.INTERNAL_SERVER_ERROR,
                response.getStatusCode()
        );

        assertNotNull(response.getBody());
    }

    // Helper class used to construct a validation exception in the test.
    static class ValidationTestController {
        public void testMethod() {
        }
    }
}
