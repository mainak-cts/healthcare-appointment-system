package com.cts.healthcare_appointment_system.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.cts.healthcare_appointment_system.dto.AppointmentDTO;
import com.cts.healthcare_appointment_system.enums.AppointmentStatus;
import com.cts.healthcare_appointment_system.enums.UserRole;
import com.cts.healthcare_appointment_system.error.ApiException;
import com.cts.healthcare_appointment_system.models.Appointment;
import com.cts.healthcare_appointment_system.models.Availability;
import com.cts.healthcare_appointment_system.models.User;
import com.cts.healthcare_appointment_system.repositories.AppointmentRepository;
import com.cts.healthcare_appointment_system.repositories.AvailabilityRepository;
import com.cts.healthcare_appointment_system.repositories.UserRepository;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@AllArgsConstructor
public class AppointmentService {

    private AppointmentRepository appointmentRepo;
    private AvailabilityRepository availabilityRepo;
    private UserRepository userRepo;
    private NotificationService notificationService;

    // GET methods
    // Get all appointments
    public ResponseEntity<List<Appointment>> getAllAppointments(int patientId, int doctorId, String patientName, String doctorName, LocalDateTime timeSlotStart, LocalDateTime timeSlotEnd, String status) {
        List<Appointment> appointments = appointmentRepo.findAll(Sort.by(Direction.DESC, "timeSlotStart"));

        // Filter by request params
        if(patientId != 0){
            // As, the associated patient or doctor can be NULL (may be they have deleted their account), checking not NULL to avoid NULL pointer exception
            appointments = appointments.stream().filter(a -> a.getPatient() != null).filter(a -> a.getPatient().getUserId() == patientId).toList();
        }
        if(doctorId != 0){
            appointments = appointments.stream().filter(a -> a.getDoctor() != null).filter(a -> a.getDoctor().getUserId() == doctorId).toList();
        }
        
        if(patientName != null){
            if (!patientName.trim().equals("")) {
                appointments = appointments.stream().filter(a -> a.getPatient() != null).filter(a -> a.getPatient().getName().toLowerCase().startsWith(patientName.trim().toLowerCase())).toList();
            } 
        }

        if(doctorName != null){
            if (!doctorName.trim().equals("")) {
                appointments = appointments.stream().filter(a -> a.getDoctor() != null).filter(a -> a.getDoctor().getName().toLowerCase().startsWith(doctorName.trim().toLowerCase())).toList();
            } 
        }

        if (timeSlotStart != null) {
            appointments = appointments.stream().filter(a -> a.getTimeSlotStart().isAfter(timeSlotStart) || a.getTimeSlotStart().isEqual(timeSlotStart)).toList();
        }

        if (timeSlotEnd != null) {
            appointments = appointments.stream().filter(a -> a.getTimeSlotEnd().isBefore(timeSlotEnd) || a.getTimeSlotEnd().isEqual(timeSlotEnd)).toList();
        }

        if (status != null) {
            if (status.equalsIgnoreCase("cancelled")) {
                appointments = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.CANCELLED).toList();
            } else if (status.equalsIgnoreCase("booked")) {
                appointments = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.BOOKED).toList();
            } else if (status.equalsIgnoreCase("completed")) {
                appointments = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).toList();
            } else {
                throw new ApiException("Invalid status provided: " + status, HttpStatus.BAD_REQUEST);
            }
        }

        if (appointments.isEmpty()) {
            throw new ApiException("No appointments found", HttpStatus.BAD_REQUEST);
        }

        return ResponseEntity.status(HttpStatus.OK).body(appointments);
    }

    // Get appointment by id
    public ResponseEntity<Appointment> getAppointmentById(int id) {
        Appointment appointment = appointmentRepo.findById(id).orElse(null);
        if (appointment == null) {
            throw new ApiException("No appointment found with id: " + id, HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.status(HttpStatus.OK).body(appointment);
    }

    // POST methods
    // Save an appointment
    @Transactional
    public ResponseEntity<Appointment> saveAppointment(AppointmentDTO dto) {
        int patientId = dto.getPatientId();
        int doctorId = dto.getDoctorId();
        LocalDateTime timeSlotStart = dto.getTimeSlotStart();
        LocalDateTime timeSlotEnd = dto.getTimeSlotEnd();

        User patient = userRepo.findById(patientId).orElse(null);
        User doctor = userRepo.findById(doctorId).orElse(null);

        Availability availability = availabilityRepo.findByDoctorUserIdAndTimeSlotStartAndTimeSlotEnd(doctorId, timeSlotStart, timeSlotEnd).orElse(null);

        if (patient == null || patient.getRole() != UserRole.PATIENT) {
            throw new ApiException("Invalid patient id: " + patientId, HttpStatus.BAD_REQUEST);
        }

        if (doctor == null || doctor.getRole() != UserRole.DOCTOR) {
            throw new ApiException("Invalid doctor id: " + doctorId, HttpStatus.BAD_REQUEST);
        }

        if (availability == null) {
            throw new ApiException("Invalid availability time slot details", HttpStatus.BAD_REQUEST);
        }
        if (!availability.isAvailable()) {
            throw new ApiException("Sorry, the slot is not available", HttpStatus.BAD_REQUEST);
        }

        List<Appointment> prevAppointments = patient.getPatientAppointments();

        // Check whether the timeslot overlaps
        for (Appointment ap : prevAppointments) {
            // Only for the booked appointments, check whether the time slot overlaps
            if(ap.getStatus() == AppointmentStatus.BOOKED){
                if ((timeSlotStart.isEqual(ap.getTimeSlotStart())) || (timeSlotStart.isAfter(ap.getTimeSlotStart()) && timeSlotStart.isBefore(ap.getTimeSlotEnd()))) {
                    throw new ApiException("Appoinment slot overlaps", HttpStatus.BAD_REQUEST);
                } else if ((timeSlotEnd.isEqual(ap.getTimeSlotEnd())) || (timeSlotEnd.isAfter(ap.getTimeSlotStart()) && timeSlotEnd.isBefore(ap.getTimeSlotEnd()))) {
                    throw new ApiException("Appoinment slot overlaps", HttpStatus.BAD_REQUEST);
                } else if (timeSlotStart.isBefore(ap.getTimeSlotStart()) && timeSlotEnd.isAfter(ap.getTimeSlotEnd())) {
                    throw new ApiException("Appoinment slot overlaps", HttpStatus.BAD_REQUEST);
                }
            }
        }

        Appointment appointment = new Appointment();
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);
        appointment.setTimeSlotStart(timeSlotStart);
        appointment.setTimeSlotEnd(timeSlotEnd);
        appointment.book();

        availability.setAvailable(false);

        doctor.getDoctorAppointments().add(appointment);
        patient.getPatientAppointments().add(appointment);

        userRepo.save(patient);
        userRepo.save(doctor);

        availabilityRepo.save(availability);

        appointmentRepo.save(appointment);

        log.info("Created new appointment for doctor with id: {} and patient with id: {}", doctor.getUserId(), patient.getUserId());

        // Send appointment booked email
        notificationService.sendBookedEmail(appointment);

        return ResponseEntity.status(HttpStatus.OK).body(appointment);
    }

    // PUT methods
    // Cancel an appointment
    @Transactional
    public ResponseEntity<Appointment> cancelAppointment(int id) {
        Appointment appointment = appointmentRepo.findById(id).orElse(null);
        if (appointment == null) {
            throw new ApiException("Invalid appointment with id: " + id, HttpStatus.BAD_REQUEST);
        }

        if(appointment.getConsultation() != null){
            throw new ApiException("Can't cancel an appointment after consultation is given.", HttpStatus.BAD_REQUEST);
        }

        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            appointment.cancel();
        } else {
            throw new ApiException("Can't cancel a completed appointment", HttpStatus.BAD_REQUEST);
        }
        int doctorId = appointment.getDoctor().getUserId();
        LocalDateTime timeSlotStart = appointment.getTimeSlotStart();
        LocalDateTime timeSlotEnd = appointment.getTimeSlotEnd();

        Availability availability = availabilityRepo.findByDoctorUserIdAndTimeSlotStartAndTimeSlotEnd(doctorId, timeSlotStart, timeSlotEnd).orElse(null);

        // Make the availability slot available, if it is cancelled before end
        if (timeSlotEnd.isAfter(LocalDateTime.now())) {
            if(availability != null){
                availability.setAvailable(true);   // Mark the slot available
                availabilityRepo.save(availability);
            }
        }

        appointmentRepo.save(appointment);

        log.info("Cancelled an appointment with id: {}", appointment.getAppointmentId());

        // Send appointment cancellation email
        notificationService.sendCancellationEmail(appointment);

        return ResponseEntity.status(HttpStatus.OK).body(appointment);
    }

    // Complete an appointment
    @Transactional
    public ResponseEntity<Appointment> completeAppointment(int id) {
        Appointment appointment = appointmentRepo.findById(id).orElse(null);

        if (appointment == null) {
            throw new ApiException("Invalid appointment with id: " + id, HttpStatus.BAD_REQUEST);
        }

        if(appointment.getStatus() == AppointmentStatus.CANCELLED){
            throw new ApiException("Can't mark a cancelled appointment as completed", HttpStatus.BAD_REQUEST);
        }

        int doctorId = appointment.getDoctor().getUserId();
        LocalDateTime timeSlotStart = appointment.getTimeSlotStart();
        LocalDateTime timeSlotEnd = appointment.getTimeSlotEnd();

        Availability availability = availabilityRepo.findByDoctorUserIdAndTimeSlotStartAndTimeSlotEnd(doctorId, timeSlotStart, timeSlotEnd).orElse(null);

        // If the appointment already started?
        if (appointment.getTimeSlotStart().isBefore(LocalDateTime.now())) {
            appointment.complete();   // Mark as complete
            if(availability != null){
                availability.setAvailable(false);   // Make the slot unavailable
                availabilityRepo.save(availability);
            }
        } else {
            throw new ApiException("Can't mark as complete an appointment before it has started", HttpStatus.BAD_REQUEST);
        }

        appointmentRepo.save(appointment);

        log.info("Completed an appointment with id: {}", appointment.getAppointmentId());

        // Send appointment completion email
        notificationService.sendCompletionEmail(appointment);

        return ResponseEntity.status(HttpStatus.OK).body(appointment);
    }
}

