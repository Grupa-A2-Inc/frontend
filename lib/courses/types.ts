// ==================================================
// TYPES FOR COURSE MANAGEMENT PAGE
// Aici definim toate tipurile de date folosite in pagina
// de management a cursului pentru profesor
// ==================================================

// ----- STATUS CURS -----
// Statusurile posibile ale unui curs
export type CourseStatus = "DRAFT" | "PUBLISHED";

// Vizibilitatea cursului
export type CourseVisibility = "PRIVATE" | "PUBLIC";

// ----- CURS -----
// Datele principale ale cursului, bazat pe ResponseCourseFullViewDto din backend
export type Course = {
    id: string;
    title: string;
    description: string;
    status: CourseStatus;
    visibility: CourseVisibility;
    createdAt: string;
};

// ----- STRUCTURA CONTINUT -----
// O resursa asociata unei lectii (link, document, etc.)
export type LessonResource = {
    id: string;
    lessonId: string;
    title: string;
    url: string;
};

// O lectie dintr-un capitol
export type Lesson = {
    id: string;
    chapterId: string;
    testId?: string; // optional - lectia poate avea sau nu un test asociat
    title: string;
    contentMarkdown: string;
    orderIndex: number;
    lessonResources: LessonResource[];
};

// Un capitol din curs
export type Chapter = {
    id: string;
    courseId: string;
    title: string;
    orderIndex: number;
    lessons: Lesson[];
};

// ----- TESTE -----
// Detaliile unui test asociat unei lectii
// Bazat pe TestEntityDto din backend
export type CourseTest = {
    id: string;
    lessonId: string;
    title: string;
    description?: string;
    timeLimitSec?: number;
    status: "DRAFT" | "PUBLISHED";
    aiEnabled: boolean;
    createdAt: string;
};

// ----- CLASE -----
// O clasa din organizatie, bazata pe ClassroomResponse din backend
export type Classroom = {
    id: string;
    organizationId: string;
    name: string;
    description?: string;
    createdAt: string;
};

// Un membru al unei clase, bazat pe ClassroomMemberResponse din backedn
export type ClassroomMember = {
    userId: string;
    email: string;
    membershipType: "TEACHER" | "STUDENT";
};

// ----- PROGRES STUDENTI -----
// Progresul unui student la curs, bazat pe StudentProgressDto din backend
export type StudentProgress = {
    studentId: string;
    enrolledAt: string;
    progressPercent: number;
    completedAt?: string;
};

// Media unui student la testele cursului, bazat pe StudentAverageDto din backend
export type StudentAverage = {
    studentId: string;
    averageScore: number;
    minScore: number;
    maxScore: number;
    passedTests: number;
    failedTests: number;
    lastAttemptAt?: string;
};

// ----- DATE COMBINATE -----
// Student cu date combinate din progress + averages + member info
// Aceasta structura este construita in frontend prin combinarea ami multor endpoint-uri
export type EnrolledStudent = {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    classId: string;
    className: string;
    progressPercent: number;
    averageScore?: number;
    passedTests?: number;
    failedTests?: number;
};

// Clasa cu studentii ei inrolati la curs
export type ClassWithStudents = {
    classId: string;
    className: string;
    students: EnrolledStudent[];
};

// ----- ASIGNARE CURS LA CLASA ----- 
// Payload pentru asignarea cursului la o clasa
// Bazat pe AssignCoursesToClassroomRequest din backend
export type AssignCoursePayload = {
    courseIds: string[]; // lista de cursuri de asignat (in cazul nostru, doar cursul curent)
};

// Raspunsul de la backend dupa asignare
// Bazat pe ClassroomCourseResponse din backend
export type ClassroomCourseResponse = {
    id: string;
    classroomId: string;
    courseId: string;
    assignedAt: string;
};

// ----- SORTARE STUDENTI -----
// Campurile dupa care putem sorta studentii in tabel 
export type SortField = "name" | "averageScore" | "progressPercent" | "passedTests";

// Directia de sortare
export type SortDirection = "asc" | "desc";

// ----- STATE PAGINA -----
// State-ul gloabl al paginii de management, folosit in Redux slice
export type CourseManagementState = {
    // Datele cursului
    course: Course | null;
    chapters: Chapter[];
    tests: CourseTest[];

    // Datele studentilor si claselor
    classrooms: Classroom[];
    classWithStudents: ClassWithStudents[];
    studentAverages: StudentAverage[];

    // Loading states separate pentru fiecare sectiune
    loadingCourse: boolean;
    loadingStudents: boolean;
    loadingClassrooms: boolean;
    loadingTests: boolean;

    // Error states separate pentru fiecare sectiune
    courseError: string | null;
    studentsError: string | null;
    classroomsError: string | null;
    testsError: string | null;

    // State pentru operatiile de asignare
    assigning: boolean;
    assignError: string | null;
    assignSuccess: boolean;
};