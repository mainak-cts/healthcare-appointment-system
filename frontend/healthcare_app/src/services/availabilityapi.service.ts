import { inject, Injectable } from "@angular/core";
import { AuthApiService } from "./authapi.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AvailabilityData } from "../app/models/AvailabilityData";
import { Availability } from "../app/models/Availability";

@Injectable({providedIn: 'root'})
export class AvailabilityApiService{
    private BASE_URL = 'http://localhost:9090/api/availabilities'
    private httpClient = inject(HttpClient);
    private authService = inject(AuthApiService);

    getAvailabilitiesByDoctorId(doctorId: string){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });

        return this.httpClient.get<Availability[]>(
            `${this.BASE_URL}`,
            {
                params: {doctorId: doctorId},
                headers: authHeader
            }
        )
    }

    getAvailabilities(doctorName: string | null, timeSlotStart: string | null, timeSlotEnd: string | null){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });

        let params = {}
        if(doctorName){
            params = {...params, namePrefix: doctorName}
        }
        if(timeSlotStart){
            params = {...params, timeSlotStart}
        }
        if(timeSlotEnd){
            params = {...params, timeSlotEnd}
        }

        params = {...params, isAvailable: "true"}
        return this.httpClient.get<Availability[]>(
            `${this.BASE_URL}`,
            {
                params: params,
                headers: authHeader
            }
        )
    }

    createAvailability(data: AvailabilityData){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });
        return this.httpClient.post<Availability>(
            `${this.BASE_URL}`,
            data,
            {
                headers: authHeader
            }
        )
    }

    deleteAvailabilityById(id: string){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });

        return this.httpClient.delete<Availability>(
            `${this.BASE_URL}/${id}`,
            {
                headers: authHeader
            }
        )
    }

    editAvailability(data: any){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });
        
        return this.httpClient.put<Availability>(
            `${this.BASE_URL}`,
            data,
            {
                headers: authHeader
            }
        )
    }
}