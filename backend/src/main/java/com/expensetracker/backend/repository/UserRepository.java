package com.expensetracker.backend.repository;

import com.expensetracker.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Custom query method to find users by email for login/registration checks
    Optional<User> findByEmail(String email);
    
    // Checks if an email is already registered
    boolean existsByEmail(String email);
}