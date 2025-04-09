import { User } from "./User";

export interface Availability{
    availabilityId: string,
    doctor: User,
    timeSlotStart: string,
    timeSlotEnd: string,
    available: boolean
}