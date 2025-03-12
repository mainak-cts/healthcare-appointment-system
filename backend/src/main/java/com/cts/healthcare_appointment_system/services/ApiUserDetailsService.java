package com.cts.healthcare_appointment_system.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.cts.healthcare_appointment_system.models.User;
import com.cts.healthcare_appointment_system.repositories.UserRepository;

@Service
public class ApiUserDetailsService implements UserDetailsService{

    @Autowired
    private UserRepository userRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepo.findByEmail(email).orElse(null);

        if(user == null){
            throw new UsernameNotFoundException("No user found with email: " + email);
        }

        return new ApiUserDetails(user);
    }

}
