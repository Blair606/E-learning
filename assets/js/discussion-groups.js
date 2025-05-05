// Discussion Groups functionality
const DiscussionGroups = {
    // Get discussion groups for a course
    async getGroups(courseId) {
        try {
            const response = await Auth.fetchWithAuth(`api/discussion_groups.php?course_id=${courseId}`);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to fetch discussion groups');
            }
            
            return data.groups;
        } catch (error) {
            console.error('Error fetching discussion groups:', error);
            throw error;
        }
    },

    // Create a new discussion group
    async createGroup(groupData) {
        try {
            const response = await Auth.fetchWithAuth('api/discussion_groups.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(groupData)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to create discussion group');
            }
            
            return data.group;
        } catch (error) {
            console.error('Error creating discussion group:', error);
            throw error;
        }
    },

    // Join a discussion group
    async joinGroup(groupId) {
        try {
            const response = await Auth.fetchWithAuth(`api/discussion_groups.php?action=join&group_id=${groupId}`, {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to join discussion group');
            }
            
            return data;
        } catch (error) {
            console.error('Error joining discussion group:', error);
            throw error;
        }
    }
};

// Export DiscussionGroups object
window.DiscussionGroups = DiscussionGroups; 