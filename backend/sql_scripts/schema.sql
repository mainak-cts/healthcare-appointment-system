CREATE DATABASE IF NOT EXISTS healthcare;

USE healthcare;
SELECT database() as curr_db;

CREATE TABLE users(
	user_id INT AUTO_INCREMENT,
    name VARCHAR(100),
    role VARCHAR(10) CHECK(role in ('DOCTOR', 'PATIENT')),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(75),
    phone CHAR(10),
    CONSTRAINT user_pk PRIMARY KEY(user_id)
);

CREATE TABLE appointments(
	appointment_id INT AUTO_INCREMENT,
    patient_id INT,
    doctor_id INT,
	time_slot_start TIMESTAMP,
    time_slot_end TIMESTAMP,
    status VARCHAR(15) CHECK(status IN ('BOOKED', 'CANCELLED', 'COMPLETED')),
    CONSTRAINT appointment_pk PRIMARY KEY(appointment_id),
    CONSTRAINT appointment_patient_fk FOREIGN KEY(patient_id) REFERENCES users(user_id),
    CONSTRAINT appointment_doctor_fk FOREIGN KEY(doctor_id) REFERENCES users(user_id)    
);

CREATE TABLE consultations(
	consultation_id INT AUTO_INCREMENT,
    appointment_id INT,
    notes VARCHAR(500),
    prescription VARCHAR(1000),
    CONSTRAINT consultation_pk PRIMARY KEY(consultation_id),
    CONSTRAINT consultation_appointment_fk FOREIGN KEY(appointment_id) REFERENCES appointments(appointment_id)
);

CREATE TABLE availabilities( 
	availability_id INT AUTO_INCREMENT,
    doctor_id INT,
    time_slot_start TIMESTAMP,
    time_slot_end TIMESTAMP,
    is_available BOOLEAN DEFAULT TRUE,
    CONSTRAINT availability_pk PRIMARY KEY(availability_id),
    CONSTRAINT availability_doctor_fk FOREIGN KEY(doctor_id) REFERENCES users(user_id)    
);

-- DROP TABLE users;  
-- DROP TABLE appointments;
-- DROP table consultations;
-- DROP TABLE availabilities;
