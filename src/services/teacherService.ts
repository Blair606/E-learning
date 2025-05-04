import axios from 'axios';

export interface Course {
  id: number;
  name: string;
  code: string;
  description: string;
  credits: number;
  status: string;
  schedule: any;
  prerequisites: any;
  department: string;
  school: string;
  instructor: string;
  instructorId: number;
  totalStudents: number;
  students: number;
  nextClass: string;
  progress: number;
  content: CourseContent[];
}

export interface CourseContent {
  id: number;
  title: string;
  questions: number[];
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  course: string;
  courseId: number;
  totalStudents: number;
  submissions: number;
  status: 'Completed' | 'Active' | 'Draft';
  type: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  classId: number;
  className: string | null;
}

export interface StudentAnalytics {
  id: string;
  name: string;
  courseId: number;
  courseName: string;
  totalAssignments: number;
  completedAssignments: number;
  averageGrade: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
  grades: Array<{
    unit: string;
    grade: number;
    attendance: number;
    submissions: number;
  }>;
}

class TeacherService {
  private baseUrl = 'http://localhost/E-learning/api/teachers';

  async getCourses() {
    const response = await axios.get(`${this.baseUrl}/get_teacher_courses.php`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }

  async getAssignments() {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${this.baseUrl}/get_teacher_assignments.php`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch assignments');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  }

  async getStudentAnalytics(courseId?: number) {
    const url = courseId 
      ? `${this.baseUrl}/get_student_analytics.php?course_id=${courseId}`
      : `${this.baseUrl}/get_student_analytics.php`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }

  async getNotifications() {
    const response = await axios.get(`${this.baseUrl}/get_teacher_notifications.php`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
}

export const teacherService = new TeacherService(); 