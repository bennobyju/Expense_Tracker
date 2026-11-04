
package com.expensetracker.backend.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils();
    }

    @Test
    void generateTokenShouldReturnToken() {
        String token = jwtUtils.generateToken("test@example.com", 1L);

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertTrue(jwtUtils.validateToken(token));
    }

    @Test
    void getEmailFromTokenShouldReturnCorrectEmail() {
        String token = jwtUtils.generateToken("test@example.com", 1L);

        String email = jwtUtils.getEmailFromToken(token);

        assertEquals("test@example.com", email);
    }

    @Test
    void getUserIdFromTokenShouldReturnCorrectUserId() {
        String token = jwtUtils.generateToken("test@example.com", 25L);

        Long userId = jwtUtils.getUserIdFromToken(token);

        assertEquals(25L, userId);
    }

    @Test
    void validateTokenShouldReturnFalseForInvalidToken() {
        assertFalse(jwtUtils.validateToken("invalid.token.value"));
    }

    @Test
    void validateTokenShouldReturnFalseForExpiredToken() {
        String secret =
                "ExpenseTrackerSuperSecretKeyThatIsAtLeast256BitsLongForHS256Security!";

        Key key = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8));

        Date now = new Date();

        String expiredToken = Jwts.builder()
                .setSubject("test@example.com")
                .claim("userId", 1L)
                .setIssuedAt(new Date(now.getTime() - 120_000))
                .setExpiration(new Date(now.getTime() - 60_000))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();

        assertFalse(jwtUtils.validateToken(expiredToken));
    }
}
