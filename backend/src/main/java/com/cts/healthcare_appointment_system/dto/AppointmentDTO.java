package com.cts.healthcare_appointment_system.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// For creating a new appointment

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDTO {

    @NotNull(message = "Patient id is required")
    private Integer patientId;

    @NotNull(message = "Doctor id is required")
    private Integer doctorId;

    @NotNull(message = "Time slot start cannot be null")
    private LocalDateTime timeSlotStart;

    @NotNull(message = "Time slot end cannot be null")
    @Future(message = "Time slot end must be in the future")
    private LocalDateTime timeSlotEnd;
}
