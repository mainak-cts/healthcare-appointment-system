package com.cts.healthcare_appointment_system.dto;

import lombok.Data;

// For sending JWT token after login

@Data
public class JwtDTO {
    private String email;
    private int userId;
    private String jwtToken;
}
