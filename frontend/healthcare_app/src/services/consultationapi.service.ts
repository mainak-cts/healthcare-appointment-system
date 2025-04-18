import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { AuthApiService } from "./authapi.service";
import { map } from "rxjs";
import { ConsultationData } from "../app/models/ConsultationData";
import { Consultation } from "../app/models/Consultation";
import { BASE_URLS } from "../environment/environment";

@Injectable({providedIn: 'root'})
export class ConsultationApiService{
    private BASE_URL = BASE_URLS.CONSULTATION_BASE_URL;

    private httpClient = inject(HttpClient);
    private authService = inject(AuthApiService);

    // Get consultation by appointment id
    // GET http://localhost:9090/consultations?appointmentId={id}
    getConsultationByAppointmentId(appointmentId: string){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });
        
        return this.httpClient.get<Consultation[]>(
            `${this.BASE_URL}`,
            {
                params: {appointmentId},
                headers: authHeader
            }
        ).pipe(map(e => e[0]));   // As the response returns an array, getting only the first element (one appointment -> one consultation)
    }

    // Create a consultation
    // POST http://localhost:9090/consultations
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

    // Create a consultation
    // POST http://localhost:9090/consultations
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
    // Delete a consultation
    // DELETE http://localhost:9090/consultations/{id}
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