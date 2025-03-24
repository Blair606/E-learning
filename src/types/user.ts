export interface User {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'teacher' | 'student';
    status: 'active' | 'inactive';
    phone?: string;
    address?: string;
    profilePicture?: string;
    school?: string;
    department?: string;
    studentId?: string;
    teacherId?: string;
}

export interface Student extends User {
    role: 'student';
    studentId: string;
    grade?: string;
    enrollmentDate?: string;
    courses?: string[];
}

export interface Teacher extends User {
    role: 'teacher';
    teacherId: string;
    specialization?: string;
    courses?: string[];
    education?: {
        degree: string;
        institution: string;
        year: number;
    }[];
}

export interface Guardian {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  occupation: string;
  nationalId: string;
}

export type User = Student | Teacher; 