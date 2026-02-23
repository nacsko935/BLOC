import { useCallback, useEffect, useState } from "react";
import { Course, CourseDeadline, CourseNote, CourseQCM } from "../coursesData";
import { courseService } from "../services/courseService";

export function useCourse(courseId?: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [notes, setNotes] = useState<CourseNote[]>([]);
  const [qcms, setQcms] = useState<CourseQCM[]>([]);
  const [deadlines, setDeadlines] = useState<CourseDeadline[]>([]);

  const load = useCallback(async () => {
    if (!courseId) return;
    const c = await courseService.getCourseById(courseId);
    if (!c) return;
    setCourse(c);
    const [n, q, d] = await Promise.all([
      courseService.getCourseNotes(courseId),
      courseService.getCourseQCMs(courseId),
      courseService.getCourseDeadlines(courseId),
    ]);
    setNotes(n);
    setQcms(q);
    setDeadlines(d);
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  return { course, notes, qcms, deadlines, reload: load };
}
