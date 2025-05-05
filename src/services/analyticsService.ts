import axios from 'axios';

export interface ClassAnalytics {
  class_id: number;
  class_name: string;
  total_students: number;
  average_progress: number;
  average_attendance: number;
  average_grade: number;
}

export interface StudentAnalytics {
  student_id: number;
  student_name: string;
  class_id: number;
  progress: number;
  attendance: number;
  grade: number;
  total_assignments: number;
  submitted_assignments: number;
}

export interface AssignmentAnalytics {
  assignment_id: number;
  title: string;
  class_id: number;
  total_submissions: number;
  average_grade: number;
  submitted_count: number;
}

export interface DiscussionAnalytics {
  discussion_id: number;
  title: string;
  class_id: number;
  total_posts: number;
  participating_students: number;
}

export interface AnalyticsData {
  classAnalytics: ClassAnalytics[];
  studentAnalytics: StudentAnalytics[];
  assignmentAnalytics: AssignmentAnalytics[];
  discussionAnalytics: DiscussionAnalytics[];
}

class AnalyticsService {
  private baseUrl = 'http://localhost/E-learning/api';

  async getTeacherAnalytics(): Promise<AnalyticsData> {
    try {
      const response = await axios.get(`${this.baseUrl}/teachers/analytics.php`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.message || 'Failed to fetch analytics data');
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  async getClassAnalytics(classId: number): Promise<ClassAnalytics> {
    try {
      const response = await axios.get(`${this.baseUrl}/teachers/analytics.php?class_id=${classId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        return response.data.data.classAnalytics[0];
      }
      throw new Error(response.data.message || 'Failed to fetch class analytics');
    } catch (error) {
      console.error('Error fetching class analytics:', error);
      throw error;
    }
  }

  async getStudentAnalytics(classId: number): Promise<StudentAnalytics[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/teachers/analytics.php?class_id=${classId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        return response.data.data.studentAnalytics;
      }
      throw new Error(response.data.message || 'Failed to fetch student analytics');
    } catch (error) {
      console.error('Error fetching student analytics:', error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService(); 