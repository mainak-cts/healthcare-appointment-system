package com.cts.healthcare_appointment_system.controllers;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



@RestController
@RequestMapping("/users")
public class UserController {
    Map<String, String> user = new HashMap<>();
    @GetMapping("")
    public Map<String, String> getAllUSers() {
        user.put("name", "Mainak");
        user.put("company", "CTS");
        return user;
    }
}
