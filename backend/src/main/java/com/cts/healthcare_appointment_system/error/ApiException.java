package com.cts.healthcare_appointment_system.error;

import org.springframework.http.HttpStatus;

import lombok.Getter;

@Getter
public class ApiException extends RuntimeException{
    private HttpStatus errorCode;
    public ApiException(String message, HttpStatus erroCode){
        super(message);
        this.errorCode = erroCode;
    }
}