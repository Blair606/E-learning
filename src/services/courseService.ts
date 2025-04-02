import api from '../config/api';

export interface Course {
    id: number;
    code: string;
    title: string;
    description: string;
    credits: number;
    school_id: number;
    department_id: number;
    instructor_id: number;
    status: 'active' | 'inactive';
    enrollment_capacity: number;
    current_enrollment: number;
    start_date: string;
    end_date: string;
    schedule: {
        day: string;
        time: string;
        duration: number;
    }[];
    prerequisites: string[];
    school_name?: string;
    department_name?: string;
    instructor_name?: string;
}

export interface CreateCourseData {
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
    async getAllCourses(): Promise<Course[]> {
        try {
            const response = await api.get('/courses/index.php');
            return response.data;
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw error;
        }
    }

    async getCourseById(id: number): Promise<Course> {
        try {
            const response = await api.get(`/courses/index.php?id=${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching course:', error);
            throw error;
        }
    }

    async createCourse(data: CreateCourseData): Promise<Course> {
        try {
            const response = await api.post('/courses/index.php', data);
            return response.data;
        } catch (error) {
            console.error('Error creating course:', error);
            throw error;
        }
    }

    async updateCourse(data: UpdateCourseData): Promise<{ message: string }> {
        try {
            const response = await api.put('/courses/index.php', data);
            return response.data;
        } catch (error) {
            console.error('Error updating course:', error);
            throw error;
        }
    }

    async deleteCourse(id: number): Promise<{ message: string }> {
        try {
            const response = await api.delete('/courses/index.php', { data: { id } });
            return response.data;
        } catch (error) {
            console.error('Error deleting course:', error);
            throw error;
        }
    }

    async getCoursesBySchool(schoolId: number): Promise<Course[]> {
        try {
            const response = await api.get(`/courses/index.php?school_id=${schoolId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching courses by school:', error);
            throw error;
        }
    }

    async getCoursesByDepartment(departmentId: number): Promise<Course[]> {
        try {
            const response = await api.get(`/courses/index.php?department_id=${departmentId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching courses by department:', error);
            throw error;
        }
    }
}

export const courseService = new CourseService(); 