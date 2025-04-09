import { User } from "./User";

export interface Appointment{
    appointmentId: string,
    patient: User | null,
    doctor: User | null,
    timeSlotStart: string,
    timeSlotEnd: string,
    status: "COMPLETED" | "CANCELLED" | "BOOKED"
}