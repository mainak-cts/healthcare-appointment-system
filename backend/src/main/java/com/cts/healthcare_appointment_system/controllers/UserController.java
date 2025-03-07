package com.cts.healthcare_appointment_system.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cts.healthcare_appointment_system.dto.UserDTO;
import com.cts.healthcare_appointment_system.models.User;
import com.cts.healthcare_appointment_system.services.UserService;

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
    
    //Register a new user
    @PostMapping("/register")
    public ResponseEntity<User> registerUser(@RequestBody UserDTO userDTO){
    	return userService.registerUser(userDTO);
    }
    
    //Update the existing user details
    @PutMapping("")
    public ResponseEntity<User> changeUserDetails(@RequestBody UserDTO userDTO){
    	return userService.changeUserDetails(userDTO);
    }
    
    //Delete user by id
    @DeleteMapping("/{id}")
    public ResponseEntity<User> deleteUserById(@PathVariable int id){
    	return userService.deleteUserById(id);
    }
    
}
