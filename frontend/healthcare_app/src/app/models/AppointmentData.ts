// Represents the AppointmentDTO in the backend
export interface AppointmentData{
    patientId: string,
    doctorId: string,
    timeSlotStart: string,
    timeSlotEnd: string
}