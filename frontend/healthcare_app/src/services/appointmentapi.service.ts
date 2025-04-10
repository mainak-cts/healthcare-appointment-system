import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { AuthApiService } from "./authapi.service";
import { AppointmentData } from "../app/models/AppointmentData";
import { Appointment } from "../app/models/Appointment";

@Injectable({providedIn: 'root'})
export class AppointmentApiService{
    private BASE_URL = "http://localhost:9090/api/appointments"
    private httpClient = inject(HttpClient);
    private authService = inject(AuthApiService);

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

    getAppointmentByUserId(userId: string, role: string, status: string, patientName: string, doctorName: string){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });

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