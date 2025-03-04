package com.cts.healthcare_appointment_system.models;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

/* TODO
    1. Field validations 
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "availabilities")
public class Availability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "availability_id")
    private int availabilityId;

    @ManyToOne(cascade = {CascadeType.MERGE, CascadeType.REFRESH})
    @JoinColumn(name = "doctor_id")
    @JsonBackReference(value = "doctor-availabilities")
    @ToString.Exclude
    private User doctor;

    @Column(name = "time_slot_start")
    private LocalDateTime timeSlotStart;

    @Column(name = "time_slot_end")
    private LocalDateTime timeSlotEnd;

    @Column(name = "is_available")
    private boolean isAvailable = true;
}
