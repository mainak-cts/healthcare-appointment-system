package com.cts.healthcare_appointment_system.error;
 
import java.util.HashMap;
import java.util.Map;
 
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
 
import jakarta.servlet.http.HttpServletRequest;
 
@RestControllerAdvice
public class ApiExceptionHandler{
 
    // Handle Api exceptions
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, String>> handleApiException(ApiException ex){
        Map<String, String> err = new HashMap<>();
 
        err.put("error", "ApiException");
        err.put("message", ex.getMessage());
        err.put("statusCode", ex.getErrorCode().toString());
 
        return ResponseEntity.status(ex.getErrorCode()).body(err);
    }
 
    // Handle field validaiton exceptions
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex){
        Map<String, String> err = new HashMap<>();
 
        err.put("error", "Field Validation Error");
        ex.getBindingResult().getFieldErrors().forEach(e -> {
            err.put(e.getField(), e.getDefaultMessage());
        });
 
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }
 
    // Handle Database integrity violation exceptions
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDataIntegrityViolationException(DataIntegrityViolationException ex){
        Map<String, Map<String, String>> errorMap = new HashMap<>();
        Map<String, String> err = new HashMap<>();
       
        err.put("error", "Database Constraint Violation");
        err.put("message", ex.getRootCause().getMessage());
        err.put("statusCode", HttpStatus.BAD_REQUEST.toString());
 
        errorMap.put("error", err);
 
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }
 
    // Handle HTTP method not allowed exception
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, String>> handleHttpRequestMethodNotSupported(HttpRequestMethodNotSupportedException ex, HttpServletRequest req){
 
        Map<String, String> err = new HashMap<>();
       
        err.put("error", "Method Not Allowed");
        err.put("message", "This HTTP method is not supported for this endpoint");
        err.put("requestedEndpoint", req.getRequestURI());
        err.put("requestedMethod", req.getMethod());
        err.put("supportedMethods", String.join(", ", ex.getSupportedMethods()));
        err.put("statusCode", HttpStatus.BAD_REQUEST.toString());
 
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }
 
    // Handle message not readable exception
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex, HttpServletRequest req){
 
        Map<String, String> err = new HashMap<>();
       
        err.put("error", "Invalid Request Body");
        err.put("message", ex.getMessage());
        err.put("statusCode", HttpStatus.BAD_REQUEST.toString());
 
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    // Handle Bad credentials exception
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, String>> handleBackCredentials(BadCredentialsException ex){
        Map<String, String> err = new HashMap<>();
       
        err.put("error", ex.getClass().getSimpleName());
        err.put("message", "Email or password is incorrect");
        err.put("statusCode", HttpStatus.BAD_REQUEST.toString());
 
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(err);
    }

    // Handle all other unhandled exceptions (generic exception handler)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex){
 
        Map<String, String> err = new HashMap<>();
       
        err.put("error", ex.getClass().getSimpleName());
        err.put("message", ex.getMessage());
        err.put("statusCode", HttpStatus.INTERNAL_SERVER_ERROR.toString());
 
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(err);
    } 
   
 
 
}