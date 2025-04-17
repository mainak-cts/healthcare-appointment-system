import { User } from "./User";

// Represents the Appointment model in the backend
export interface Appointment{
    appointmentId: string,
    patient: User | null,
    doctor: User | null,
    timeSlotStart: string,
    timeSlotEnd: string,
    status: "COMPLETED" | "CANCELLED" | "BOOKED"
}