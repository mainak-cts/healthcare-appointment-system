package com.cts.healthcare_appointment_system.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cts.healthcare_appointment_system.models.User;

public interface UserRepository extends JpaRepository<User, Integer>{
    public Optional<User> findByEmail(String email);
}
