package com.cts.healthcare_appointment_system.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

// For representing user login data

@Data
public class UserLoginDTO {

    @Email(message = "Email is invalid")
    @NotNull(message = "Email can't be null")
    private String email;

    @NotNull(message = "Password can't be null")
    String password;
}
