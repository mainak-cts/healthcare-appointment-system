package com.cts.healthcare_appointment_system.dto;

import com.cts.healthcare_appointment_system.enums.UserRole;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private int userId;
    private String name;
    private UserRole role;
    private String email;
    private String password;
    private String phone;
}
