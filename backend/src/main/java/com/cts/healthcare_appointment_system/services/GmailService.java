package com.cts.healthcare_appointment_system.services;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class GmailService implements EmailService{

    private JavaMailSender mailSender;

    @Override
    @Async
    public void sendEmail(String recieverEmail, String subject, String body) {

        SimpleMailMessage mail = new SimpleMailMessage();

        // Set reciever email id
        mail.setTo(recieverEmail);

        // Set subject of the email
        mail.setSubject(subject);

        // Set body of the email
        mail.setText(body);

        // Send the email
        mailSender.send(mail);
    }
    
}
