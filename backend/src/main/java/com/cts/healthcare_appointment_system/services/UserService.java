package com.cts.healthcare_appointment_system.services;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.cts.healthcare_appointment_system.dto.UserDTO;
import com.cts.healthcare_appointment_system.enums.UserRole;
import com.cts.healthcare_appointment_system.error.ApiException;
import com.cts.healthcare_appointment_system.models.User;
import com.cts.healthcare_appointment_system.repositories.UserRepository;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UserService {

    private final UserRepository userRepo;


    // GET methods
    // Get all users 
    public ResponseEntity<List<User>> getAllusers() {
        List<User> users = userRepo.findAll();
        if (users.isEmpty()) {
            throw new ApiException("No users found", HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.status(HttpStatus.OK).body(users);
    }

    //Get user by id
    public ResponseEntity<User> getUserById(int id) {
        User user = userRepo.findById(id).orElse(null);
        if (user == null) {
            throw new ApiException("No user with user id: " + id + " found", HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.status(HttpStatus.OK).body(user);
    }

    // PUT methods
    // Change user details
    @Transactional
    public ResponseEntity<User> changeUserDetails(UserDTO dto){
        int userId = dto.getUserId();
        String name = dto.getName();
        String password = dto.getPassword();
        String phone = dto.getPhone();

        User user = userRepo.findById(userId).orElse(null);
        if(user == null){
            throw new ApiException("No user found with id: " + userId, HttpStatus.BAD_REQUEST);
        }
        user.setName(name);
        user.setPassword(password);
        user.setPhone(phone);

        userRepo.save(user);
        return ResponseEntity.status(HttpStatus.OK).body(user);

    }

    // POST methods
    // Register/save a new user
    @Transactional
    public ResponseEntity<User> registerUser(UserDTO dto) {
        // userId is set to null so that JPA will think it's a new entity, will generate primary key value, and save it

        // Check whether the email is already registered or not
        if(userRepo.findByEmail(dto.getEmail()).orElse(null) != null){
            throw new ApiException("Email id already registered", HttpStatus.BAD_REQUEST);
        }

        if(dto.getRole() != UserRole.DOCTOR && dto.getRole() != UserRole.PATIENT){
            throw new ApiException("Invalid user role: " + dto.getRole(), HttpStatus.BAD_REQUEST);
        }

        User user = new User();        
        
        user.setUserId(null);
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole());
        user.setPassword(dto.getPassword());
        user.setPhone(dto.getPhone());

        User savedUser = userRepo.save(user);
        if (savedUser == null) {
            throw new ApiException("Failed to create new user", HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
    }

    // DELETE methods
    // Remove an user
    @Transactional
    public ResponseEntity<User> deleteUserById(int id) {
        User user = userRepo.findById(id).orElse(null);
        if (user == null) {
            throw new ApiException("No user with user id: " + id + " found", HttpStatus.BAD_REQUEST);
        }
        // Removing the associations
        user.getPatientAppointments().forEach(a -> {
            a.setPatient(null);
            a.cancel();
        });
        user.getDoctorAppointments().forEach(a -> {
            a.setDoctor(null);
            a.cancel();
        });
        // This will also remove the availabilities (Thanks to 'orphanRemoval = true')
        user.getAvailabilities().forEach(e -> e.setDoctor(null));

        userRepo.delete(user);
        
        return ResponseEntity.status(HttpStatus.OK).body(user);
    }
}
