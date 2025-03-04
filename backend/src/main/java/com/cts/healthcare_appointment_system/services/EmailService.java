package com.cts.healthcare_appointment_system.services;

public interface EmailService {
    void sendEmail(String recieverEmail, String subject, String body);
}
