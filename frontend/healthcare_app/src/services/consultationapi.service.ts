import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { AuthApiService } from "./authapi.service";
import { map } from "rxjs";
import { ConsultationData } from "../app/models/ConsultationData";
import { Consultation } from "../app/models/Consultation";

@Injectable({providedIn: 'root'})
export class ConsultationApiService{
    private BASE_URL = "http://localhost:9090/api/consultations"
    private httpClient = inject(HttpClient);
    private authService = inject(AuthApiService);

    getConsultationByAppointmentId(appointmentId: string){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });
        
        return this.httpClient.get<Consultation[]>(
            `${this.BASE_URL}`,
            {
                params: {appointmentId},
                headers: authHeader
            }
        ).pipe(map(e => e[0]));
    }

    createConsultation(data: {appointmentId: string, notes: string, prescription: string}){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });

        return this.httpClient.post<Consultation>(
            `${this.BASE_URL}`,
            data,
            {
                headers: authHeader
            }
        )
    }

    editConsultation(data: ConsultationData){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });

        return this.httpClient.put<Consultation>(
            `${this.BASE_URL}`,
            data,
            {
                headers: authHeader
            }
        )
    }

    deleteConsultationById(id: string){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });

        return this.httpClient.delete<Consultation>(
            `${this.BASE_URL}/${id}`,
        
            {
                headers: authHeader
            }
        )
    }
}