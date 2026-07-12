package com.example.Transit_Backend.repository;

import com.example.Transit_Backend.model.User;
import com.example.Transit_Backend.model.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link User} entities.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by their email address (username for authentication).
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a user with the given email already exists.
     */
    boolean existsByEmail(String email);

    /**
     * Find users by assigned role.
     */
    List<User> findByRole(Role role);
}
