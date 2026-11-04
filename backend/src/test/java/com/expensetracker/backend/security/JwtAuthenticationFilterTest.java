
package com.expensetracker.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtAuthenticationFilterTest {

    private JwtUtils jwtUtils;
    private JwtAuthenticationFilter filter;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() throws Exception {
        jwtUtils = mock(JwtUtils.class);
        filter = new JwtAuthenticationFilter();

        // Inject the mocked JwtUtils into the filter
        var field = JwtAuthenticationFilter.class
                .getDeclaredField("jwtUtils");
        field.setAccessible(true);
        field.set(filter, jwtUtils);

        filterChain = mock(FilterChain.class);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void cleanUp() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void validBearerTokenShouldAuthenticateUser() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer valid-token");

        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtUtils.validateToken("valid-token")).thenReturn(true);
        when(jwtUtils.getUserIdFromToken("valid-token")).thenReturn(25L);

        filter.doFilter(request, response, filterChain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals(
                25L,
                SecurityContextHolder.getContext().getAuthentication().getPrincipal()
        );

        verify(filterChain).doFilter(request, response);
    }

    @Test
    void invalidBearerTokenShouldNotAuthenticateUser() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer invalid-token");

        MockHttpServletResponse response = new MockHttpServletResponse();

        when(jwtUtils.validateToken("invalid-token")).thenReturn(false);

        filter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void missingAuthorizationHeaderShouldNotAuthenticateUser() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtUtils);
    }

    @Test
    void nonBearerAuthorizationHeaderShouldNotAuthenticateUser() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Basic some-value");

        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
        verifyNoInteractions(jwtUtils);
    }
}
