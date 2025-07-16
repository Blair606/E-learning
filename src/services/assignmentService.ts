import { api } from './api';

export interface StudentAssignment {
  id: number;
  title: string;
  description: string;
  course_id: number;
  course_name: string;
  due_date: string;
  total_marks: number;
  type: string;
  assignment_file_path?: string | null;
  submission_status?: string;
  marks_obtained?: number;
  submitted_at?: string;
  graded_at?: string;
  submission_text?: string | null;
  student_file_path?: string | null;
}

export async function fetchStudentAssignments(courseId?: number): Promise<StudentAssignment[]> {
  const url = courseId
    ? `/assignments/get_assignments.php?course_id=${courseId}`
    : '/assignments/get_assignments.php';
  const response = await api.get(url);
  if (response.data.success && Array.isArray(response.data.assignments)) {
    return response.data.assignments;
  }
  throw new Error(response.data.message || 'Failed to fetch assignments');
}

export async function submitAssignment({ assignmentId, type, submissionText, file }: {
  assignmentId: number;
  type: string;
  submissionText?: string;
  file?: File;
}): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  formData.append('assignment_id', assignmentId.toString());
  formData.append('type', type);
  if (type === 'text' && submissionText) {
    formData.append('submission_text', submissionText);
  }
  if (type === 'file' && file) {
    formData.append('file', file);
  }
  const response = await api.post('/assignments/submit_assignment.php', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
} 