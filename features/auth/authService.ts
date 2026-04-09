import { LoginRequest, LoginResponse } from "./authTypes";

const BASE_URL = "https://backend-for-render-ws6z.onrender.com";

// ------------------------------
// Functia care trimite request-ul de login catre backend
// ------------------------------
export async function loginService(data: LoginRequest): Promise<LoginResponse> {
    // Trimitem un request POST catre /auth/login
    const response = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json", // informam backendul ca trimitem JSON 
        },
        body: JSON.stringify(data), // convertim obiectul { email, password } in JSON
    });

    // Daca backend-ul raspunde cu eroare (ex: 401, 400)
    if (!response.ok) {
        // Extragem textul erorii pentru a-l afisa in UI
        const errorText = await response.text();
        throw new Error(errorText || "Login failed");
    }

    // Daca totul este OK, convertim raspunsul in JSON
    return response.json();
}