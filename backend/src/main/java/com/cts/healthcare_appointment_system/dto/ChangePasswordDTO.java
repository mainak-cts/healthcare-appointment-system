package com.cts.healthcare_appointment_system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

// For changing password

@Data
public class ChangePasswordDTO {
    @Email(message = "Email is invalid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotNull(message = "Password is required")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@#$%^&+=!])[A-Za-z\\d@#$%^&+=!]{8,20}$", 
    		 message = "Password must be 8-20 characters long and include at least one letter, one number, and one special character")
    private String newPassword;

}
