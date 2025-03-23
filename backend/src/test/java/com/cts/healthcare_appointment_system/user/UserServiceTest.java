package com.cts.healthcare_appointment_system.user;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
 
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
 
import com.cts.healthcare_appointment_system.dto.UserDTO;
import com.cts.healthcare_appointment_system.dto.UserUpdateDTO;
import com.cts.healthcare_appointment_system.enums.UserRole;
import com.cts.healthcare_appointment_system.models.User;
import com.cts.healthcare_appointment_system.repositories.UserRepository;
import com.cts.healthcare_appointment_system.services.UserService;
 
@ExtendWith(MockitoExtension.class)
public class UserServiceTest {
 
    @Mock
    private UserRepository repo;
 
    @InjectMocks
    private UserService service;
 
    @Mock
    private PasswordEncoder encoder;
   
    @Test
    void testGetAllUsers() {
    	
    	User user1 = new User();
        user1.setUserId(1);
        user1.setName("John");
        user1.setEmail("John@gmail.com");
        user1.setPassword("John@cr7");
        
        User user2 = new User();
        user2.setUserId(2);
        user2.setName("Alex");
        user2.setEmail("alex@gmail.com");
        user2.setPassword("alex@123");
        
        List<User> users = List.of(user1, user2);
 
        when(repo.findAll()).thenReturn(users);
 
        List<User> fetchedUsers = service.getAllusers().getBody();
 
        assertEquals(fetchedUsers.size(), 2);
    }
 
    @Test
    void testGetUserById() {
    	
        User user = new User();
        user.setUserId(1);
        user.setName("Mainak");
        user.setEmail("m@gmail.com");
        user.setPassword("mainak@cr7");
        
        when(repo.findById(1)).thenReturn(Optional.of(user));
 
        User fetchedUser = service.getUserById(1).getBody();
 
        assertEquals(fetchedUser.getName(), "Mainak");
    }
 
    @Test
    void testChangeUserDetails() {
    	
        User user = new User();
        user.setUserId(1);
        user.setName("Rohit");
        user.setEmail("Rohit@gmail.com");
        user.setPassword("Rohit@cr7");
        
        UserUpdateDTO dto = new UserUpdateDTO();
        dto.setUserId(user.getUserId());
        dto.setName(user.getName());
        dto.setPassword(user.getPassword());
 
        when(repo.findById(1)).thenReturn(Optional.of(user));
        when(repo.save(user)).thenReturn(user);
 
        User changedUser = service.changeUserDetails(dto).getBody();
 
        assertEquals(changedUser.getName(), "Rohit");
    }
 
    @Test
    void testDeleteUserById() {
    	
    	 User user = new User();
         user.setUserId(1);
         user.setName("Mahi");
         user.setEmail("mahi@gmail.com");
         user.setPassword("mahi@cr7");   
         user.setPatientAppointments(new ArrayList<>());
         user.setDoctorAppointments(new ArrayList<>());
	     user.setAvailabilities(new ArrayList<>());
	     user.setPhone("9748643002");
	 
        when(repo.findById(1)).thenReturn(Optional.of(user));
       
        User deletedUser = service.deleteUserById(1).getBody();
        verify(repo, times(1)).delete(user);
 
        assertEquals(deletedUser.getEmail(), "mahi@gmail.com");
    }
 
    @Test
    void testRegisterUser() {
    	
    	 User user = new User();
         user.setUserId(null);
         user.setName("Mainak");
         user.setEmail("m@gmail.com");
         user.setRole(UserRole.DOCTOR);
         user.setPassword("my-encoded-password");   
         user.setPatientAppointments(new ArrayList<>());
         user.setDoctorAppointments(new ArrayList<>());
	     user.setAvailabilities(new ArrayList<>());
	     user.setPhone("9748643002");
 
        UserDTO dto = new UserDTO();
        dto.setName("Mainak");
        dto.setRole(UserRole.DOCTOR);
        dto.setEmail("m@gmail.com");
        dto.setPhone("9748643002");
        dto.setPassword("mainak@cr7");
 
        when(repo.findByEmail(user.getEmail())).thenReturn(Optional.empty());
       
        when(encoder.encode("mainak@cr7")).thenReturn("my-encoded-password");
 
        when(repo.save(user)).thenReturn(user);
 
        User savedUser = service.registerUser(dto).getBody();
 
        assertEquals(savedUser.getEmail(), "m@gmail.com");
    }
}
 
 