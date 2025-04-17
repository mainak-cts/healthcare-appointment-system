import { User } from "./User";

// Represents the Availability model in the backend
export interface Availability{
    availabilityId: string,
    doctor: User,
    timeSlotStart: string,
    timeSlotEnd: string,
    available: boolean
}