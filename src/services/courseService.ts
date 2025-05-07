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
    students?: number;
    nextClass?: string;
    progress?: number;
    content?: any[];
}

export interface CreateCourseData {
    code: string;
    title: string;
    description: string;
    credits: number;
    school_id: number;
    department_id: number;
    instructor_id: number;
    status: 'active' | 'inactive';
    enrollment_capacity: number;
    start_date: string;
    end_date: string;
    schedule: {
        day: string;
        time: string;
        duration: number;
    }[];
    prerequisites: string[];
}

export interface UpdateCourseData extends CreateCourseData {
    id: number;
}

class CourseService {
    private baseUrl = 'http://localhost/E-learning/api/courses';

    async enrollCourse(courseId: number, studentId: number): Promise<{ success: boolean; message: string }> {
        try {
            const response = await axios.post(`${this.baseUrl}/enroll.php`, {
                course_id: courseId,
                student_id: studentId,
                enrollment_date: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
            });
            return response.data;
        } catch (error: any) {
            if (error.response?.data) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Failed to enroll in course');
        }
    }

    async getCourses(): Promise<Course[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/get_courses.php`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (response.data.success) {
                return response.data.courses;
            }
            throw new Error('Failed to fetch courses');
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw error;
        }
    }

    async getCourseById(id: number): Promise<Course> {
        try {
            const response = await axios.get(`${this.baseUrl}/get_course.php?id=${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching course:', error);
            throw error;
        }
    }

    async createCourse(data: CreateCourseData): Promise<Course> {
        try {
            const response = await axios.post(`${this.baseUrl}/add_course.php`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating course:', error);
            throw error;
        }
    }

    async updateCourse(data: UpdateCourseData): Promise<{ message: string }> {
        try {
            const response = await axios.put(`${this.baseUrl}/update_course.php`, data, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating course:', error);
            throw error;
        }
    }

    async deleteCourse(id: number): Promise<{ message: string }> {
        try {
            const response = await axios.delete(`${this.baseUrl}/delete_course.php?id=${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting course:', error);
            throw error;
        }
    }

    async getCoursesBySchool(schoolId: number): Promise<Course[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/get_courses_by_school.php?school_id=${schoolId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching courses by school:', error);
            throw error;
        }
    }

    async getCoursesByDepartment(departmentId: number): Promise<Course[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/get_courses_by_department.php?department_id=${departmentId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching courses by department:', error);
            throw error;
        }
    }
}

export const courseService = new CourseService(); 