import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { AuthApiService } from "./authapi.service";
import { AppointmentData } from "../app/models/AppointmentData";
import { Appointment } from "../app/models/Appointment";
import { BASE_URLS } from "../environment/environment";

@Injectable({providedIn: 'root'})
export class AppointmentApiService{
    private BASE_URL = BASE_URLS.APPOINTMENT_BASE_URL;
    
    private httpClient = inject(HttpClient);
    private authService = inject(AuthApiService);

    // GET an appointment by id
    // GET http://localhost:9090/appointments/{id}
    getAppointmentById(id: string){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });

        return this.httpClient.get<Appointment>(
            `${this.BASE_URL}/${id}`,
            {
                headers: authHeader
            }
        )
    }

    // GET appointments by user id
    // GET http://localhost:9090/appointments?params
    getAppointmentByUserId(userId: string, role: string, status: string, patientName: string, doctorName: string){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });

        // For filtering the appointments, set query params
        let params = {};
        if(role === 'PATIENT'){
            params = {patientId: userId}
        }else{
            params = {doctorId: userId}
        }
        if(status != ''){
            params = {...params, status}
        }
        if(patientName != ''){
            params = {...params, patientName}
        }
        if(doctorName != ''){
            params = {...params, doctorName}
        }
        return this.httpClient.get<Appointment[]>(
            `${this.BASE_URL}`,
            {
                params,
                headers: authHeader
            }
        )
    }

    // Book an appointment
    // POST http://localhost:9090/appointments
    bookAppointment(data: AppointmentData){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });

        return this.httpClient.post<Appointment>(
            `${this.BASE_URL}`,
            data,
            {
                headers: authHeader
            }
        )
    }

    // Cancel an appointment
    // PUT http://localhost:9090/appointments/cancel/{id}
    cancelAppointment(id: string){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });

        return this.httpClient.put<Appointment>(
            `${this.BASE_URL}/cancel/${id}`, {},
            {
                headers: authHeader
            }
        )
    }

    // Complete an appointment
    // PUT http://localhost:9090/appointments/complete/{id}
    completeAppointment(id: string){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });
        
        return this.httpClient.put<Appointment>(
            `${this.BASE_URL}/complete/${id}`, {},
            {
                headers: authHeader
            }
        )
    }
}