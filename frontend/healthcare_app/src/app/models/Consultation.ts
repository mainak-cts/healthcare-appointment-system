import { Appointment } from "./Appointment";

// Represents the Consultation model in the backend
export interface Consultation{
    consultationId: string,
    appointment: Appointment,
    notes: string,
    prescription: string 
}