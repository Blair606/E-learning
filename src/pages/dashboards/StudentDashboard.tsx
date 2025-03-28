import { useState } from 'react';
import {
  BookOpenIcon,
  CalendarIcon,
  ClockIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  ChartBarIcon,
  BanknotesIcon,
  CheckCircleIcon,
  UserCircleIcon,
  BookmarkIcon,
  DocumentIcon,
  DocumentPlusIcon,
  Bars3Icon,
  XMarkIcon,
  VideoCameraIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface DiscussionTopic {
  id: number;
  title: string;
  lastMessage: string;
  replies: number;
  unread: number;
  timestamp: string;
}

interface DiscussionGroup {
  id: number;
  name: string;
  course: string;
  courseCode: string;
  members: number;
  lastActive: string;
  topics: DiscussionTopic[];
}

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  completed?: boolean;
  selectedAnswer?: number;
}

interface CourseContent {
  id: string;
  title: string;
  content: string;
  questions: Question[];
  completed?: boolean;
}

interface Unit {
  id: number;
  code: string;
  name: string;
  instructor: string;
  progress: number;
  nextClass: string;
  content: CourseContent[];
  resources: { id: number; title: string; type: string; downloadUrl: string; }[];
  assignments: { id: number; title: string; dueDate: string; status: string; }[];
}

const StudentDashboard = () => {
  const [activeMenu, setActiveMenu] = useState('courses');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [currentUnits, setCurrentUnits] = useState<Unit[]>([
    {
      id: 1,
      code: 'CS 301',
      name: 'Machine Learning',
      instructor: 'Dr. Sarah Chen',
      progress: 65,
      nextClass: '2:30 PM Today',
      content: [],
      resources: [
        { id: 1, title: 'Introduction to ML Algorithms', type: 'pdf', downloadUrl: '#' },
        { id: 2, title: 'Python ML Libraries', type: 'doc', downloadUrl: '#' },
      ],
      assignments: [
        { id: 1, title: 'ML Model Implementation', dueDate: '2024-03-20', status: 'pending' },
        { id: 2, title: 'Dataset Analysis', dueDate: '2024-03-22', status: 'completed' },
      ]
    },
    {
      id: 2,
      code: 'CS 302',
      name: 'Network Security',
      instructor: 'Prof. James Wilson',
      progress: 70,
      nextClass: '10:00 AM Tomorrow',
      content: [],
      resources: [
        { id: 1, title: 'Cryptography Basics', type: 'pdf', downloadUrl: '#' },
        { id: 2, title: 'Security Protocols', type: 'pdf', downloadUrl: '#' },
      ],
      assignments: [
        { id: 1, title: 'Security Audit Report', dueDate: '2024-03-22', status: 'pending' },
        { id: 2, title: 'Encryption Implementation', dueDate: '2024-03-25', status: 'pending' },
      ]
    },
    {
      id: 3,
      code: 'CS 303',
      name: 'Neural Networks',
      instructor: 'Dr. Michael Chang',
      progress: 60,
      nextClass: '11:30 AM Today',
      content: [],
      resources: [
        { id: 1, title: 'Neural Network Architectures', type: 'pdf', downloadUrl: '#' },
        { id: 2, title: 'Deep Learning Frameworks', type: 'doc', downloadUrl: '#' },
      ],
      assignments: [
        { id: 1, title: 'CNN Implementation', dueDate: '2024-03-24', status: 'pending' },
      ]
    },
    {
      id: 4,
      code: 'CS 304',
      name: 'Strategic Information Systems',
      instructor: 'Dr. Emily Brooks',
      progress: 75,
      nextClass: '2:00 PM Tomorrow',
      content: [],
      resources: [
        { id: 1, title: 'IS Strategy Framework', type: 'pdf', downloadUrl: '#' },
        { id: 2, title: 'Case Studies', type: 'pdf', downloadUrl: '#' },
      ],
      assignments: [
        { id: 1, title: 'Business Strategy Analysis', dueDate: '2024-03-23', status: 'pending' },
      ]
    },
    {
      id: 5,
      code: 'CS 305',
      name: 'Mobile Computing',
      instructor: 'Prof. Lisa Martinez',
      progress: 68,
      nextClass: '9:00 AM Tomorrow',
      content: [],
      resources: [
        { id: 1, title: 'Mobile App Development', type: 'pdf', downloadUrl: '#' },
        { id: 2, title: 'UI/UX Guidelines', type: 'pdf', downloadUrl: '#' },
      ],
      assignments: [
        { id: 1, title: 'Mobile App Project', dueDate: '2024-03-26', status: 'pending' },
      ]
    },
    {
      id: 6,
      code: 'CS 306',
      name: 'Multimedia Systems',
      instructor: 'Dr. Robert Kim',
      progress: 72,
      nextClass: '4:00 PM Today',
      content: [],
      resources: [
        { id: 1, title: 'Multimedia Processing', type: 'pdf', downloadUrl: '#' },
        { id: 2, title: 'Compression Techniques', type: 'doc', downloadUrl: '#' },
      ],
      assignments: [
        { id: 1, title: 'Media Processing Project', dueDate: '2024-03-25', status: 'pending' },
      ]
    }
  ]);

  const [notifications] = useState([
    { id: 1, message: 'Your Math assignment has been graded', teacher: 'Dr. Smith', time: '1 hour ago' },
    { id: 2, message: 'New study materials uploaded for Computer Science', teacher: 'Prof. Johnson', time: '3 hours ago' },
    { id: 3, message: 'Class cancelled tomorrow', teacher: 'Dr. Williams', time: '5 hours ago' },
  ]);

  const [financialStatus] = useState({
    tuitionStatus: 'Pending Payment',
    semesterFee: 45000,
    hostelFee: {
      amount: 15000,
      status: 'Optional',
      deadline: '2024-04-01'
    },
    retakesFee: {
      amountPerUnit: 7500,
      pendingUnits: [
        { code: 'CS201', name: 'Physics', amount: 7500 }
      ]
    },
    paymentHistory: [
      { id: 1, type: 'Semester Fee', amount: 45000, date: '2024-01-15', status: 'Paid' },
      { id: 2, type: 'Hostel Fee', amount: 15000, date: '2024-01-15', status: 'Paid' }
    ],
    nextPaymentDeadline: '2024-04-01'
  });

  const [academicResults] = useState({
    gpa: 3.8,
    totalCredits: 45,
    currentSemesterGrades: [
      { course: 'Advanced Mathematics', grade: 'A', percentage: 92 },
      { course: 'Computer Science', grade: 'A-', percentage: 88 },
    ],
    semesterHistory: [
      {
        semester: '1st Year, 1st Sem',
        units: [
          { name: 'Introduction to Programming', grade: 75, letterGrade: 'A' },
          { name: 'Calculus I', grade: 65, letterGrade: 'B' },
          { name: 'Physics', grade: 35, letterGrade: 'E', status: 'retake' }
        ],
        averageGrade: 58.3
      },
      {
        semester: '1st Year, 2nd Sem',
        units: [
          { name: 'Data Structures', grade: 82, letterGrade: 'A' },
          { name: 'Physics', grade: 68, letterGrade: 'B' }, // Retake passed
          { name: 'Statistics', grade: 71, letterGrade: 'A' }
        ],
        averageGrade: 73.7
      },
      {
        semester: '2nd Year, 1st Sem',
        units: [
          { name: 'Database Systems', grade: 88, letterGrade: 'A' },
          { name: 'Operating Systems', grade: 63, letterGrade: 'B' },
          { name: 'Computer Networks', grade: 45, letterGrade: 'D' }
        ],
        averageGrade: 65.3
      }
    ],
    retakes: [
      {
        unit: 'Physics',
        originalGrade: 35,
        improvedGrade: 68,
        originalSemester: '1st Year, 1st Sem',
        retakeSemester: '1st Year, 2nd Sem',
        status: 'Completed'
      }
    ]
  });

  // Update profile data
  const [profileData] = useState({
    name: 'Bildard Blair Odhiambo',
    studentId: '2021/CS/31442',
    course: 'Bachelor of Science in Computer Science',
    year: '3rd Year, 2nd Semester',
    email: 'bildard.blair@university.edu',
    achievements: [
      { id: 1, title: 'Dean\'s List 2023', icon: '��' },
      { id: 2, title: 'Best Programming Project', icon: '' },
      { id: 3, title: 'Research Excellence', icon: '🔬' },
    ],
    currentSemester: {
      name: '3rd Year, 2nd Semester',
      status: 'activated', // or 'pending' or 'inactive'
      activationDate: '2024-01-15',
      nextPaymentDue: '2024-04-01'
    }
  });

  // Update weekly schedule
  const [weeklySchedule] = useState([
    {
      day: 'Monday',
      classes: [
        { id: 1, unit: 'Machine Learning', code: 'CS 301', time: '09:00 - 11:00', room: 'Lab 101', instructor: 'Dr. Sarah Chen' },
        { id: 2, unit: 'Neural Networks', code: 'CS 303', time: '14:00 - 16:00', room: 'Lab 203', instructor: 'Dr. Michael Chang' }
      ]
    },
    {
      day: 'Tuesday',
      classes: [
        { id: 3, unit: 'Network Security', code: 'CS 302', time: '11:00 - 13:00', room: 'Room 105', instructor: 'Prof. James Wilson' },
        { id: 4, unit: 'Mobile Computing', code: 'CS 305', time: '14:00 - 16:00', room: 'Lab 102', instructor: 'Prof. Lisa Martinez' }
      ]
    },
    {
      day: 'Wednesday',
      classes: [
        { id: 5, unit: 'Strategic Information Systems', code: 'CS 304', time: '09:00 - 11:00', room: 'Room 201', instructor: 'Dr. Emily Brooks' },
        { id: 6, unit: 'Multimedia Systems', code: 'CS 306', time: '14:00 - 16:00', room: 'Lab 204', instructor: 'Dr. Robert Kim' }
      ]
    },
    {
      day: 'Thursday',
      classes: [
        { id: 7, unit: 'Machine Learning', code: 'CS 301', time: '11:00 - 13:00', room: 'Lab 101', instructor: 'Dr. Sarah Chen' },
        { id: 8, unit: 'Network Security', code: 'CS 302', time: '14:00 - 16:00', room: 'Room 105', instructor: 'Prof. James Wilson' }
      ]
    },
    {
      day: 'Friday',
      classes: [
        { id: 9, unit: 'Neural Networks', code: 'CS 303', time: '09:00 - 11:00', room: 'Lab 203', instructor: 'Dr. Michael Chang' },
        { id: 10, unit: 'Mobile Computing', code: 'CS 305', time: '14:00 - 16:00', room: 'Lab 102', instructor: 'Prof. Lisa Martinez' }
      ]
    }
  ]);

  // Update quick stats
  const quickStats = [
    { id: 1, label: 'Overall GPA', value: '3.8', icon: AcademicCapIcon, color: 'text-green-500' },
    { id: 2, label: 'Units This Semester', value: '6', icon: BookOpenIcon, color: 'text-blue-500' },
    { id: 3, label: 'Attendance Rate', value: '92%', icon: CheckCircleIcon, color: 'text-indigo-500' },
  ];

  const menuItems = [
    { id: 'courses', icon: BookOpenIcon, label: 'Courses' },
    { id: 'schedule', icon: CalendarIcon, label: 'Schedule' },
    { id: 'profile', icon: UserCircleIcon, label: 'Profile' },
    { id: 'discussions', icon: ChatBubbleLeftRightIcon, label: 'Discussions' },
    { id: 'notifications', icon: BellIcon, label: 'Notifications' },
    { id: 'academic', icon: ChartBarIcon, label: 'Academic Progress' },
    { id: 'financial', icon: BanknotesIcon, label: 'Financial Status' },
    { id: 'resources', icon: BookmarkIcon, label: 'Resources' },
    { id: 'online-classes', icon: VideoCameraIcon, label: 'Online Classes' },
  ];

  const [scheduledClasses] = useState([
    {
      id: 1,
      title: 'Introduction to Machine Learning',
      course: 'CS 301',
      date: '2024-03-20',
      time: '10:00 AM - 11:30 AM',
      status: 'upcoming'
    }
    // Add more sample classes as needed
  ]);

  // Add new state for discussions
  const [discussionGroups] = useState<DiscussionGroup[]>([
    {
      id: 1,
      name: 'ML Study Group',
      course: 'Machine Learning',
      courseCode: 'CS 301',
      members: 15,
      lastActive: '2 hours ago',
      topics: [
        { 
          id: 1, 
          title: 'Neural Networks Q&A',
          lastMessage: 'Can someone explain backpropagation?',
          replies: 8,
          unread: 2,
          timestamp: '1 hour ago'
        },
        { 
          id: 2, 
          title: 'Project Collaboration',
          lastMessage: 'Looking for team members for the ML project',
          replies: 12,
          unread: 0,
          timestamp: '3 hours ago'
        }
      ]
    },
    {
      id: 2,
      name: 'Network Security Discussion',
      course: 'Network Security',
      courseCode: 'CS 302',
      members: 12,
      lastActive: '30 minutes ago',
      topics: [
        {
          id: 1,
          title: 'Encryption Techniques',
          lastMessage: 'Discussion about RSA implementation',
          replies: 15,
          unread: 3,
          timestamp: '30 minutes ago'
        }
      ]
    },
    {
      id: 3,
      name: 'Neural Networks Lab Group',
      course: 'Neural Networks',
      courseCode: 'CS 303',
      members: 10,
      lastActive: '1 day ago',
      topics: [
        {
          id: 1,
          title: 'CNN Architecture Help',
          lastMessage: 'Questions about convolutional layers',
          replies: 5,
          unread: 1,
          timestamp: '1 day ago'
        }
      ]
    }
  ]);

  const [selectedGroup, setSelectedGroup] = useState<DiscussionGroup | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<DiscussionTopic | null>(null);

  // Add new state for content modal
  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<CourseContent | null>(null);

  // Add new state for guardian details
  const [guardianDetails, setGuardianDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    relationship: '',
    address: '',
    isRegistered: false
  });

  // Add new function to handle answering questions
  const handleAnswerQuestion = (unitId: number, contentId: string, questionId: string, selectedAnswer: number) => {
    setCurrentUnits(units => units.map(unit => {
      if (unit.id === unitId) {
        const newContent = unit.content.map(content => {
          if (content.id === contentId) {
            const newQuestions = content.questions.map(question => {
              if (question.id === questionId) {
                return {
                  ...question,
                  completed: true,
                  selectedAnswer
                };
              }
              return question;
            });

            // Calculate if all questions are completed
            const allQuestionsCompleted = newQuestions.every(q => q.completed);
            
            return {
              ...content,
              questions: newQuestions,
              completed: allQuestionsCompleted
            };
          }
          return content;
        });

        // Calculate new progress based on completed content
        const totalContent = unit.content.length;
        const completedContent = newContent.filter(c => c.completed).length;
        const newProgress = totalContent > 0 ? (completedContent / totalContent) * 100 : 0;

        return {
          ...unit,
          content: newContent,
          progress: newProgress
        };
      }
      return unit;
    }));
  };

  // Add new function to handle guardian registration
  const handleGuardianRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Here you would typically make an API call to register the guardian
      // For now, we'll just update the local state
      setGuardianDetails(prev => ({
        ...prev,
        isRegistered: true
      }));
      // You would also need to create a guardian account in your backend
      // with the phone number as password and the provided email
    } catch (error) {
      console.error('Failed to register guardian:', error);
    }
  };

  // Add ContentModal component
  const ContentModal = ({ 
    isOpen, 
    onClose, 
    content, 
    unitId 
  }: { 
    isOpen: boolean; 
    onClose: () => void; 
    content: CourseContent | null;
    unitId: number;
  }) => {
    if (!isOpen || !content) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-[95%] max-w-4xl shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">{content.title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="prose max-w-none mb-8">
            {content.content}
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-medium text-gray-900">Questions</h4>
            {content.questions.map((question, index) => (
              <div 
                key={question.id} 
                className={`p-4 rounded-lg ${
                  question.completed 
                    ? 'bg-gray-50' 
                    : 'bg-white border'
                }`}
              >
                <p className="font-medium mb-4">{index + 1}. {question.text}</p>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <button
                      key={optionIndex}
                      onClick={() => handleAnswerQuestion(unitId, content.id, question.id, optionIndex)}
                      disabled={question.completed}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        question.completed
                          ? question.selectedAnswer === optionIndex
                            ? question.selectedAnswer === question.correctAnswer
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            : question.correctAnswer === optionIndex
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                          : 'hover:bg-blue-50 border'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                {question.completed && (
                  <p className={`mt-2 text-sm ${
                    question.selectedAnswer === question.correctAnswer
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {question.selectedAnswer === question.correctAnswer
                      ? '✓ Correct answer!'
                      : `✗ Incorrect. The correct answer was: ${question.options[question.correctAnswer]}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'courses':
        return (
          <div className="space-y-6">
            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {quickStats.map((stat) => (
                <div key={stat.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                      <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Current Units with Enhanced Details */}
              <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                  <BookOpenIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Current Units
                </h2>
                <div className="space-y-6">
                  {currentUnits.map(course => (
                    <div key={course.id} className="border rounded-xl p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800">{course.name}</h3>
                          <p className="text-gray-600">Instructor: {course.instructor}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <ClockIcon className="w-4 h-4 text-blue-500" />
                          <span className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                            {course.nextClass}
                          </span>
                        </div>
                      </div>

                      {/* Course Content Section */}
                      <div className="mt-4 space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Course Content</h4>
                        {course.content.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {course.content.map(item => (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setSelectedContent(item);
                                  setIsContentModalOpen(true);
                                }}
                                className={`p-3 rounded-lg text-left transition-colors ${
                                  item.completed
                                    ? 'bg-green-50 hover:bg-green-100'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                              >
                                <div className="flex items-center">
                                  <DocumentTextIcon className={`w-5 h-5 mr-2 ${
                                    item.completed ? 'text-green-500' : 'text-blue-500'
                                  }`} />
                                  <div>
                                    <h5 className="font-medium">{item.title}</h5>
                                    <p className="text-sm text-gray-600">
                                      {item.questions.filter(q => q.completed).length} of {item.questions.length} completed
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No content added yet</p>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2 bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <div className="mt-2 flex justify-between items-center mb-4">
                        <span className="text-sm text-gray-500">Progress</span>
                        <span className="text-sm font-medium text-blue-600">{course.progress}% Complete</span>
                      </div>

                      {/* Resources and Assignments Tabs */}
                      <div className="mt-4 border-t pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Recent Resources</h4>
                            <div className="space-y-2">
                              {course.resources.slice(0, 2).map(resource => (
                                <a
                                  key={resource.id}
                                  href={resource.downloadUrl}
                                  className="flex items-center p-2 hover:bg-gray-50 rounded-lg group"
                                >
                                  <DocumentIcon className="w-4 h-4 text-gray-400 group-hover:text-blue-500 mr-2" />
                                  <span className="text-sm text-gray-600 group-hover:text-blue-600">
                                    {resource.title}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Upcoming Tasks</h4>
                            <div className="space-y-2">
                              {course.assignments.map(assignment => (
                                <div
                                  key={assignment.id}
                                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
                                >
                                  <span className="text-sm text-gray-600">{assignment.title}</span>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    assignment.status === 'pending' 
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-green-100 text-green-700'
                                  }`}>
                                    {assignment.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Access and Stats */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-lg font-semibold mb-4">Quick Access</h3>
                  <div className="space-y-3">
                    <button className="w-full px-4 py-2 text-left flex items-center space-x-3 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg transition-colors">
                      <DocumentPlusIcon className="w-5 h-5" />
                      <span>Submit Assignment</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left flex items-center space-x-3 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg transition-colors">
                      <ChatBubbleLeftRightIcon className="w-5 h-5" />
                      <span>Contact Instructor</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left flex items-center space-x-3 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg transition-colors">
                      <BookmarkIcon className="w-5 h-5" />
                      <span>View All Resources</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm overflow-x-auto">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                <CalendarIcon className="w-5 h-5 mr-2 text-blue-500" />
                Weekly Timetable
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      {weeklySchedule.map(day => (
                        <th key={day.day} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {day.day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Time slots from 9 AM to 5 PM */}
                    {Array.from({ length: 9 }, (_, i) => i + 9).map(hour => (
                      <tr key={hour} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {`${hour}:00 - ${hour + 1}:00`}
                        </td>
                        {weeklySchedule.map(day => {
                          const classAtThisTime = day.classes.find(c => {
                            const [startHour] = c.time.split(' - ')[0].split(':').map(Number);
                            return startHour === hour;
                          });

                          return (
                            <td key={day.day} className="px-6 py-4 whitespace-nowrap">
                              {classAtThisTime && (
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                  <p className="font-medium text-blue-700">{classAtThisTime.unit}</p>
                                  <p className="text-sm text-gray-600">{classAtThisTime.code}</p>
                                  <p className="text-sm text-blue-600">{classAtThisTime.time}</p>
                                  <p className="text-xs text-gray-500">
                                    {classAtThisTime.room} • {classAtThisTime.instructor}
                                  </p>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Today's Classes</h2>
              <div className="space-y-4">
                {weeklySchedule[0].classes.map(class_ => (
                  <div key={class_.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{class_.unit}</p>
                      <p className="text-sm text-gray-600">{class_.time} • {class_.room}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{class_.instructor}</p>
                      <p className="text-sm font-medium text-blue-600">{class_.code}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                <BellIcon className="w-5 h-5 mr-2 text-blue-500" />
                Recent Notifications
              </h2>
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div key={notification.id} 
                       className="group p-4 border-l-4 border-blue-500 bg-white hover:bg-blue-50/50 
                                rounded-r-xl shadow-sm hover:shadow-md transition-all duration-200">
                    <p className="text-gray-800 font-medium group-hover:text-blue-700 transition-colors">
                      {notification.message}
                    </p>
                    <div className="flex items-center mt-2 space-x-3">
                      <span className="text-sm font-medium text-blue-600">{notification.teacher}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  Mark All as Read
                </button>
                <button className="w-full px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  Notification Settings
                </button>
              </div>
            </div>
          </div>
        );

      case 'academic':
        return (
          <div className="space-y-6">
            {/* Performance Graph */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Academic Performance Trend</h2>
              <div className="h-80 relative">
                {/* Grade Range Indicators */}
                <div className="absolute left-0 top-0 h-full w-16 flex flex-col justify-between text-sm text-gray-500">
                  <span>100%</span>
                  <span className="text-green-500">70% - A</span>
                  <span className="text-blue-500">60% - B</span>
                  <span className="text-yellow-500">50% - C</span>
                  <span className="text-orange-500">40% - D</span>
                  <span className="text-red-500">0% - E</span>
                </div>
                
                {/* Graph Area */}
                <div className="ml-16 h-full relative">
                  {/* Grade Range Background */}
                  <div className="absolute inset-0 flex flex-col">
                    <div className="h-3/10 bg-green-50" /> {/* A range */}
                    <div className="h-1/10 bg-blue-50" />  {/* B range */}
                    <div className="h-1/10 bg-yellow-50" /> {/* C range */}
                    <div className="h-1/10 bg-orange-50" /> {/* D range */}
                    <div className="h-4/10 bg-red-50" />   {/* E range */}
                  </div>
                  
                  {/* Line Graph */}
                  <div className="absolute inset-0">
                    <svg className="w-full h-full">
                      <path
                        d={academicResults.semesterHistory.map((sem, index) => {
                          const x = (index / (academicResults.semesterHistory.length - 1)) * 100;
                          const y = 100 - sem.averageGrade;
                          return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#4F46E5"
                        strokeWidth="2"
                      />
                      {academicResults.semesterHistory.map((sem, index) => (
                        <circle
                          key={index}
                          cx={`${(index / (academicResults.semesterHistory.length - 1)) * 100}%`}
                          cy={`${100 - sem.averageGrade}%`}
                          r="4"
                          fill="#4F46E5"
                        />
                      ))}
                    </svg>
                  </div>
                  
                  {/* Semester Labels */}
                  <div className="absolute bottom-0 w-full flex justify-between text-sm text-gray-500">
                    {academicResults.semesterHistory.map((sem, index) => (
                      <span key={index}>{sem.semester}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Retakes Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                Unit Retakes
                <span className="ml-2 px-2 py-1 text-sm bg-red-100 text-red-600 rounded-full">
                  {academicResults.retakes.length} Total
                </span>
              </h2>
              
              <div className="space-y-4">
                {academicResults.retakes.map((retake, index) => (
                  <div key={index} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-800">{retake.unit}</h3>
                        <p className="text-sm text-gray-600">
                          Original Attempt: {retake.originalSemester}
                        </p>
                        <p className="text-sm text-gray-600">
                          Retake: {retake.retakeSemester}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          Original Grade: 
                          <span className="font-bold text-red-600 ml-1">
                            {retake.originalGrade}%
                          </span>
                        </p>
                        <p className="text-sm">
                          Improved Grade: 
                          <span className="font-bold text-green-600 ml-1">
                            {retake.improvedGrade}%
                          </span>
                        </p>
                        <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          {retake.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'financial':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Financial Summary */}
            <div className="lg:col-span-2 space-y-6">
              {/* Current Semester Fees */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <BanknotesIcon className="w-6 h-6 mr-2 text-blue-500" />
                  Current Semester Fees
                </h2>
                
                <div className="space-y-4">
                  {/* Semester Fee */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Semester Fee</span>
                      <span className="text-lg font-bold">KSH {financialStatus.semesterFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Due by {financialStatus.nextPaymentDeadline}</span>
                      <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                        {financialStatus.tuitionStatus}
                      </span>
                    </div>
                  </div>

                  {/* Hostel Fee */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Hostel Fee (Optional)</span>
                      <span className="text-lg font-bold">KSH {financialStatus.hostelFee.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Due by {financialStatus.hostelFee.deadline}</span>
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                        {financialStatus.hostelFee.status}
                      </span>
                    </div>
                  </div>

                  {/* Retake Fees */}
                  {financialStatus.retakesFee.pendingUnits.length > 0 && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-3">Pending Retake Fees</h3>
                      {financialStatus.retakesFee.pendingUnits.map(unit => (
                        <div key={unit.code} className="flex justify-between items-center mb-2">
                          <span className="text-gray-600">{unit.code} - {unit.name}</span>
                          <div className="flex items-center space-x-3">
                            <span className="font-bold">KSH {unit.amount.toLocaleString()}</span>
                            <button className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                              Pay Now
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Payment Actions */}
                  <div className="flex space-x-4">
                    <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Pay Semester Fee
                    </button>
                    <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                      Pay Hostel Fee
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Payment History</h3>
                <div className="space-y-3">
                  {financialStatus.paymentHistory.map(payment => (
                    <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{payment.type}</p>
                        <p className="text-sm text-gray-600">{payment.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">KSH {payment.amount.toLocaleString()}</p>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Summary Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm h-fit">
              <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Semester Fee</span>
                  <span className="font-medium">KSH {financialStatus.semesterFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Hostel Fee</span>
                  <span className="font-medium">KSH {financialStatus.hostelFee.amount.toLocaleString()}</span>
                </div>
                {financialStatus.retakesFee.pendingUnits.length > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600">Retake Fees</span>
                    <span className="font-medium">
                      KSH {(financialStatus.retakesFee.pendingUnits.reduce((acc, unit) => acc + unit.amount, 0)).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 font-bold text-lg">
                  <span>Total Due</span>
                  <span className="text-blue-600">
                    KSH {(
                      financialStatus.semesterFee +
                      financialStatus.hostelFee.amount +
                      financialStatus.retakesFee.pendingUnits.reduce((acc, unit) => acc + unit.amount, 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
              <button className="w-full mt-6 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Pay All Fees
              </button>
            </div>
          </div>
        );

      case 'resources':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
              <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800">
                <BookmarkIcon className="w-5 h-5 mr-2 text-blue-500" />
                Course Resources
              </h2>
              {currentUnits.map(course => (
                <div key={course.id} className="mb-8">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">{course.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {course.resources.map(resource => (
                      <a
                        key={resource.id}
                        href={resource.downloadUrl}
                        className="p-4 border rounded-lg hover:shadow-md transition-all duration-200 flex items-center space-x-3"
                      >
                        <DocumentIcon className="w-6 h-6 text-blue-500" />
                        <div>
                          <p className="font-medium text-gray-800">{resource.title}</p>
                          <p className="text-sm text-gray-500">Type: {resource.type}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Resource Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Filters</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Resource Type</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>All Types</option>
                    <option>PDF Documents</option>
                    <option>Video Lectures</option>
                    <option>Practice Materials</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Course</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                    <option>All Courses</option>
                    {currentUnits.map(course => (
                      <option key={course.id}>{course.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Overview */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center space-x-6 mb-6">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                  <UserCircleIcon className="w-16 h-16 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{profileData.name}</h2>
                  <p className="text-gray-600">{profileData.studentId}</p>
                  <p className="text-blue-600">{profileData.course} • {profileData.year}</p>
                </div>
                <button className="ml-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Edit Profile
                </button>
              </div>
              
              {/* Contact Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <div className="space-y-2 text-gray-600">
                  <p>Email: {profileData.email}</p>
                </div>
              </div>

              {/* Guardian Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Guardian Information</h3>
                {guardianDetails.isRegistered ? (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-green-800">
                          {guardianDetails.firstName} {guardianDetails.lastName}
                        </h4>
                        <p className="text-sm text-green-700">{guardianDetails.relationship}</p>
                        <p className="text-sm text-green-700">{guardianDetails.email}</p>
                        <p className="text-sm text-green-700">{guardianDetails.phoneNumber}</p>
                      </div>
                      <button 
                        onClick={() => setGuardianDetails(prev => ({ ...prev, isRegistered: false }))}
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        Edit Details
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleGuardianRegistration} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={guardianDetails.firstName}
                          onChange={(e) => setGuardianDetails(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          value={guardianDetails.lastName}
                          onChange={(e) => setGuardianDetails(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Relationship</label>
                      <select
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={guardianDetails.relationship}
                        onChange={(e) => setGuardianDetails(prev => ({ ...prev, relationship: e.target.value }))}
                      >
                        <option value="">Select relationship</option>
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Guardian">Guardian</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={guardianDetails.email}
                        onChange={(e) => setGuardianDetails(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <input
                        type="tel"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={guardianDetails.phoneNumber}
                        onChange={(e) => setGuardianDetails(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        This will be used as the password for guardian login
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <textarea
                        required
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        value={guardianDetails.address}
                        onChange={(e) => setGuardianDetails(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Register Guardian
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Achievements */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profileData.achievements.map(achievement => (
                    <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <span className="text-2xl">{achievement.icon}</span>
                      <span className="font-medium text-blue-900">{achievement.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Semester Status */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Current Semester Status</h3>
                <div className="p-4 rounded-lg border-2 border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-700 font-medium">{profileData.currentSemester.name}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      profileData.currentSemester.status === 'activated' 
                        ? 'bg-green-100 text-green-800'
                        : profileData.currentSemester.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {profileData.currentSemester.status.charAt(0).toUpperCase() + profileData.currentSemester.status.slice(1)}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Activation Date: {profileData.currentSemester.activationDate}</p>
                    <p>Next Payment Due: {profileData.currentSemester.nextPaymentDue}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Academic Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current GPA</span>
                    <span className="font-bold text-blue-600">{academicResults.gpa}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Credits Completed</span>
                    <span className="font-bold text-green-600">{academicResults.totalCredits}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'online-classes':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold mb-6">Online Classes</h2>
            
            {/* Upcoming Classes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {scheduledClasses.map((class_) => (
                <div key={class_.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{class_.title}</h3>
                      <p className="text-gray-600">{class_.course}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      class_.status === 'upcoming' 
                        ? 'bg-blue-100 text-blue-800'
                        : class_.status === 'live'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {class_.status.charAt(0).toUpperCase() + class_.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      <span>{class_.date}</span>
                    </div>
                    <div className="flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      <span>{class_.time}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    {class_.status === 'live' ? (
                      <button className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                        Join Class
                      </button>
                    ) : class_.status === 'upcoming' ? (
                      <button className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                        Set Reminder
                      </button>
                    ) : (
                      <button className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200">
                        View Recording
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'discussions':
        return (
          <div className="space-y-6">
            {!selectedGroup ? (
              // Discussion Groups List
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Discussion Groups</h2>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                      My Groups
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      All Groups
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {discussionGroups.map((group) => (
                    <div 
                      key={group.id} 
                      className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                      onClick={() => setSelectedGroup(group)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{group.name}</h3>
                          <p className="text-sm text-gray-500">{group.course}</p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {group.courseCode}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Members:</span>
                          <span className="font-medium">{group.members}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Topics:</span>
                          <span className="font-medium">{group.topics.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Active:</span>
                          <span className="font-medium">{group.lastActive}</span>
                        </div>
                      </div>

                      {group.topics.some(topic => topic.unread > 0) && (
                        <div className="mt-4 flex justify-end">
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                            {group.topics.reduce((acc, topic) => acc + topic.unread, 0)} new messages
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : !selectedTopic ? (
              // Topics List for Selected Group
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => setSelectedGroup(null)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <h2 className="text-2xl font-semibold">{selectedGroup.name}</h2>
                      <p className="text-gray-600">{selectedGroup.course} • {selectedGroup.members} members</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    New Topic
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="space-y-6">
                    {/* Sample messages - in a real app, these would come from your backend */}
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">JD</span>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">John Doe</span>
                          <span className="text-gray-500 text-sm">2 hours ago</span>
                        </div>
                        <p className="mt-1 text-gray-800">{selectedTopic.lastMessage}</p>
                      </div>
                    </div>

                    {/* Reply box */}
                    <div className="mt-6 border-t pt-6">
                      <textarea
                        rows={4}
                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Write your reply..."
                      />
                      <div className="mt-4 flex justify-end">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Post Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Individual Topic View
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setSelectedTopic(null)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-2xl font-semibold">{selectedTopic.title}</h2>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="space-y-6">
                    {/* Sample messages - in a real app, these would come from your backend */}
                    <div className="flex space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">JD</span>
                        </div>
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">John Doe</span>
                          <span className="text-gray-500 text-sm">2 hours ago</span>
                        </div>
                        <p className="mt-1 text-gray-800">{selectedTopic.lastMessage}</p>
                      </div>
                    </div>

                    {/* Reply box */}
                    <div className="mt-6 border-t pt-6">
                      <textarea
                        rows={4}
                        className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Write your reply..."
                      />
                      <div className="mt-4 flex justify-end">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Post Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center p-6">
            <p className="text-gray-500">Content for {activeMenu} coming soon...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-40">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Left side - Menu button and logo */}
          <div className="flex items-center lg:w-64">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="lg:hidden ml-2">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Right side - Actions and profile */}
          <div className="flex items-center justify-end flex-1 space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-sm text-gray-500">Spring 2024</span>
              <span className="text-gray-300">|</span>
            </div>
            <div className="flex items-center border-l pl-4 ml-4">
              <div className="hidden sm:block text-right mr-3">
                <p className="text-sm font-medium text-gray-900">{profileData.name}</p>
                <p className="text-xs text-gray-500">Student</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {profileData.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Responsive Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="lg:hidden absolute right-4 top-4 p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Student Portal</h2>
              <p className="text-sm text-gray-500">Spring 2024</p>
            </div>
          </div>
          <div className="h-0.5 bg-gray-100 w-full mb-6"></div>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <a
                key={item.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveMenu(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center p-3 rounded-xl transition-all duration-200
                  ${activeMenu === item.id 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${activeMenu === item.id ? 'text-white' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 pt-16 min-h-screen ${
        isSidebarOpen ? 'lg:ml-64' : 'lg:ml-64'
      }`}>
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Welcome Banner */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 rounded-2xl shadow-lg">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome back, {profileData.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-blue-100">
                Your learning journey continues. Keep up the excellent work in {profileData.course}!
              </p>
            </div>
          </div>

          {/* Render content based on active menu */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;