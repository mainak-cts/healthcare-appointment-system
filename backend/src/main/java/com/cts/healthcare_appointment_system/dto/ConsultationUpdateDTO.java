package com.cts.healthcare_appointment_system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationUpdateDTO {
    private int consultationId;
    private String notes;
    private String prescription;
}
