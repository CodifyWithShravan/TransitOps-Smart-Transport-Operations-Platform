package com.example.Transit_Backend.controller;

import com.example.Transit_Backend.dto.response.UserResponse;
import com.example.Transit_Backend.model.User;
import com.example.Transit_Backend.model.enums.Role;
import com.example.Transit_Backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for retrieving user profiles and RBAC queries.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    /**
     * Get the profile of the currently authenticated user.
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(userService.getUserById(currentUser.getId()));
    }

    /**
     * List all registered users (Role-protected: ADMIN or FLEET_MANAGER).
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FLEET_MANAGER')")
    public ResponseEntity<List<UserResponse>> getAllUsers(
            @RequestParam(required = false) Role role) {
        List<UserResponse> users = (role != null)
                ? userService.getUsersByRole(role)
                : userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get user details by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
