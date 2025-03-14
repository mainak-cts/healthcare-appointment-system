package com.cts.healthcare_appointment_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class HealthcareAppointmentSystemApplication {

	public static void main(String[] args) {
		SpringApplication.run(HealthcareAppointmentSystemApplication.class, args);
	}

}
