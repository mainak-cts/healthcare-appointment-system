package com.cts.healthcare_appointment_system.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cts.healthcare_appointment_system.dto.ConsultationDTO;
import com.cts.healthcare_appointment_system.dto.ConsultationUpdateDTO;
import com.cts.healthcare_appointment_system.models.Consultation;
import com.cts.healthcare_appointment_system.services.ConsultationService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/consultations")
public class ConsultationController {
	
	private ConsultationService consultationService;
	
    // Retrieve all consultations (optional appointmentId as a query parameter)
    @GetMapping
    public ResponseEntity<List<Consultation>> getAllConsultations(@RequestParam(required = false) Integer appointmentId) {
        return consultationService.getAllConsultations(appointmentId);
    }
    
    //Retrieve Consultation by Id
    @GetMapping("/{id}")
    public ResponseEntity<Consultation> getConsultationById(@PathVariable int id) {
        return consultationService.getConsultationById(id);
    }
    
    // Create a new consultation
    @PostMapping
    public ResponseEntity<Consultation> saveConsultation(@Valid @RequestBody ConsultationDTO consultationDTO) {
        return consultationService.saveConsultation(consultationDTO);
    }

    // Update an existing consultation
    @PutMapping
    public ResponseEntity<Consultation> updateConsultation(@Valid @RequestBody ConsultationUpdateDTO consultationUpdateDTO) {
        return consultationService.updateConsultation(consultationUpdateDTO);
    }

    // Delete a consultation by id
    @DeleteMapping("/{id}")
    public ResponseEntity<Consultation> deleteConsultationById(@PathVariable int id) {
        return consultationService.deleteConsultation(id);
    
}}
