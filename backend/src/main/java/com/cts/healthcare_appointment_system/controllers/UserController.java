package com.cts.healthcare_appointment_system.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cts.healthcare_appointment_system.dto.ChangePasswordDTO;
import com.cts.healthcare_appointment_system.dto.JwtDTO;
import com.cts.healthcare_appointment_system.dto.UserDTO;
import com.cts.healthcare_appointment_system.dto.UserLoginDTO;
import com.cts.healthcare_appointment_system.dto.UserUpdateDTO;
import com.cts.healthcare_appointment_system.models.User;
import com.cts.healthcare_appointment_system.services.UserService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/users")
public class UserController {

	private UserService userService;
	
	//Fetch all the users
    @GetMapping("")
    public ResponseEntity<List<User>> getAllUsers() {
        return userService.getAllusers();
    }
    	
    //Get user by id
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable int id){
    	return userService.getUserById(id);
    }
    
    // Get user by email
    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email){
    	return userService.getUserByEmail(email);
    }

    // Register a new user
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody @Valid UserDTO dto) {
        return userService.registerUser(dto);
    }
    
    // Login an existing user
    @PostMapping("/login")
    public ResponseEntity<JwtDTO> loginUser(@RequestBody @Valid UserLoginDTO dto) {
        return userService.checkLogin(dto);
    }
    
    //Update the existing user details
    @PutMapping("")
    public ResponseEntity<User> changeUserDetails(@Valid @RequestBody UserUpdateDTO userUpdateDTO){
    	return userService.changeUserDetails(userUpdateDTO);
    }

    // Forgot password
    @PutMapping("/change-password")
    public ResponseEntity<User> changePassword(@Valid @RequestBody ChangePasswordDTO dto){
        return userService.changeUserPassword(dto);
    }
    
    //Delete user by id
    @DeleteMapping("/{id}")
    public ResponseEntity<User> deleteUserById(@PathVariable int id){
    	return userService.deleteUserById(id);
    }
    
}
