import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { AuthApiService } from "./authapi.service";
import { map } from "rxjs";
import { ConsultationData } from "../app/models/ConsultationData";

@Injectable({providedIn: 'root'})
export class ConsultationApiService{
    private BASE_URL = "http://localhost:9090/api/consultations"
    private httpClient = inject(HttpClient);
    private authService = inject(AuthApiService);
    private jwtToken = this.authService.getToken()
    private authHeader = new HttpHeaders({ 'Authorization': `Bearer ${this.jwtToken}` });

    getConsultationByAppointmentId(appointmentId: string){
        return this.httpClient.get<any[]>(
            `${this.BASE_URL}`,
            {
                params: {appointmentId},
                headers: this.authHeader
            }
        ).pipe(map(e => e[0]));
    }

    createConsultation(data: {appointmentId: string, notes: string, prescription: string}){
        return this.httpClient.post<any>(
            `${this.BASE_URL}`,
            data,
            {
                headers: this.authHeader
            }
        )
    }

    editConsultation(data: ConsultationData){
        return this.httpClient.put<any>(
            `${this.BASE_URL}`,
            data,
            {
                headers: this.authHeader
            }
        )
    }

    deleteConsultationById(id: string){
        return this.httpClient.delete<any>(
            `${this.BASE_URL}/${id}`,
        
            {
                headers: this.authHeader
            }
        )
    }
}