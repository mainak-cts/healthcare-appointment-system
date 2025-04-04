package com.cts.healthcare_appointment_system.models;

import java.util.ArrayList;
import java.util.List;

import com.cts.healthcare_appointment_system.enums.UserRole;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "name")
    private String name;

    @Enumerated(value = EnumType.STRING)
    @Column(name = "role")
    private UserRole role;

    // If the User is a 'PATIENT', then only it is relevant
    @JsonBackReference(value = "patient-appointments")
    @OneToMany(mappedBy = "patient", cascade = {CascadeType.DETACH, CascadeType.REFRESH})
    private List<Appointment> patientAppointments = new ArrayList<>();

    // If the User is a 'DOCTOR', then only it is relevant
    @JsonBackReference(value = "doctor-appointments")
    @OneToMany(mappedBy = "doctor", cascade = {CascadeType.DETACH, CascadeType.REFRESH})
    private List<Appointment> doctorAppointments = new ArrayList<>();

    // If the User is a 'DOCTOR', then only it is relevant
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference(value = "doctor-availabilities")
    private List<Availability> availabilities = new ArrayList<>();

    @Column(name = "email")
    private String email;

    @Column(name = "password")
    @JsonProperty(access = Access.WRITE_ONLY)
    private String password;

    @Column(name = "phone", columnDefinition = "CHAR(10)")
    private String phone;

    // To add availability to the current user (DOCTOR)
    public void addAvailability(Availability availability) {
        availability.setDoctor(this);
        this.availabilities.add(availability);
    }

    // To remove availability to the current user (DOCTOR)
    public void removeAvailability(Availability availability) {
        availability.setDoctor(null);
        this.availabilities.remove(availability);
    }

}
