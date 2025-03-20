package com.cts.healthcare_appointment_system.repositories;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cts.healthcare_appointment_system.models.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer>{
    public List<Appointment> findByDoctorUserIdAndTimeSlotStartAndTimeSlotEnd(int doctorId, LocalDateTime timeSlotSlart, LocalDateTime timeSlotEnd);

    public List<Appointment> findByTimeSlotStartBetween(LocalDateTime start, LocalDateTime end);
}
