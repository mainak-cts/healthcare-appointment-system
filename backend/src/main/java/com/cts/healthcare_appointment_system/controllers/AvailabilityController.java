package com.cts.healthcare_appointment_system.controllers;

import java.time.LocalDateTime;
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

import com.cts.healthcare_appointment_system.dto.AvailabilityDTO;
import com.cts.healthcare_appointment_system.dto.AvailabilityUpdateDTO;
import com.cts.healthcare_appointment_system.models.Availability;
import com.cts.healthcare_appointment_system.services.AvailabilityService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@AllArgsConstructor
@RequestMapping("/availabilities")
public class AvailabilityController {

    private AvailabilityService availabilityService;

    // Retrieves all availabilities
    @GetMapping
    public ResponseEntity<List<Availability>> getAllAvailabilities(
            @RequestParam(defaultValue = "0") int doctorId,
            @RequestParam(required = false) String namePrefix,
            @RequestParam(required = false) LocalDateTime timeSlotStart,
            @RequestParam(required = false) LocalDateTime timeSlotEnd,
            @RequestParam(required = false) String isAvailable) {
        return availabilityService.getAllAvailabilities(doctorId, namePrefix, timeSlotStart, timeSlotEnd, isAvailable);
    }

    // Retrieves availability by Id
    @GetMapping("/{id}")
    public ResponseEntity<Availability> getAvailabilityById(@PathVariable int id) {
        return availabilityService.getAllAvailabilityById(id);
    }

    // Saves new availability
    @PostMapping
    public ResponseEntity<Availability> saveAvailability(@Valid @RequestBody AvailabilityDTO dto) {
        return availabilityService.saveAvailability(dto);

    }

    // Edit an existing availability
    @PutMapping
    public ResponseEntity<Availability> editAvailability(@Valid @RequestBody AvailabilityUpdateDTO dto) {
        return availabilityService.editAvailability(dto);
    }

    // Delete availability by Id
    @DeleteMapping("/{id}")
    public ResponseEntity<Availability> deleteAvailabilityById(@PathVariable int id) {
        return availabilityService.deleteAvailabilityByid(id);
    }

}
