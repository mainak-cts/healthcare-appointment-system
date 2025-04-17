// Represent the User model in the backend
export interface User{
    userId: string,
    name: string,
    role: "PATIENT" | "DOCTOR",
    email: string,
    phone: string
}