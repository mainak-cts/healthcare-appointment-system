package com.cts.healthcare_appointment_system.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.cts.healthcare_appointment_system.models.Consultation;

public interface ConsultationRepository extends JpaRepository<Consultation, Integer>{
    public Optional<Consultation> findByAppointmentAppointmentId(int appointmentId);
}
