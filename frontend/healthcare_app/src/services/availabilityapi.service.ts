import { inject, Injectable } from "@angular/core";
import { AuthApiService } from "./authapi.service";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AvailabilityData } from "../app/models/AvailabilityData";
import { Availability } from "../app/models/Availability";
import { BASE_URLS } from "../environment/environment";

@Injectable({providedIn: 'root'})
export class AvailabilityApiService{
    private BASE_URL = BASE_URLS.AVAILABILITY_BASE_URL;

    private httpClient = inject(HttpClient);
    private authService = inject(AuthApiService);

    // Get all availabilities of a doctor by doctor id
    // GET http://localhost:9090/availabilities?doctorId={id}
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

    // Get all available availabilities
    // GET http://localhost:9090/availabilities?isAvailable=true&params
    getAvailabilities(doctorName: string | null, timeSlotStart: string | null, timeSlotEnd: string | null){
        const jwtToken = this.authService.getToken()
        const authHeader = new HttpHeaders({ 'Authorization': `Bearer ${jwtToken}` });

        // Filter availabilities query params
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

    // Create an availability
    // POST http://localhost:9090/availabilities
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

    // Delete an availability
    // DELETE http://localhost:9090/availabilities/{id}
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

    // Edit an availability
    // PUT http://localhost:9090/availabilities
    editAvailability(data: {
        doctorId: string,
        availabilityId: string,
        timeSlotStart: string,
        timeSlotEnd: string
    }){
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