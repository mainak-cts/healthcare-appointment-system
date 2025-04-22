package com.cts.healthcare_appointment_system.services;

import org.springframework.mail.MailSendException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
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

        try {
			// Send the email
			mailSender.send(mail);
		} catch (MailSendException e) {
			log.error("Can't send mail to: {}, error message: {}", recieverEmail, e.getMessage());
		}
    }
    
}
