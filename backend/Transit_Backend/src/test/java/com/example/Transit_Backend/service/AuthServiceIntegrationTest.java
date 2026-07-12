package com.example.Transit_Backend.service;

import com.example.Transit_Backend.dto.request.LoginRequest;
import com.example.Transit_Backend.dto.request.RegisterRequest;
import com.example.Transit_Backend.dto.response.AuthResponse;
import com.example.Transit_Backend.exception.ValidationException;
import com.example.Transit_Backend.model.enums.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AuthServiceIntegrationTest {

    @Autowired
    private AuthService authService;

    @Test
    void testRegisterAndLogin_Success() {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .name("Alice Manager")
                .email("alice@transitops.com")
                .password("secret123")
                .role(Role.FLEET_MANAGER)
                .build();

        AuthResponse regResponse = authService.register(registerRequest);

        assertNotNull(regResponse.getToken());
        assertEquals("Bearer", regResponse.getTokenType());
        assertEquals("alice@transitops.com", regResponse.getEmail());
        assertEquals(Role.FLEET_MANAGER, regResponse.getRole());

        // Login with same credentials
        LoginRequest loginRequest = LoginRequest.builder()
                .email("alice@transitops.com")
                .password("secret123")
                .build();

        AuthResponse loginResponse = authService.login(loginRequest);

        assertNotNull(loginResponse.getToken());
        assertEquals("alice@transitops.com", loginResponse.getEmail());
    }

    @Test
    void testRegisterDuplicateEmail_ThrowsValidationException() {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .name("Bob Dispatcher")
                .email("bob@transitops.com")
                .password("secret123")
                .role(Role.DISPATCHER)
                .build();

        authService.register(registerRequest);

        assertThrows(ValidationException.class, () -> authService.register(registerRequest));
    }
}
