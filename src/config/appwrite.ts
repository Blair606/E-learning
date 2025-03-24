import { Client, Account, Databases } from 'appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1') // Appwrite cloud endpoint
    .setProject('67387151002158e41ed9'); // Your project ID

export const account = new Account(client);
export const databases = new Databases(client);

// Database ID
export const DATABASE_ID = '67cb70bb00161ed8f03e';

// Collection IDs
export const COLLECTIONS = {
    USERS: '67d9029f0012285ac7c7', // Your users collection ID
    COURSES: 'courses',
    SCHOOLS: 'schools',
    DEPARTMENTS: 'departments',
    ENROLLMENTS: 'enrollments',
    PAYMENTS: 'payments',
    ASSIGNMENTS: 'assignments',
    GRADES: 'grades',
    ATTENDANCE: 'attendance',
    NOTIFICATIONS: 'notifications',
    SETTINGS: 'settings'
};

export default client; 