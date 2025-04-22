package com.cts.healthcare_appointment_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// For updating an user

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateDTO {
	@NotNull(message = "User id is required")
	private Integer userId;

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 255, message="Name can only contain 2-255 characters")
    private String name;

    @NotNull(message = "Password is required")
    @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@#$%^&+=!])[A-Za-z\\d@#$%^&+=!]{8,20}$", 
    		 message = "Password must be 8-20 characters long and include at least one letter, one number, and one special character")
    private String password;

    @NotNull(message = "Phone number is required")
    @Pattern(regexp = "\\d{10}", message = "Phone number is invalid")
    private String phone;
}
