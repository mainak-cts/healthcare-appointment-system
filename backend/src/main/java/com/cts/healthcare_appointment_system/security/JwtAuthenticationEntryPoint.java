package com.cts.healthcare_appointment_system.security;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException authException) throws IOException, ServletException {

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");

        String errMsg = authException.getMessage();

        // Send meaningful message when user provides "Bad credentials"
        if (errMsg.equalsIgnoreCase("Bad credentials")) {
            errMsg = "Email or password is incorrect";
        }

        String jsonResponse = "{ \"error\": \"Unauthorized\", "
                + "\"message\": \"" + errMsg + "\", "
                + "\"timestamp\": \"" + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "\" }";

        response.getWriter().write(jsonResponse);
    }

}
