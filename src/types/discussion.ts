export interface DiscussionTopic {
    id: number;
    title: string;
    lastMessage: string;
    replies: number;
    unread: number;
    timestamp: string;
}

export interface DiscussionGroup {
    id: number;
    name: string;
    course: string;
    courseCode: string;
    members: number;
    lastActive: string;
    topics: DiscussionTopic[];
}
