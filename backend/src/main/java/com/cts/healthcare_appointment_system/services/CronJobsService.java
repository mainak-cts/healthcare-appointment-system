package com.cts.healthcare_appointment_system.services;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.cts.healthcare_appointment_system.enums.AppointmentStatus;
import com.cts.healthcare_appointment_system.models.Appointment;
import com.cts.healthcare_appointment_system.models.Availability;
import com.cts.healthcare_appointment_system.repositories.AppointmentRepository;
import com.cts.healthcare_appointment_system.repositories.AvailabilityRepository;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class CronJobsService {

    private AvailabilityRepository availabilityRepo;
    private AppointmentRepository appointmentRepo;
    private NotificationService notificationService;


    @Scheduled(cron = "0 * * ? * *")   
    public void markPastAvailabilitiesUnavailable(){
        // Find all the past slots of today
        List<Availability> availabilities = availabilityRepo.findPastSlotsOfToday();

        // Make the past slots unavailable, and the associated appointments as completed
        availabilities.forEach(av -> {
            if(av.isAvailable()){
                av.setAvailable(false);
            }else{
                List<Appointment> appointments = appointmentRepo.findByDoctorUserIdAndTimeSlotStartAndTimeSlotEnd(av.getDoctor().getUserId(), av.getTimeSlotStart(), av.getTimeSlotEnd());

                appointments.forEach(ap -> {
                    if(ap.getStatus() == AppointmentStatus.BOOKED){
                        // Mark the appointment as completed
                        ap.complete();
                        appointmentRepo.save(ap);

                        // Send completion mail
                        notificationService.sendCompletionEmail(ap);
                    }
                });
            }
            availabilityRepo.save(av);
        });

    }
}
