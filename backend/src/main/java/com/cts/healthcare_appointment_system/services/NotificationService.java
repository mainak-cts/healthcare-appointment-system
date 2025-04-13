package com.cts.healthcare_appointment_system.services;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;

import com.cts.healthcare_appointment_system.models.Appointment;
import com.cts.healthcare_appointment_system.models.User;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class NotificationService {

    private EmailService service;

    
    public void sendReminderEmail(Appointment appointment){

        User doctor = appointment.getDoctor();
        User patient = appointment.getPatient();
        int appointmentId = appointment.getAppointmentId();
        LocalDate dateOfAppointment = appointment.getTimeSlotStart().toLocalDate();
        String timeStartOfAppointment = formatTime(appointment.getTimeSlotStart().toLocalTime());
        String timeEndOfAppointment = formatTime(appointment.getTimeSlotEnd().toLocalTime());

        String subject = "Reminder: Upcoming Appointment";

        String patientEmailBody = "Dear " + patient.getName() + "," + "\n\n" + "This is a friendly reminder of your upcoming appointment with Dr. " + doctor.getName() + "." + "\n\n" + "Appointment Id:" + appointmentId + "\nDate: " + dateOfAppointment + "\nTime: " + timeStartOfAppointment + " to " + timeEndOfAppointment + "\n\n" + "Please ensure you arrive on time." + "\n\n" + "Best Regards," + "\n" + "Healthcare Appointment System";

        String doctorEmailBody = "Dear Dr. " + doctor.getName() + "," + "\n\n" + "This is a friendly reminder of your upcoming appointment with " + patient.getName() + "." + "\n\n" + "Appointment Id:" + appointmentId + "\nDate: " + dateOfAppointment + "\nTime: " + timeStartOfAppointment + " to " + timeEndOfAppointment + "\n\n" + "Please ensure you are available for the consultation." + "\n\n" + "Best Regards," + "\n" + "Healthcare Appointment System";

        service.sendEmail(doctor.getEmail(), subject, doctorEmailBody);
        service.sendEmail(patient.getEmail(), subject, patientEmailBody);
    }

    public void sendCompletionEmail(Appointment appointment){

        User doctor = appointment.getDoctor();
        User patient = appointment.getPatient();
        int appointmentId = appointment.getAppointmentId();
        LocalDate dateOfAppointment = appointment.getTimeSlotStart().toLocalDate();
        String timeStartOfAppointment = formatTime(appointment.getTimeSlotStart().toLocalTime());
        String timeEndOfAppointment = formatTime(appointment.getTimeSlotEnd().toLocalTime());

        String subject = "Appointment Completed";

        String patientEmailBody = "Dear " + patient.getName() + "," + "\n\n" + "Your appointment with Dr. " + doctor.getName() + " on "+ dateOfAppointment + " at " + timeStartOfAppointment + " to " + timeEndOfAppointment + " (Appointment ID: " + appointmentId + ")" + " has been successfully completed.\n\n" + "If you need any further assistance or follow-up, please reach out to our clinic." + "\n\n" + "Best Regards," + "\n" + "Healthcare Appointment System";

        String doctorEmailBody = "Dear Dr. " + doctor.getName() + "," + "\n\n" + "Your appointment with " + patient.getName() + " on "+ dateOfAppointment + " at " + timeStartOfAppointment + " to " + timeEndOfAppointment + " (Appointment ID: " + appointmentId + ")" + " has been successfully completed. Please give the needed consultation to the patient, if not given.\n\n" + "If you need any further assistance or follow-up, please reach out to our clinic." + "\n\n" + "Best Regards," + "\n" + "Healthcare Appointment System";

        service.sendEmail(doctor.getEmail(), subject, doctorEmailBody);
        service.sendEmail(patient.getEmail(), subject, patientEmailBody);
    }

    public void sendCancellationEmail(Appointment appointment){

        User doctor = appointment.getDoctor();
        User patient = appointment.getPatient();
        int appointmentId = appointment.getAppointmentId();
        LocalDate dateOfAppointment = appointment.getTimeSlotStart().toLocalDate();
        String timeStartOfAppointment = formatTime(appointment.getTimeSlotStart().toLocalTime());

        String subject = "Appointment Cancelled";

        String patientEmailBody = "Dear " + patient.getName() + ",\n\n" +
        "We regret to inform you that your appointment with Dr. " + doctor.getName() + 
        " on " + dateOfAppointment + " at " + timeStartOfAppointment + " (Appointment ID: " + appointmentId + ")" + " has been cancelled.\n\n" +
        "If you have any questions or need assistance, please do not hesitate to contact us through our system.\n\n" +
        "Thank you for your understanding.\n\n" +
        "Best Regards,\n" +
        "Healthcare Appointment System";

        String doctorEmailBody = "Dear Dr. " + doctor.getName() + ",\n\n" +
        "We regret to inform you that your appointment with " + patient.getName() + 
        " on " + dateOfAppointment + " at " + timeStartOfAppointment + " (Appointment ID: " + appointmentId + ")" + " has been cancelled.\n\n" +
        "If you have any questions or need assistance, please do not hesitate to contact us through our system.\n\n" +
        "Thank you for your understanding.\n\n" +
        "Best Regards,\n" +
        "Healthcare Appointment System";

        service.sendEmail(doctor.getEmail(), subject, doctorEmailBody);
        service.sendEmail(patient.getEmail(), subject, patientEmailBody);
    }

    public void sendBookedEmail(Appointment appointment){

        User doctor = appointment.getDoctor();
        User patient = appointment.getPatient();
        int appointmentId = appointment.getAppointmentId();
        LocalDate dateOfAppointment = appointment.getTimeSlotStart().toLocalDate();
        String timeStartOfAppointment = formatTime(appointment.getTimeSlotStart().toLocalTime());
        String timeEndOfAppointment = formatTime(appointment.getTimeSlotEnd().toLocalTime());

        String subject = "Appointment Booked";

        String patientEmailBody = "Dear " + patient.getName() + "," + "\n\n" + "Your appointment with Dr. " + doctor.getName() + " has been successfully booked.\n\n" + "Appointment Id:" + appointmentId + "\nDate: " + dateOfAppointment + "\nTime: " + timeStartOfAppointment + " to " + timeEndOfAppointment + "\n\n" + "Please ensure you arrive on time." + "\n\n" + "Best Regards," + "\n" + "Healthcare Appointment System";

        String doctorEmailBody = "Dear Dr. " + doctor.getName() + "," + "\n\n" + "A new appointment has been booked with " + patient.getName() + ".\n\n" + "Appointment Id:" + appointmentId + "\nDate: " + dateOfAppointment + "\nTime: " + timeStartOfAppointment + " to " + timeEndOfAppointment + "\n\n" + "Please be prepared for the consultation." + "\n\n" + "Best Regards," + "\n" + "Healthcare Appointment System";

        service.sendEmail(doctor.getEmail(), subject, doctorEmailBody);
        service.sendEmail(patient.getEmail(), subject, patientEmailBody);
    }

    public void sendRescheduledEmail(Appointment appointment){

        User doctor = appointment.getDoctor();
        User patient = appointment.getPatient();
        int appointmentId = appointment.getAppointmentId();
        LocalDate dateOfAppointment = appointment.getTimeSlotStart().toLocalDate();
        String timeStartOfAppointment = formatTime(appointment.getTimeSlotStart().toLocalTime());
        String timeEndOfAppointment = formatTime(appointment.getTimeSlotEnd().toLocalTime());

        String subject = "Appointment Rescheduled";

        String patientEmailBody = "Dear " + patient.getName() + "," + "\n\n" + "Your appointment with Dr. " + doctor.getName() + " has been rescheduled.\n\n" + "Appointment Id:" + appointmentId + "\nNew Date: " + dateOfAppointment + "\nNew Time: " + timeStartOfAppointment + " to " + timeEndOfAppointment + "\n\n" + "If you have any issues with the new timing, please contact us." + "\n\n" + "Best Regards," + "\n" + "Healthcare Appointment System";
        
        service.sendEmail(patient.getEmail(), subject, patientEmailBody);
    }

    public void sendConsultationEmail(Appointment appointment){
        User patient = appointment.getPatient();
        User doctor = appointment.getDoctor();
        int appointmentId = appointment.getAppointmentId();
        LocalDate dateOfAppointment = appointment.getTimeSlotStart().toLocalDate();
        String timeStartOfAppointment = formatTime(appointment.getTimeSlotStart().toLocalTime());
        String timeEndOfAppointment = formatTime(appointment.getTimeSlotEnd().toLocalTime());

        String subject = "Appointment Rescheduled";

        String patientEmailBody = "Dear " + patient.getName() + "," + "\n\n" + "Dr. " + doctor.getName() + " has given valuable consultation for the appointment - \n\n" + "Appointment Id:" + appointmentId + "\nDate: " + dateOfAppointment + "\nTime: " + timeStartOfAppointment + " to " + timeEndOfAppointment + "\n\n" + "Please check it out and if you face any issues, please contact us." + "\n\n" + "Best Regards," + "\n" + "Healthcare Appointment System";
        
        service.sendEmail(patient.getEmail(), subject, patientEmailBody);
    }

    private String formatTime(LocalTime time){
        DateTimeFormatter formmater = DateTimeFormatter.ofPattern("hh:mm:ss a");
        return time.format(formmater);
    }



}
