const API_URL = "https://backend-for-render-ws6z.onrender.com";

const USE_MOCK = false; 

export async function apiFetch<T>(
  path: string,
  token: string,
  options?: RequestInit
): Promise<T> {
  
  if (USE_MOCK) {
    
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (path.includes("/api/v1/classes/") && !path.includes("/students") && !path.includes("/search") && options?.method !== "PATCH") {
      return {
        id: "mock-class-123",
        name: "Matematică Clasa 10A",
        description: "Curs avansat de algebră și geometrie pentru profilul real.",
        subject: "Matematică",
        grade: "Clasa a 10-a",
        year: "2024-2025",
        teacherId: "teacher-1",
        teacherName: "Popescu Ion",
        studentCount: 2,
        createdAt: "2024-01-01T00:00:00Z",
        students: [
          { id: "s1", firstName: "Andrei", lastName: "Ionescu", email: "andrei@test.com", status: "ACTIVE" },
          { id: "s2", firstName: "Maria", lastName: "Radu", email: "maria@test.com", status: "INACTIVE" }
        ]
      } as unknown as T;
    }

    if (options?.method === "PATCH") {
      return {} as T; // Returnam un raspuns gol de succes
    }

    // 3. Simulam cautarea studentilor pentru adaugare (GET /api/v1/users/search)
    if (path.includes("/search")) {
      return [
        { id: "s3", firstName: "Elena", lastName: "Dumitrescu", email: "elena@test.com", status: "ACTIVE" },
        { id: "s4", firstName: "Victor", lastName: "Stan", email: "victor@test.com", status: "ACTIVE" }
      ] as unknown as T;
    }

    // 4. Simulam adaugarea si stergerea studentilor (POST / DELETE)
    if (options?.method === "POST" || options?.method === "DELETE") {
      return {} as T; // Succes la adaugare/stergere
    }
  }

  // Daca USE_MOCK este false, codul ruleaza normal, catre backend-ul real:
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? `Request failed: ${res.status}`);
  }

  return res.json();
}