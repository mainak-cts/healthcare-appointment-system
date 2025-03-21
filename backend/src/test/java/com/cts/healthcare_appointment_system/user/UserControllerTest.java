package com.cts.healthcare_appointment_system.user;

import java.util.List;

import org.junit.jupiter.api.Test;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
 
import com.cts.healthcare_appointment_system.dto.UserDTO;
import com.cts.healthcare_appointment_system.dto.UserUpdateDTO;
import com.cts.healthcare_appointment_system.enums.UserRole;
import com.cts.healthcare_appointment_system.models.User;
import com.cts.healthcare_appointment_system.services.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)   // To skip security checks
public class UserControllerTest {
 
    @MockitoBean
    private UserService service;
 
    @Autowired
    private MockMvc mockMvc;
 
    @Test
    public void testGetUserById() throws Exception{
        User user = new User();
        user.setUserId(1);
        user.setName("alex");
        user.setEmail("alex@gmail.com");
        user.setPassword("alex@cr7");
 
        when(service.getUserById(1)).thenReturn(ResponseEntity.ok(user));
 
        mockMvc.perform(get("/users/{id}", 1)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("alex"))
                .andDo(print());
    }
 
    @Test
    public void testGetAllUsers() throws Exception{
        User user1 = new User();
        user1.setUserId(1);
        user1.setName("Alex1");
        user1.setEmail("alex1gmail.com");
        user1.setPassword("alex@cr7");
        User user2 = new User();
        user2.setUserId(2);
        user2.setName("Alex");
        user2.setEmail("alex@gmail.com");
        user2.setPassword("alex@123");
        List<User> users = List.of(user1, user2);
 
        when(service.getAllusers()).thenReturn(ResponseEntity.ok(users));
 
        mockMvc.perform(get("/users")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Alex1"))
                .andExpect(jsonPath("$[1].name").value("Alex"))
                .andDo(print());
    }
 
    @Test
    public void testSaveUser() throws Exception{
    	
        User user = new User();
        user.setUserId(1);
        user.setName("Mainak");
        user.setEmail("mainak@gmail.com");
        user.setPassword("mainak@cr7");
        user.setRole(UserRole.PATIENT);
        user.setPhone("9876543210");
        
        UserDTO dto = new UserDTO();
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        dto.setRole(user.getRole());
        dto.setPassword(user.getPassword());
        dto.setPhone(user.getPhone());
 
        when(service.registerUser(dto)).thenReturn(ResponseEntity.status(HttpStatus.CREATED).body(user));
 
        mockMvc.perform(post("/users/register")
                .content(new ObjectMapper().writeValueAsString(dto))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Mainak"))
                .andDo(print());
    }
 
    @Test
    public void testChangeUserDetails() throws Exception{
 
        User user = new User();
        user.setUserId(1);
        user.setName("Subham");
        user.setEmail("subham@gmail.com");
        user.setPassword("subham@cr7");
        user.setRole(UserRole.PATIENT);
        user.setPhone("9876543210");

        UserUpdateDTO dto = new UserUpdateDTO();
        dto.setUserId(1);
        dto.setName(user.getName());
        dto.setPassword(user.getPassword());
        dto.setPhone(user.getPhone());
 
        when(service.changeUserDetails(dto)).thenReturn(ResponseEntity.status(HttpStatus.OK).body(user));
 
        mockMvc.perform(put("/users")
                .content(new ObjectMapper().writeValueAsString(dto))
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Subham"))
                .andExpect(jsonPath("$.email").value("subham@gmail.com"))
                .andDo(print());
    }
 
    @Test
    public void testRemoveUser() throws Exception{
 
        User user = new User();
        user.setUserId(1);
        user.setName("Janavi");
        user.setEmail("Janavi@gmail.com");
        user.setPassword("Janavi@cr7");
        user.setRole(UserRole.PATIENT);

        when(service.deleteUserById(1)).thenReturn(ResponseEntity.status(HttpStatus.OK).body(user));
 
        mockMvc.perform(delete("/users/{id}", 1)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Janavi"))
                .andExpect(jsonPath("$.email").value("Janavi@gmail.com"))
                .andDo(print());
    } 
 
}
 