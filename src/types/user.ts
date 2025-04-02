export interface User {
    id?: string;
    $id?: string;
    $createdAt?: string;
    $updatedAt?: string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: 'admin' | 'teacher' | 'student' | 'parent';
    status?: 'active' | 'inactive' | 'suspended';
    phone?: string;
    address?: string;
    profilePicture?: string;
    school?: string;
    department?: string;
    student_id?: string;
    teacher_id?: string;
    admin_id?: string;
    parent_id?: string;
}

export interface Student extends User {
    role: 'student';
    student_id: string;
    grade?: string;
    enrollmentDate?: string;
    courses?: string[];
}

export interface Teacher extends User {
    role: 'teacher';
    teacher_id: string;
    specialization?: string;
    courses?: string[];
    education?: {
        degree: string;
        institution: string;
        year: number;
    }[];
}

export interface Parent extends User {
    role: 'parent';
    parent_id: string;
    children?: string[];
    phone: string;
    address: string;
}

export interface Guardian {
  name: string;
  relationship: string;
  phone: string;
  email: string;
  occupation: string;
  nationalId: string;
}

export type User = Student | Teacher | Parent; 