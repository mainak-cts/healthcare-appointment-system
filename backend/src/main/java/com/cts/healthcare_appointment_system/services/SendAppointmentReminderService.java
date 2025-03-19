package com.cts.healthcare_appointment_system.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.cts.healthcare_appointment_system.enums.AppointmentStatus;
import com.cts.healthcare_appointment_system.models.Appointment;
import com.cts.healthcare_appointment_system.repositories.AppointmentRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class SendAppointmentReminderService {
    
    private AppointmentRepository appointmentRepo;
    private NotificationService notificationService;
    
    @Scheduled(cron = "0 0 * * * *")
    public void sendAppointmentReminder(){

        // Fetch the upcoming appointments (within next 2 hrs)
        LocalDateTime currTime = LocalDateTime.now();
        LocalDateTime after2Hrs = currTime.plusHours(2);

        List<Appointment> upcomingAppointments = appointmentRepo.findByTimeSlotStartBetween(currTime, after2Hrs);

        // Only send the appointment reminders to the BOOKED appointments
        for(Appointment a: upcomingAppointments){
            if(a.getStatus() == AppointmentStatus.BOOKED){
                notificationService.sendReminderEmail(a);
            }
        }
    }
}
