package com.cts.healthcare_appointment_system.repositories;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cts.healthcare_appointment_system.models.Availability;
public interface AvailabilityRepository extends JpaRepository<Availability, Integer>{
    public Optional<Availability> findByDoctorUserIdAndTimeSlotStartAndTimeSlotEnd(int doctorId, LocalDateTime timeSlotSlart, LocalDateTime timeSlotEnd);
}
