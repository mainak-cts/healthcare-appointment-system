package com.cts.healthcare_appointment_system.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AvailabilityDTO {
	@NotNull(message = "Doctor id is required")
    private Integer doctorId;

    @NotNull(message = "Time slot start cannot be null")
    @Future(message = "Time slot start must be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timeSlotStart;

    @NotNull(message = "Time slot end cannot be null")
    @Future(message = "Time slot end must be in the future")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timeSlotEnd;
}
