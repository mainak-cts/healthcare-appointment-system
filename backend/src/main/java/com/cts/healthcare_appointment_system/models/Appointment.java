package com.cts.healthcare_appointment_system.models;

import java.time.LocalDateTime;

import com.cts.healthcare_appointment_system.enums.AppointmentStatus;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private int appointmentId;

    @JsonManagedReference(value = "patient-appointments")
    @ManyToOne(cascade = {CascadeType.MERGE, CascadeType.REFRESH})
    @JoinColumn(name = "patient_id")
    private User patient;

    @JsonManagedReference(value = "doctor-appointments")
    @ManyToOne(cascade = {CascadeType.MERGE, CascadeType.REFRESH})
    @JoinColumn(name = "doctor_id")
    private User doctor;

    @OneToOne(mappedBy = "appointment", cascade = CascadeType.ALL)
    @JsonBackReference
    private Consultation consultation;

    @Column(name = "time_slot_start")
    private LocalDateTime timeSlotStart;

    @Column(name = "time_slot_end")
    private LocalDateTime timeSlotEnd;

    @Enumerated(value = EnumType.STRING)
    @Column(name = "status")
    private AppointmentStatus status;

    public void book() {
        this.setStatus(AppointmentStatus.BOOKED);
    }

    public void cancel() {
        this.setStatus(AppointmentStatus.CANCELLED);
    }

    public void complete() {
        this.setStatus(AppointmentStatus.COMPLETED);
    }

}
