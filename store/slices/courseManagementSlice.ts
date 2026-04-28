import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  assignCourseToClassroom,
  fetchClassroomStudents,
  fetchClassrooms,
  fetchStudentAverages,
  fetchStudentsProgress,
} from "@/lib/courses/api";

import {
  Classroom,
  ClassWithStudents,
  EnrolledStudent,
  SortDirection,
  SortField,
  StudentAverage,
  StudentProgress,
} from "@/lib/courses/types";

export type CourseManagementTab = "content" | "students";

type CourseManagementState = {
  activeTab: CourseManagementTab;

  classrooms: Classroom[];
  classWithStudents: ClassWithStudents[];

  loadingClassrooms: boolean;
  loadingStudents: boolean;
  assigning: boolean;

  classroomsError: string | null;
  studentsError: string | null;
  assignError: string | null;
  assignSuccess: boolean;

  searchQuery: string;
  sortField: SortField;
  sortDirection: SortDirection;
};

const initialState: CourseManagementState = {
  activeTab: "content",

  classrooms: [],
  classWithStudents: [],

  loadingClassrooms: false,
  loadingStudents: false,
  assigning: false,

  classroomsError: null,
  studentsError: null,
  assignError: null,
  assignSuccess: false,

  searchQuery: "",
  sortField: "name",
  sortDirection: "asc",
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function buildProgressMap(progress: StudentProgress[]) {
  return new Map(progress.map((item) => [item.studentId, item]));
}

function buildAveragesMap(averages: StudentAverage[]) {
  return new Map(averages.map((item) => [item.studentId, item]));
}

export const loadClassrooms = createAsyncThunk(
  "courseManagement/loadClassrooms",
  async (_, { rejectWithValue }) => {
    try {
      return await fetchClassrooms();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load classrooms."),
      );
    }
  },
);

export const loadStudentsByClass = createAsyncThunk(
  "courseManagement/loadStudentsByClass",
  async (courseId: string, { rejectWithValue }) => {
    try {
      const classrooms = await fetchClassrooms();

      const [progress, averages] = await Promise.all([
        fetchStudentsProgress(courseId),
        fetchStudentAverages(courseId),
      ]);

      const progressByStudent = buildProgressMap(progress);
      const averageByStudent = buildAveragesMap(averages);

      const groups = await Promise.all(
        classrooms.map(async (classroom) => {
          const members = await fetchClassroomStudents(classroom.id);

          const students: EnrolledStudent[] = members.map((member) => {
            const studentProgress = progressByStudent.get(member.userId);
            const studentAverage = averageByStudent.get(member.userId);

            return {
              id: member.userId,
              email: member.email,
              classId: classroom.id,
              className: classroom.name,
              progressPercent: studentProgress?.progressPercent ?? 0,
              averageScore: studentAverage?.averageScore,
              passedTests: studentAverage?.passedTests,
              failedTests: studentAverage?.failedTests,
            };
          });

          return {
            classId: classroom.id,
            className: classroom.name,
            students,
          };
        }),
      );

      return groups;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to load students."),
      );
    }
  },
);

export const assignCourse = createAsyncThunk(
  "courseManagement/assignCourse",
  async (
    payload: { courseId: string; classroomId: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await assignCourseToClassroom(
        payload.classroomId,
        payload.courseId,
      );

      await Promise.all([
        dispatch(loadClassrooms()),
        dispatch(loadStudentsByClass(payload.courseId)),
      ]);

      return response;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Failed to assign course to classroom."),
      );
    }
  },
);

const courseManagementSlice = createSlice({
  name: "courseManagement",
  initialState,
  reducers: {
    setActiveTab(state, action: PayloadAction<CourseManagementTab>) {
      state.activeTab = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    setSortField(state, action: PayloadAction<SortField>) {
      state.sortField = action.payload;
    },
    setSortDirection(state, action: PayloadAction<SortDirection>) {
      state.sortDirection = action.payload;
    },
    clearAssignState(state) {
      state.assignError = null;
      state.assignSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadClassrooms.pending, (state) => {
        state.loadingClassrooms = true;
        state.classroomsError = null;
      })
      .addCase(loadClassrooms.fulfilled, (state, action) => {
        state.loadingClassrooms = false;
        state.classrooms = action.payload;
      })
      .addCase(loadClassrooms.rejected, (state, action) => {
        state.loadingClassrooms = false;
        state.classroomsError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load classrooms.";
      })

      .addCase(loadStudentsByClass.pending, (state) => {
        state.loadingStudents = true;
        state.studentsError = null;
      })
      .addCase(loadStudentsByClass.fulfilled, (state, action) => {
        state.loadingStudents = false;
        state.classWithStudents = action.payload;
      })
      .addCase(loadStudentsByClass.rejected, (state, action) => {
        state.loadingStudents = false;
        state.studentsError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load students.";
      })

      .addCase(assignCourse.pending, (state) => {
        state.assigning = true;
        state.assignError = null;
        state.assignSuccess = false;
      })
      .addCase(assignCourse.fulfilled, (state) => {
        state.assigning = false;
        state.assignSuccess = true;
      })
      .addCase(assignCourse.rejected, (state, action) => {
        state.assigning = false;
        state.assignError =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to assign course.";
      });
  },
});
export const {
  setActiveTab,
  setSearchQuery,
  setSortField,
  setSortDirection,
  clearAssignState,
} = courseManagementSlice.actions;

export default courseManagementSlice.reducer;