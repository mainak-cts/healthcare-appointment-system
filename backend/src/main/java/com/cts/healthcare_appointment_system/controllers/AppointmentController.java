package com.cts.healthcare_appointment_system.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

import com.cts.healthcare_appointment_system.dto.AppointmentDTO;
import com.cts.healthcare_appointment_system.models.Appointment;
import com.cts.healthcare_appointment_system.services.AppointmentService;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;

@RestController
@RequestMapping("/appointments")
@AllArgsConstructor
public class AppointmentController {
	
	private AppointmentService appointmentService;
	
	//Retrieve all appointment details (sorted by time_slot_start)
	@GetMapping
	public ResponseEntity<List<Appointment>> getAllAppointments(
			@RequestParam(defaultValue = "0") int patientId,
			@RequestParam(defaultValue = "0")int doctorId,
			@RequestParam(required = false) LocalDateTime timeSlotStart,
			@RequestParam(required = false) LocalDateTime timeSlotEnd,
			@RequestParam(required = false) String status
			){
		return appointmentService.getAllAppointments(patientId, doctorId, timeSlotStart, timeSlotEnd, status);
	}
	
	//Retrieve a specific appointment by id
	@GetMapping("/{id}")
	public ResponseEntity<Appointment> getAppointmentById(@PathVariable int id){
		return appointmentService.getAppointmentById(id);
	}
	
	//Create a new appointment
	@PostMapping
	public ResponseEntity<Appointment> saveAppointment(@Valid @RequestBody AppointmentDTO dto){
		return appointmentService.saveAppointment(dto);
	}
	
	//Cancel an appointment by id
	@PutMapping("/cancel/{id}")
	public ResponseEntity<Appointment> cancelAppointment(@PathVariable int id){ 
		return appointmentService.cancelAppointment(id);
	}
	
	//Mark as completed an appointment
	@PutMapping("/complete/{id}")
	public ResponseEntity<Appointment> completeAppointment(@PathVariable int id){
		return appointmentService.completeAppointment(id);
	}
	
}
