// ==================================================
// API CLASS FOR COURSE MANAGEMENT PAGE
// Contine toate functiile care comunica cu backend-ul 
// pentru pagina de management a cursului 
// ==================================================

import {
    mapCourseFullView,
    mapClassroom,
    mapClassroomMember,
    mapStudentProgress,
    mapStudentAverage,
    mapCourseTest,
    mapClassroomCourseResponse,
} from "./mappers";

import {
    Course,
    Chapter,
    Classroom,
    ClassroomMember,
    StudentProgress,
    StudentAverage,
    CourseTest,
    ClassroomCourseResponse,
    AssignCoursePayload,
} from "./types";

// URL-ul de baza al backend-ului
const API_BASE = "https://backend-for-render-ws6z.onrender.com";

// ----- HELPER FUNCTIONS -----

// Returneaza token-ul de autentificare din localStorage
function getAccessToken(): string | null {
    if (typeof window === "undefined") 
        return null;
    return localStorage.getItem("accessToken");
}

// Construieste header-ele pentru request-urile autentificate
function getAuthHeaders(): HeadersInit {
    const token = getAccessToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// Functie generica pentru fetch cu gestionarea erorilor
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...(options?.headers ?? {}),
        },
    });

    // Gestionam erorile HTTP
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error("Unauthorized. Please sign in again.");
        }
        if (response.status === 403) {
            throw new Error("You do not have permission to access this resource.");
        }
        if (response.status === 404) {
            throw new Error("Resource not found.");
        }
        throw new Error(`Request failed with status ${response.status}`);
    }

    // Daca raspunsul este 204 (No Content), returnam null
    if (response.status === 204) {
        return null as T;
    }

    return response.json();
}

// ----- COURSE -----

// Aduce datele complete ale cursului (cu chapters + lessons + resources)
export async function fetchCourseFullView(courseId: string): Promise<{
    course: Course;
    chapters: Chapter[];
}> {
    const data = await apiFetch<any>(`/api/v1/courses/${courseId}/full-view`);
    return mapCourseFullView(data);
}

// ----- TESTE -----

// Aduce testul asociat unei lecții
// Endpoint: GET /api/v1/lessons/{lessonId}/test
// Returnează null dacă lecția nu are test asociat
export async function fetchTestForLesson(
    lessonId: string
): Promise<CourseTest | null> {
    try {
        const data = await apiFetch<any>(`/api/v1/lessons/${lessonId}/test`);
        return mapCourseTest(data, lessonId);
    } catch (error) {
        // Daca testul nu exista (404), returnam null in loc sa aruncam eroare
        if (error instanceof Error && error.message.includes("not found")) {
            return null;
        }
        throw error;
    }
}

// Aduce testele pentru toate lectiile dintr-o lista
// Apeleaza fetchTestForLesson pentru fiecare lectie care are testId
export async function fetchTestsForLessons(
    lessonIds: string[]
): Promise<CourseTest[]> {
    // Facem request-urile in paralel pentru performanta 
    const results = await Promise.allSettled(
        lessonIds.map((lessonId) => fetchTestForLesson(lessonId))
    );

    // Filtram doar lectiile care au test (ignoram null si erorile)
    return results
    .filter(
        (result): result is PromiseFulfilledResult<CourseTest> =>
            result.status === "fulfilled" && result.value !== null
    )
    .map((result) => result.value);
}

// ----- CLASE -----

// Aduce toate clasele din organizația utilizatorului
// Endpoint: GET /api/v1/classrooms
export async function fetchClassrooms(): Promise<Classroom[]> {
    const data = await apiFetch<any>(`/api/v1/classrooms`);
    const list = Array.isArray(data) ? data : data?.content ?? [];
    return list.map(mapClassroom);
}

// Aduce membrii unei clase (filtrați doar studenții)
// Endpoint: GET /api/v1/classrooms/{classroomId}/members?role=STUDENT
export async function fetchClassroomStudents(
    classroomId: string 
): Promise<ClassroomMember[]> {
    const data = await apiFetch<any>(
        `/api/v1/classrooms/${classroomId}/members?role=STUDENT`
    );
    const list = Array.isArray(data) ? data : data?.members ?? [];
    return list.map(mapClassroomMember);
}

// ----- PROGRES STUDENTI -----

// Aduce progresul studenților la curs (paginat)
// Endpoint: GET /api/v1/courses/{courseId}/students-progress
export async function fetchStudentsProgress(
    courseId: string,
    page: number = 0,
    size: number = 100
): Promise<StudentProgress[]> {
    const data = await apiFetch<any>(
        `/api/v1/courses/${courseId}/students-progress?page=${page}&size=${size}`
    );
    const list = Array.isArray(data) ? data : data?.content ?? [];
    return list.map(mapStudentProgress);
}

// Aduce mediile studenților la testele cursului (paginat)
// Endpoint: GET /api/v1/courses/{courseId}/analytics/student-averages
export async function fetchStudentAverages(
    courseId: string, 
    page: number = 0,
    size: number = 100
): Promise<StudentAverage[]> {
    const data = await apiFetch<any>(
        `/api/v1/courses/${courseId}/analytics/student-averages?page=${page}&size=${size}`
    );
    const list = Array.isArray(data) ? data : data?.content ?? [];
    return list.map(mapStudentAverage);
}

// ----- ASIGNARE -----

// Asignează cursul curent la o clasă
// Endpoint: POST /api/v1/classrooms/{classroomId}/courses
export async function assignCourseToClassroom(
    classroomId: string,
    courseId: string 
): Promise<ClassroomCourseResponse> {
    const payload: AssignCoursePayload = {
        courseIds: [courseId],
    };

    const data = await apiFetch<any>(
        `/api/v1/classrooms/${classroomId}/courses`,
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );

    return mapClassroomCourseResponse(data);
}