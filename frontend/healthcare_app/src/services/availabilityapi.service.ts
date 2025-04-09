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
    private jwtToken = this.authService.getToken()
    private authHeader = new HttpHeaders({ 'Authorization': `Bearer ${this.jwtToken}` });

    getAvailabilitiesByDoctorId(doctorId: string){
        return this.httpClient.get<Availability[]>(
            `${this.BASE_URL}`,
            {
                params: {doctorId: doctorId},
                headers: this.authHeader
            }
        )
    }

    getAvailabilities(doctorName: string | null, timeSlotStart: string | null, timeSlotEnd: string | null){
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
                headers: this.authHeader
            }
        )
    }

    createAvailability(data: AvailabilityData){
        return this.httpClient.post<Availability>(
            `${this.BASE_URL}`,
            data,
            {
                headers: this.authHeader
            }
        )
    }

    deleteAvailabilityById(id: string){
        return this.httpClient.delete<Availability>(
            `${this.BASE_URL}/${id}`,
            {
                headers: this.authHeader
            }
        )
    }

    editAvailability(data: any){
        return this.httpClient.put<Availability>(
            `${this.BASE_URL}`,
            data,
            {
                headers: this.authHeader
            }
        )
    }
}