package com.expensetracker.backend.exception;

import com.expensetracker.backend.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("Not Found [404] on {}: {}", request.getRequestURI(), ex.getMessage());
        return new ResponseEntity<>(new ErrorResponse(404, "Not Found", ex.getMessage(), request.getRequestURI()), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicate(DuplicateResourceException ex, HttpServletRequest request) {
        log.warn("Conflict [409] on {}: {}", request.getRequestURI(), ex.getMessage());
        return new ResponseEntity<>(new ErrorResponse(409, "Conflict", ex.getMessage(), request.getRequestURI()), HttpStatus.CONFLICT);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorized(UnauthorizedException ex, HttpServletRequest request) {
        log.warn("Unauthorized [401] on {}: {}", request.getRequestURI(), ex.getMessage());
        return new ResponseEntity<>(new ErrorResponse(401, "Unauthorized", ex.getMessage(), request.getRequestURI()), HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(BadRequestException ex, HttpServletRequest request) {
        log.warn("Bad Request [400] on {}: {}", request.getRequestURI(), ex.getMessage());
        return new ResponseEntity<>(new ErrorResponse(400, "Bad Request", ex.getMessage(), request.getRequestURI()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            errors.put(fe.getField(), fe.getDefaultMessage());
        }
        log.warn("Validation failure on {}: {}", request.getRequestURI(), errors);
        return new ResponseEntity<>(new ErrorResponse(400, "Validation Failed", errors, request.getRequestURI()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex, HttpServletRequest request) {
        log.error("Internal Server Error [500] on {}: ", request.getRequestURI(), ex);
        return new ResponseEntity<>(new ErrorResponse(500, "Internal Server Error", "An unexpected error occurred", request.getRequestURI()), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}