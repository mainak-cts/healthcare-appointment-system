export interface User{
    userId: string,
    name: string,
    role: "PATIENT" | "DOCTOR",
    email: string,
    password: string,
    phone: string
}