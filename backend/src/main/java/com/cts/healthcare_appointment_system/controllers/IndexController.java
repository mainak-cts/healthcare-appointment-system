package com.cts.healthcare_appointment_system.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IndexController {
    @GetMapping
    public String root(){
        return "Welcome to Healthcare Appointment System!";
    }
}
