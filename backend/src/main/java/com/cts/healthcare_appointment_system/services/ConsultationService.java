package com.cts.healthcare_appointment_system.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.cts.healthcare_appointment_system.dto.ConsultationDTO;
import com.cts.healthcare_appointment_system.dto.ConsultationUpdateDTO;
import com.cts.healthcare_appointment_system.enums.AppointmentStatus;
import com.cts.healthcare_appointment_system.error.ApiException;
import com.cts.healthcare_appointment_system.models.Appointment;
import com.cts.healthcare_appointment_system.models.Consultation;
import com.cts.healthcare_appointment_system.repositories.AppointmentRepository;
import com.cts.healthcare_appointment_system.repositories.ConsultationRepository;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@AllArgsConstructor
public class ConsultationService {

    private ConsultationRepository repo;
    private AppointmentRepository appointmentRepo;
    private NotificationService notificationService;

    // GET methods
    // Get all consultations
    public ResponseEntity<List<Consultation>> getAllConsultations(Integer appointmentId){
        List<Consultation> consultations;
        // appointmentId not provided
        if(appointmentId == null){
            consultations = repo.findAll();
            if(consultations.isEmpty()){
                throw new ApiException("No consultations available", HttpStatus.BAD_REQUEST);
            }
        }else{  // appointmentId provided
            Consultation consultation = repo.findByAppointmentAppointmentId(appointmentId).orElse(null);
            if(consultation == null){
                throw new ApiException("No consultation available with appointment id: " + appointmentId, HttpStatus.BAD_REQUEST);
            }
            consultations = List.of(consultation);
        }
        return ResponseEntity.status(HttpStatus.OK).body(consultations);
    }

    // Get consultation by id
    public ResponseEntity<Consultation> getConsultationById(int id){
        Consultation consultation = repo.findById(id).orElse(null);
        if(consultation == null){
            throw new ApiException("No consultation available with id: " + id, HttpStatus.BAD_REQUEST);
        }
        return ResponseEntity.status(HttpStatus.OK).body(consultation);
    }

    // POST methods
    // Save consultation
    @Transactional
    public ResponseEntity<Consultation> saveConsultation(ConsultationDTO dto){
        int appointmentId = dto.getAppointmentId();
        String notes = dto.getNotes();
        String prescription = dto.getPrescription();
        Appointment appointment = appointmentRepo.findById(appointmentId).orElse(null);

        if(appointment == null){
            throw new ApiException("No appointment with id: " + appointmentId, HttpStatus.BAD_REQUEST);
        }
        if(appointment.getStatus() == AppointmentStatus.CANCELLED){
            throw new ApiException("Appointment with id: " + appointmentId + " is cancelled", HttpStatus.BAD_REQUEST);
        }

        if(appointment.getConsultation() != null){
            throw new ApiException("Appointment with id: " + appointmentId + " is alreay having one consultation, please modify it or delete it", HttpStatus.BAD_REQUEST);
        }

        // Consultation can't be given before the appointment has started
        if(appointment.getTimeSlotStart().isAfter(LocalDateTime.now())){
            throw new ApiException("Can't give consultation before the appointment has started", HttpStatus.BAD_REQUEST);
        }

        Consultation consultation = new Consultation();

        consultation.setAppointment(appointment);
        consultation.setNotes(notes);
        consultation.setPrescription(prescription);
        repo.save(consultation);

        appointment.setConsultation(consultation);
        appointmentRepo.save(appointment);

        // Send consultation given mail to the patient
        notificationService.sendConsultationEmail(appointment);

        log.info("Created a new consultation for appointmentd with id: {}", dto.getAppointmentId());

        return ResponseEntity.status(HttpStatus.OK).body(consultation);
    }

    // PUT methods
    // Update consultation
    @Transactional
    public ResponseEntity<Consultation> updateConsultation(ConsultationUpdateDTO dto){
        int consultationId = dto.getConsultationId();
        String notes = dto.getNotes();
        String prescription = dto.getPrescription();

        Consultation consultation = repo.findById(consultationId).orElse(null);

        if(consultation == null){
            throw new ApiException("Invalid consultation id: " + consultationId, HttpStatus.BAD_REQUEST);
        }

        consultation.setNotes(notes);
        consultation.setPrescription(prescription);

        repo.save(consultation);

        log.info("Updated a consultation with id: {} for appointmentId: {}", consultation.getConsultationId(), consultation.getAppointment().getAppointmentId());

        return ResponseEntity.status(HttpStatus.OK).body(consultation);
    }

    // DELETE consultation
    @Transactional
    public ResponseEntity<Consultation> deleteConsultation(int id){
        Consultation consultation = repo.findById(id).orElse(null);

        if(consultation == null){
            throw new ApiException("Invalid consultation id: " + id, HttpStatus.BAD_REQUEST);
        }
        
        log.info("Deleted a consultation with id: {} for appointmentId: {}", consultation.getConsultationId(), consultation.getAppointment().getAppointmentId());

        Appointment appointment = consultation.getAppointment();
        appointment.setConsultation(null);
        consultation.setAppointment(null);

        appointmentRepo.save(appointment);
        repo.delete(consultation);


        return ResponseEntity.status(HttpStatus.OK).body(consultation);
    }
    
}
