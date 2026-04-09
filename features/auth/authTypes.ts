// ------------------------------
// Tipul pentru request-ul de login
// ------------------------------
export interface LoginRequest {
    // Email-ul introdus de utilizator in formularul de login
    email: string;

    // Parola introdusa de utilizator
    password: string;
}

// ------------------------------
// Tipul pentru obiectul User primit de la backend
// ------------------------------
export interface User {
    // ID-ul unic al utilizatorului 
    id: number;

    // Email-ul utilizatorului
    email: string;

    // Username-ul utilizatorului 
    username: string;
}

// ------------------------------
// Tipul pentru raspunsul primit de la backend la login
// ------------------------------
export interface LoginResponse {
    // Obiectul complet al utilizatorului autentificat
    user: User;

    // Token-ul JWT primit de la backend 
    access_token: string;

    // Tipul token-ului
    token_type: string;
}