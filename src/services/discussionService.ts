import { DiscussionGroup } from '../types/discussion';

const API_BASE_URL = 'http://localhost/E-learning/api';

export const getDiscussionGroups = async (courseId: number): Promise<DiscussionGroup[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/courses/get_discussion_groups.php?course_id=${courseId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch discussion groups');
        }

        const data = await response.json();
        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message || 'Failed to fetch discussion groups');
        }
    } catch (error) {
        console.error('Error fetching discussion groups:', error);
        throw error;
    }
};
