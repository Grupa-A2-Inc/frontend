// ==================================================
// MAPPERS FOR COURSE MANAGEMENT PAGES
// Transforma raspunsurile brute de la backend in tipurile
// definite de noi in types.ts 
// ==================================================

import {
    Course,
    Chapter,
    Lesson,
    LessonResource,
    CourseTest,
    Classroom,
    ClassroomMember,
    StudentProgress,
    StudentAverage,
    ClassroomCourseResponse,
} from "./types";

// ----- MAPPERS PENTRU CURS -----
export function mapCourseFullView(data: any): {
    course: Course;
    chapters: Chapter[];
} {
    // Extragem datele principale ale cursului
    const course: Course = {
        id: data.id,
        title: data.title,
        description: data.description ?? "",
        status: data.status,
        visibility: data.visibility,
        createdAt: data.createdAt,
    };

    // Mapam fiecare capitol cu lectiile sale
    const chapters: Chapter[] = (data.chapters ?? []).map(mapChapter);

    return { course, chapters };
}

// Transfroam un capitol brut de la backend in tipul nostru Chapter
export function mapChapter(data: any): Chapter {
    return {
        id: data.id,
        courseId: data.courseId,
        title: data.title,
        orderIndex: data.orderIndex,
        // Mapăm fiecare lecție din capitol
        lessons: (data.lessons ?? []).map(mapLesson),
    };
}

// Tranforma o lectie bruta de la backend in tipul nostru Lesson
export function mapLesson(data: any): Lesson {
    return {
        id: data.id,
        chapterId: data.chapterId,
        testId: data.testId ?? undefined, // null devine undefined
        title: data.title,
        contentMarkdown: data.contentMarkdown ?? "",
        orderIndex: data.orderIndex,
        // Mapăm resursele lecției
        lessonResources: (data.lessonResources ?? []).map(mapLessonResource),
    };
}

// Transforma o resursa bruta de la backend in tipul nostru LessonResourse
export function mapLessonResource(data: any): LessonResource {
    return {
        id: data.id,
        lessonId: data.lessonId,
        title: data.title,
        url: data.url,
    };
}

// ----- MAPPERS PENTRU TESTE -----
export function mapCourseTest(data: any, lessonId: string): CourseTest {
    return {
        id: data.id,
        lessonId: lessonId,
        title: data.title,
        description: data.description ?? undefined,
        timeLimitSec: data.timeLimitSec ?? undefined,
        status: data.status,
        aiEnabled: data.aiEnabled ?? false,
        createdAt: data.createdAt,
    };
}

// ----- MAPPERS PENTRU CLASE -----
export function mapClassroom(data: any): Classroom {
    return {
        id: data.id,
        organizationId: data.organizationId,
        name: data.name,
        description: data.description ?? undefined,
        createdAt: data.createdAt,
    };
}

// Transforma un membru brut de la backend in tipul nostru ClassroomMember
// Bazat pe ClassroomMemberResponse din backend
export function mapClassroomMember(data: any): ClassroomMember {
    return {
        userId: data.userId,
        email: data.email,
        membershipType: data.membershipType,
    };
}

// ----- MAPPERS PENTRU PROGRES STUDENTI -----
export function mapStudentProgress(data: any): StudentProgress {
    return {
        studentId: data.studentId,
        enrolledAt: data.enrolledAt,
        progressPercent: data.progressPercent ?? 0,
        completedAt: data.completedAt ?? undefined,
    };
}

export function mapStudentAverage(data: any): StudentAverage {
    return {
        studentId: data.studentId,
        averageScore: data.averageScore ?? 0,
        minScore: data.minScore ?? 0,
        maxScore: data.maxScore ?? 0,
        passedTests: data.passedTests ?? 0,
        failedTests: data.failedTests ?? 0,
        lastAttemptAt: data.lastAttemptAt ?? undefined,
    };
}

// ----- MAPPERS PENTRU ASIGNARE -----
export function mapClassroomCourseResponse(data: any): ClassroomCourseResponse {
    return {
        id: data.id,
        classroomId: data.classroomId,
        courseId: data.courseId,
        assignedAt: data.assignedAt,
    };
}