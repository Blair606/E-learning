import { databases, account } from '../config/appwrite';
import { DATABASE_ID, COLLECTIONS } from '../config/appwrite';
import { ID, Query } from 'appwrite';
import { User } from '../types/user';

export const userService = {
    // Get all users
    async getUsers() {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.USERS
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },

    // Get user by ID
    async getUserById(userId: string) {
        try {
            const response = await databases.getDocument(
                DATABASE_ID,
                COLLECTIONS.USERS,
                userId
            );
            return response;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    // Create new user
    async createUser(userData: Omit<User, '$id'>) {
        try {
            const response = await databases.createDocument(
                DATABASE_ID,
                COLLECTIONS.USERS,
                ID.unique(),
                userData
            );
            return response;
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    // Update user
    async updateUser(userId: string, userData: Partial<User>) {
        try {
            const response = await databases.updateDocument(
                DATABASE_ID,
                COLLECTIONS.USERS,
                userId,
                userData
            );
            return response;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    // Delete user
    async deleteUser(userId: string) {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                COLLECTIONS.USERS,
                userId
            );
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    // Get users by role
    async getUsersByRole(role: string) {
        try {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.USERS,
                [Query.equal('role', role)]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching users by role:', error);
            throw error;
        }
    }
}; 