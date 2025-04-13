package com.cts.healthcare_appointment_system.services;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.cts.healthcare_appointment_system.dto.AvailabilityDTO;
import com.cts.healthcare_appointment_system.dto.AvailabilityUpdateDTO;
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
public class AvailabilityService {

    private final AvailabilityRepository availabilityRepo;
    private final AppointmentRepository appointmentRepo;
    private final UserRepository userRepo;
    private final NotificationService notificationService;

    // GET methods
    // Get all availabilities 
    public ResponseEntity<List<Availability>> getAllAvailabilities(int doctorId, String namePrefix, LocalDateTime timeSlotStart, LocalDateTime timeSlotEnd, String isAvailable) {
        List<Availability> availabilities = availabilityRepo.findAll(Sort.by(Direction.ASC, "timeSlotStart"));

        // Filter by query params
        if (doctorId != 0) {
            availabilities = availabilities.stream().filter(a -> a.getDoctor().getUserId() == doctorId).toList();
        }

        if (namePrefix != null) {
            if (!namePrefix.trim().equals("")) {
                availabilities = availabilities.stream().filter(a -> a.getDoctor().getName().toLowerCase().startsWith(namePrefix.trim().toLowerCase())).toList();
            }
        }

        if (isAvailable != null) {
            if (isAvailable.equalsIgnoreCase("true")) {
                availabilities = availabilities.stream().filter(a -> a.isAvailable()).toList();
            } else if (isAvailable.equalsIgnoreCase("false")) {
                availabilities = availabilities.stream().filter(a -> !a.isAvailable()).toList();
            }
        }

        if (timeSlotStart != null) {
            availabilities = availabilities.stream().filter(a -> a.getTimeSlotStart().isAfter(timeSlotStart) || a.getTimeSlotStart().isEqual(timeSlotStart)).toList();
        }

        if (timeSlotEnd != null) {
            availabilities = availabilities.stream().filter(a -> a.getTimeSlotEnd().isBefore(timeSlotEnd) || a.getTimeSlotEnd().isEqual(timeSlotEnd)).toList();
        }

        if (availabilities.isEmpty()) {
            throw new ApiException("No availabilities found", HttpStatus.BAD_REQUEST);
        }

        return ResponseEntity.status(HttpStatus.OK).body(availabilities);
    }

    // Get availabilities by id
    public ResponseEntity<Availability> getAllAvailabilityById(int id) {
        Availability availability = availabilityRepo.findById(id).orElse(null);
        if (availability == null) {
            throw new ApiException("Availability not found with id: " + id, HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.status(HttpStatus.OK).body(availability);
    }

    // PUT methods
    @Transactional
    public ResponseEntity<Availability> editAvailability(AvailabilityUpdateDTO dto) {
        int availabilityId = dto.getAvailabilityId();
        int doctorId = dto.getDoctorId();
        LocalDateTime timeSlotStart = dto.getTimeSlotStart();
        LocalDateTime timeSlotEnd = dto.getTimeSlotEnd();

        Availability availability = availabilityRepo.findById(availabilityId).orElse(null);

        // Check the availability is correct or not
        if (availability == null) {
            throw new ApiException("Availability not found with id: " + availabilityId, HttpStatus.BAD_REQUEST);
        }

        // Can't update past time slots
        if (availability.getTimeSlotEnd().isBefore(LocalDateTime.now())) {
            throw new ApiException("Can't update past availability slots", HttpStatus.BAD_REQUEST);
        }

        // Find the associated doctor (if any)
        User doctor = userRepo.findById(doctorId).orElse(null);

        // Check the doctor's correctness
        if (doctor == null || doctor.getRole() != UserRole.DOCTOR) {
            throw new ApiException("Invalid doctor id: " + doctorId, HttpStatus.BAD_REQUEST);
        }

        // Check if the correct doctorId is sent with the availability
        if (availability.getDoctor().getUserId() != doctorId) {
            throw new ApiException("Doctor with id: " + doctorId + " is not associated with availability with id: " + availabilityId, HttpStatus.BAD_REQUEST);
        }

        if (timeSlotStart.isAfter(timeSlotEnd)) {
            throw new ApiException("Invalid time slot details: " + timeSlotStart + " (timeSlotStart) is after " + timeSlotEnd + " (timeSlotEnd)", HttpStatus.BAD_REQUEST);
        }

        // Check if the time slot is valid (within 1 to 3 hrs)
        if (!checkForValidDuration(timeSlotStart, timeSlotEnd, 60L, 180L)) {
            throw new ApiException("Time slot must be at minimum " + 1 + " hr., and maximum " + 3 + " hrs.", HttpStatus.BAD_REQUEST);
        }

        List<Availability> prevAvailabilities = doctor.getAvailabilities();

        // Check whether the timeslot overlaps
        for (Availability av : prevAvailabilities) {
            if (av.getAvailabilityId() != availabilityId) {
                if ((timeSlotStart.isEqual(av.getTimeSlotStart())) || (timeSlotStart.isAfter(av.getTimeSlotStart()) && timeSlotStart.isBefore(av.getTimeSlotEnd()))) {
                    throw new ApiException("Availability slot overlaps", HttpStatus.BAD_REQUEST);
                } else if ((timeSlotEnd.isEqual(av.getTimeSlotEnd())) || (timeSlotEnd.isAfter(av.getTimeSlotStart()) && timeSlotEnd.isBefore(av.getTimeSlotEnd()))) {
                    throw new ApiException("Availability slot overlaps", HttpStatus.BAD_REQUEST);
                } else if (timeSlotStart.isBefore(av.getTimeSlotStart()) && timeSlotEnd.isAfter(av.getTimeSlotEnd())) {
                    throw new ApiException("Availability slot overlaps", HttpStatus.BAD_REQUEST);
                }
            }
        }

        // When the availability slot changes, the associated appointment (if any) must also change
        List<Appointment> appointments = appointmentRepo.findByDoctorUserIdAndTimeSlotStartAndTimeSlotEnd(doctorId, availability.getTimeSlotStart(), availability.getTimeSlotEnd());

        // Change the associated appointment slots
        appointments.forEach(ap -> {

            // Change time slot and send rescheduled email
            if (ap.getStatus() == AppointmentStatus.BOOKED) {
                ap.setTimeSlotStart(timeSlotStart);
                ap.setTimeSlotEnd(timeSlotEnd);
                appointmentRepo.save(ap);
                notificationService.sendRescheduledEmail(ap);
            }
        });

        // Finally, update the availability timeslot
        availability.setTimeSlotStart(timeSlotStart);
        availability.setTimeSlotEnd(timeSlotEnd);

        // Save the edited availability
        availabilityRepo.save(availability);

        log.info("Edited an availability with id: {} from {} to {} for doctor with id: {}", dto.getAvailabilityId(), dto.getTimeSlotStart(), dto.getTimeSlotEnd(), dto.getDoctorId());

        return ResponseEntity.status(HttpStatus.OK).body(availability);
    }

    // POST methods
    // Save a new availability and associate with a doctor
    @Transactional
    public ResponseEntity<Availability> saveAvailability(AvailabilityDTO dto) {
        int doctorId = dto.getDoctorId();
        LocalDateTime timeSlotStart = dto.getTimeSlotStart();
        LocalDateTime timeSlotEnd = dto.getTimeSlotEnd();

        // Find the associated doctor (if any)
        User doctor = userRepo.findById(doctorId).orElse(null);
        // Check the doctor's correctness
        if (doctor == null || doctor.getRole() != UserRole.DOCTOR) {
            throw new ApiException("Invalid doctor id: " + doctorId, HttpStatus.BAD_REQUEST);
        }

        if (timeSlotStart.isAfter(timeSlotEnd)) {
            throw new ApiException("Invalid time slot details: " + timeSlotStart + " (timeSlotStart) is after " + timeSlotEnd + " (timeSlotEnd)", HttpStatus.BAD_REQUEST);
        }

        // Check if the time slot is valid (within 1 to 3 hrs)
        if (!checkForValidDuration(timeSlotStart, timeSlotEnd, 60, 180)) {
            throw new ApiException("Time slot must be at minimum " + 1 + " hrs, and maximum " + 3 + " hrs.", HttpStatus.BAD_REQUEST);
        }

        // Fetch all the previous availabilities
        List<Availability> prevAvailabilities = doctor.getAvailabilities();

        // Check whether the timeslot overlaps
        for (Availability av : prevAvailabilities) {
            if ((timeSlotStart.isEqual(av.getTimeSlotStart())) || (timeSlotStart.isAfter(av.getTimeSlotStart()) && timeSlotStart.isBefore(av.getTimeSlotEnd()))) {
                throw new ApiException("Availability slot overlaps", HttpStatus.BAD_REQUEST);
            } else if ((timeSlotEnd.isEqual(av.getTimeSlotEnd())) || (timeSlotEnd.isAfter(av.getTimeSlotStart()) && timeSlotEnd.isBefore(av.getTimeSlotEnd()))) {
                throw new ApiException("Availability slot overlaps", HttpStatus.BAD_REQUEST);
            } else if (timeSlotStart.isBefore(av.getTimeSlotStart()) && timeSlotEnd.isAfter(av.getTimeSlotEnd())) {
                throw new ApiException("Availability slot overlaps", HttpStatus.BAD_REQUEST);
            }
        }

        Availability newAvailability = new Availability();
        newAvailability.setTimeSlotStart(timeSlotStart);
        newAvailability.setTimeSlotEnd(timeSlotEnd);

        // Associating the new availability with the doctor
        doctor.addAvailability(newAvailability);

        // Save both entities
        availabilityRepo.save(newAvailability);
        userRepo.save(doctor);

        log.info("Created an availability slot from {} to {} for doctor with id: {}", dto.getTimeSlotStart(), dto.getTimeSlotEnd(), dto.getDoctorId());

        return ResponseEntity.status(HttpStatus.CREATED).body(newAvailability);
    }

    // DELETE methods
    // Find an availability with the given id and delete it
    @Transactional
    public ResponseEntity<Availability> deleteAvailabilityByid(int id) {
        // Find the availability with given id
        Availability delAvailability = availabilityRepo.findById(id).orElse(null);
        if (delAvailability == null) {
            throw new ApiException("Availability not found with id: " + id, HttpStatus.BAD_REQUEST);
        }

        // Cancel the associated appointment (if any)
        if (!delAvailability.isAvailable()) {
            List<Appointment> appointments = appointmentRepo.findByDoctorUserIdAndTimeSlotStartAndTimeSlotEnd(delAvailability.getDoctor().getUserId(), delAvailability.getTimeSlotStart(), delAvailability.getTimeSlotEnd());

            // If the time slot is not in the past and can't fetch associated appointments
            if (appointments.isEmpty() && delAvailability.getTimeSlotEnd().isAfter(LocalDateTime.now())) {
                throw new ApiException("Can't fetch the associated appointments", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            // Cancel the associated appointment slots and send cancellation mail
            appointments.forEach(ap -> {
                if (ap.getStatus() == AppointmentStatus.BOOKED) {
                    // Only when no consultation is given delete the associated appointment
                    if(ap.getConsultation() == null){
                        ap.cancel();
                        appointmentRepo.save(ap);
                        log.info("Cancelled an appointment with id: {}", ap.getAppointmentId());
                        // Send cancellation mail
                        notificationService.sendCancellationEmail(ap);
                    }else{
                        throw new ApiException("Please remove the consultation of the associated appointment, before deleting the slot.", HttpStatus.BAD_REQUEST);
                    }
                }
            });
        }

        log.info("Deleted an availability slot with id: {} from {} to {} for doctor with id: {}", id, delAvailability.getTimeSlotStart(), delAvailability.getTimeSlotEnd(), delAvailability.getDoctor().getUserId());
        
        // Breaking the associativity with the doctor
        delAvailability.getDoctor().removeAvailability(delAvailability);

        // Deleting the availability
        availabilityRepo.delete(delAvailability);
        return ResponseEntity.status(HttpStatus.OK).body(delAvailability);
    }

    // Utility methods
    public boolean checkForValidDuration(LocalDateTime start, LocalDateTime end, long min, long max) {
        Duration duration = Duration.between(start, end);
        return duration.toMinutes() <= max && duration.toMinutes() >= min;
    }

}
