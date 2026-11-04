package com.expensetracker.backend.service;

import com.expensetracker.backend.dto.LoginRequest;
import com.expensetracker.backend.dto.RegisterRequest;
import com.expensetracker.backend.entity.User;
import com.expensetracker.backend.exception.DuplicateResourceException;
import com.expensetracker.backend.exception.UnauthorizedException;
import com.expensetracker.backend.repository.UserRepository;
import com.expensetracker.backend.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    public Map<String, Object> register(RegisterRequest request) {
        log.info("Processing registration attempt for email: {}", request.getEmail());

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("Registration rejected: Email {} is already in use", request.getEmail());
            throw new DuplicateResourceException("An account with this email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        // Hash password securely with BCrypt
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());

        // Generate stateless JWT token
        String token = jwtUtils.generateToken(savedUser.getEmail(), savedUser.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("id", savedUser.getId());
        response.put("name", savedUser.getName());
        response.put("email", savedUser.getEmail());
        response.put("token", token);
        return response;
    }

    public Map<String, Object> login(LoginRequest request) {
        log.info("Processing login attempt for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    log.warn("Login failed: Account with email {} does not exist", request.getEmail());
                    return new UnauthorizedException("Invalid email or password");
                });

        // Verify raw password against BCrypt hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed: Password mismatch for email {}", request.getEmail());
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getId());
        log.info("User ID {} authenticated successfully. Token issued.", user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getName());
        response.put("email", user.getEmail());
        response.put("token", token);
        return response;
    }
}