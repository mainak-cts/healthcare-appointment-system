package com.cts.healthcare_appointment_system.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.cts.healthcare_appointment_system.models.Availability;
public interface AvailabilityRepository extends JpaRepository<Availability, Integer>{
    public Optional<Availability> findByDoctorUserIdAndTimeSlotStartAndTimeSlotEnd(int doctorId, LocalDateTime timeSlotSlart, LocalDateTime timeSlotEnd);

    // Find all the past availability slots of the current date
    @Query("SELECT a FROM Availability a WHERE DATE(a.timeSlotStart) = CURRENT_DATE AND a.timeSlotEnd <= CURRENT_TIMESTAMP")
    public List<Availability> findPastSlotsOfToday();
}
