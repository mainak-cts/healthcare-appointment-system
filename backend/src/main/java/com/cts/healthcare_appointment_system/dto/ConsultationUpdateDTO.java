package com.cts.healthcare_appointment_system.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// For updating a consultation

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationUpdateDTO {
	
	@NotNull(message = "Consultation id is required")
    private Integer consultationId;
    
    @NotNull(message = "Notes cannot be null")
    @Size(min = 5, max = 500, message = "Notes can only contain 5-500 characters")
    private String notes;
    
    @NotNull(message = "Prescription cannot be null")
    @Size(min = 5, max = 1000, message = "Prescription can only contain 5-1000 characters")
    private String prescription;	
}
