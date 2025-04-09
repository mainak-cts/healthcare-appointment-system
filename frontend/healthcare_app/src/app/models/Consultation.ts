import { Appointment } from "./Appointment";

export interface Consultation{
    consultationId: string,
    appointment: Appointment,
    notes: string,
    prescription: string 
}