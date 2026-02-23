import { create } from "zustand";
import { Course } from "../../features/courses/coursesData";

type CourseState = {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
};

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  setCourses: (courses) => set({ courses }),
}));
