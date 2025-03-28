import { useState, useEffect } from 'react';
import {
  AcademicCapIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  Bars3Icon,
  XMarkIcon,
  HomeIcon,
  BellIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import DashboardHeader from '../../components/DashboardHeader';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import PaymentModal from '../../components/PaymentModal';

const ParentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [notifications, setNotifications] = useState<Array<{
    id: number;
    title: string;
    message: string;
    type: 'academic' | 'attendance' | 'financial' | 'behavior';
    is_read: boolean;
    created_at: string;
  }>>([]);
  const [consents, setConsents] = useState<Array<{
    id: number;
    consent_type: 'academic_records' | 'financial_records' | 'attendance_records' | 'behavior_records';
    is_granted: boolean;
    granted_at: string | null;
    expires_at: string | null;
  }>>([]);
  const [accessLogs, setAccessLogs] = useState<Array<{
    id: number;
    access_time: string;
    ip_address: string;
    action: string;
  }>>([]);

  const [studentInfo] = useState({
    name: 'Alex Smith',
    program: 'Bachelor of Computer Science',
    year: '2nd Year',
    attendance: 95,
    overallGrade: 'A-',
    accommodation: 'On Campus',
    semesterStatus: {
      current: '3rd Year, 2nd Semester',
      status: 'activated', // or 'pending' or 'inactive'
      activationDate: '2024-01-15',
      nextPaymentDue: '2024-04-01'
    }
  });

  const [academicProgress] = useState([
    { id: 1, subject: 'Database Systems', grade: 'A', attendance: '95%', lecturer: 'Dr. Johnson' },
    { id: 2, subject: 'Software Engineering', grade: 'B+', attendance: '92%', lecturer: 'Prof. Williams' },
    { id: 3, subject: 'Data Structures', grade: 'A-', attendance: '98%', lecturer: 'Dr. Brown' },
  ]);

  const [financialOverview] = useState([
    { 
      id: 1, 
      type: 'Semester Fee', 
      amount: 19000, 
      status: 'Paid', 
      dueDate: 'Paid on Mar 15',
      mandatory: true
    },
    { 
      id: 2, 
      type: 'Hostel Fee (Optional)', 
      amount: 12000, 
      status: 'Pending', 
      dueDate: 'Due Apr 1',
      mandatory: false,
      note: 'On-campus accommodation'
    },
    { 
      id: 3, 
      type: 'Retake Fee (2 units)', 
      amount: 2000, 
      status: 'Pending', 
      dueDate: 'Due Apr 15',
      mandatory: true
    },
  ]);

  const [upcomingEvents] = useState([
    { id: 1, title: 'Parent-Teacher Meeting', date: 'Mar 25, 2024', time: '3:00 PM' },
    { id: 2, title: 'Science Fair', date: 'Apr 5, 2024', time: '10:00 AM' },
    { id: 3, title: 'Sports Day', date: 'Apr 12, 2024', time: '9:00 AM' },
  ]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [academicData] = useState({
    semesterData: [
      {
        semester: 'Fall 2023',
        Mathematics: 92,
        'Computer Science': 88,
        Physics: 90,
      },
      {
        semester: 'Spring 2024',
        Mathematics: 95,
        'Computer Science': 89,
        Physics: 93,
      },
      {
        semester: 'Summer 2024',
        Mathematics: 94,
        'Computer Science': 91,
        Physics: 92,
      }
    ],
    trendData: [
      { month: 'Jan', average: 89 },
      { month: 'Feb', average: 90 },
      { month: 'Mar', average: 92 },
      { month: 'Apr', average: 91 },
      { month: 'May', average: 93 },
      { month: 'Jun', average: 92 },
    ]
  });

  const [graphView, setGraphView] = useState('semester');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<{
    amount: number;
    type?: string;
    dueDate?: string;
    mandatory?: boolean;
  }>({ amount: 0 });

  // Add useEffect to fetch guardian data
  useEffect(() => {
    const fetchGuardianData = async () => {
      try {
        // Fetch notifications
        const notificationsResponse = await fetch(
          `http://localhost/E-learning/api/guardians/notifications.php?guardian_id=${localStorage.getItem('userId')}&student_id=${localStorage.getItem('studentId')}`
        );
        if (!notificationsResponse.ok) throw new Error('Failed to fetch notifications');
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData.data);

        // Fetch consents
        const consentsResponse = await fetch(
          `http://localhost/E-learning/api/guardians/consent.php?guardian_id=${localStorage.getItem('userId')}&student_id=${localStorage.getItem('studentId')}`
        );
        if (!consentsResponse.ok) throw new Error('Failed to fetch consents');
        const consentsData = await consentsResponse.json();
        setConsents(consentsData.data);

        // Fetch access logs
        const logsResponse = await fetch(
          `http://localhost/E-learning/api/guardians/access_logs.php?guardian_id=${localStorage.getItem('userId')}&student_id=${localStorage.getItem('studentId')}`
        );
        if (!logsResponse.ok) throw new Error('Failed to fetch access logs');
        const logsData = await logsResponse.json();
        setAccessLogs(logsData.data);
      } catch (error) {
        console.error('Error fetching guardian data:', error);
      }
    };

    fetchGuardianData();
  }, []);

  // Add function to update consent
  const updateConsent = async (consentId: number, isGranted: boolean) => {
    try {
      const response = await fetch('http://localhost/E-learning/api/guardians/consent.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: consentId,
          is_granted: isGranted,
        }),
      });
      if (!response.ok) throw new Error('Failed to update consent');
      // Refresh consents after update
      const consentsResponse = await fetch(
        `http://localhost/E-learning/api/guardians/consent.php?guardian_id=${localStorage.getItem('userId')}&student_id=${localStorage.getItem('studentId')}`
      );
      if (!consentsResponse.ok) throw new Error('Failed to fetch consents');
      const consentsData = await consentsResponse.json();
      setConsents(consentsData.data);
    } catch (error) {
      console.error('Error updating consent:', error);
    }
  };

  const handlePayNow = (item: typeof financialOverview[0]) => {
    setSelectedPayment({
      amount: item.amount,
      type: item.type,
      dueDate: item.dueDate,
      mandatory: item.mandatory
    });
    setIsPaymentModalOpen(true);
  };

  const handlePayAllMandatory = () => {
    const mandatoryTotal = financialOverview
      .filter(item => item.mandatory && item.status !== 'Paid')
      .reduce((sum, item) => sum + item.amount, 0);
    
    setSelectedPayment({
      amount: mandatoryTotal,
    });
    setIsPaymentModalOpen(true);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Academic Progress with Graphs */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold flex items-center">
                    <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-500" />
                    Academic Progress
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setGraphView('semester')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        graphView === 'semester'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      By Semester
                    </button>
                    <button
                      onClick={() => setGraphView('trend')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        graphView === 'trend'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Overall Trend
                    </button>
                  </div>
                </div>

                <div className="h-[400px]">
                  {graphView === 'semester' ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={academicData.semesterData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="semester" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="Mathematics" 
                          stroke="#3B82F6" 
                          strokeWidth={2} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Computer Science" 
                          stroke="#10B981" 
                          strokeWidth={2} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="Physics" 
                          stroke="#8B5CF6" 
                          strokeWidth={2} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={academicData.trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="average"
                          stroke="#3B82F6"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Subject Details */}
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <h3 className="text-lg font-semibold mb-4">Subject Details</h3>
                <div className="space-y-4">
                  {academicProgress.map(subject => (
                    <div key={subject.id} 
                         className="p-4 rounded-xl bg-gray-50 hover:bg-blue-50/50 hover:border-blue-100 border-2 border-transparent 
                                  transition-all duration-200 cursor-pointer">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-medium text-lg">{subject.subject}</h3>
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                          Grade: {subject.grade}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Lecturer: {subject.lecturer}</span>
                        <span>Attendance: {subject.attendance}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Financial Overview & Events */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-500" />
                  Fee Statement
                </h2>
                <div className="space-y-4">
                  {financialOverview.map(item => (
                    <div key={item.id} 
                         className="p-4 rounded-xl bg-gray-50 hover:bg-green-50/50 hover:border-green-100 border-2 border-transparent 
                                  transition-all duration-200 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{item.type}</h3>
                            {!item.mandatory && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                Optional
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">{item.dueDate}</p>
                          {item.note && (
                            <p className="text-xs text-gray-500 mt-1">{item.note}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">KSh {item.amount.toLocaleString()}</p>
                          <span className={`text-sm ${
                            item.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                <h2 className="text-xl font-semibold mb-6 flex items-center">
                  <CalendarIcon className="w-5 h-5 mr-2 text-purple-500" />
                  Upcoming Events
                </h2>
                <div className="space-y-4">
                  {upcomingEvents.map(event => (
                    <div key={event.id} 
                         className="p-4 rounded-xl bg-gray-50 hover:bg-purple-50/50 hover:border-purple-100 border-2 border-transparent 
                                  transition-all duration-200 cursor-pointer">
                      <h3 className="font-medium">{event.title}</h3>
                      <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>{event.date}</span>
                        <span>{event.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Add this new section for semester status */}
            <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-500" />
                Current Semester Status
              </h2>
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-800">
                    {studentInfo.semesterStatus.current}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Activated: {studentInfo.semesterStatus.activationDate}</span>
                    <span>Next Payment: {studentInfo.semesterStatus.nextPaymentDue}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    studentInfo.semesterStatus.status === 'activated'
                      ? 'bg-green-100 text-green-800'
                      : studentInfo.semesterStatus.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {studentInfo.semesterStatus.status === 'activated' ? '✓ Semester Activated' :
                     studentInfo.semesterStatus.status === 'pending' ? '⏳ Activation Pending' :
                     '❌ Not Activated'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <BellIcon className="w-5 h-5 mr-2 text-blue-500" />
                Notifications
              </h2>
              <div className="space-y-4">
                {notifications.map(notification => (
                  <div key={notification.id} className="p-4 rounded-xl bg-gray-50 hover:bg-blue-50/50 hover:border-blue-100 border-2 border-transparent transition-all duration-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{notification.title}</h3>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        notification.type === 'academic' ? 'bg-blue-100 text-blue-800' :
                        notification.type === 'attendance' ? 'bg-green-100 text-green-800' :
                        notification.type === 'financial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {notification.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'consent':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-500" />
                Consent Management
              </h2>
              <div className="space-y-4">
                {consents.map(consent => (
                  <div key={consent.id} className="p-4 rounded-xl bg-gray-50 hover:bg-green-50/50 hover:border-green-100 border-2 border-transparent transition-all duration-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">
                          {consent.consent_type.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {consent.is_granted ? 'Granted' : 'Not Granted'}
                        </p>
                        {consent.granted_at && (
                          <p className="text-sm text-gray-500">
                            Granted on: {new Date(consent.granted_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => updateConsent(consent.id, !consent.is_granted)}
                        className={`px-4 py-2 rounded-lg ${
                          consent.is_granted
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {consent.is_granted ? 'Revoke' : 'Grant'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'access-logs':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <ClockIcon className="w-5 h-5 mr-2 text-purple-500" />
                Access Logs
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {accessLogs.map(log => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.access_time).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {log.action}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ip_address}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'financial':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-500" />
                  Financial Overview
                </h2>
                <button
                  onClick={handlePayAllMandatory}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Pay All Mandatory Fees
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {financialOverview.map(item => (
                  <div key={item.id} 
                       className="p-4 rounded-xl bg-gray-50 hover:bg-green-50/50 hover:border-green-100 border-2 border-transparent 
                                transition-all duration-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{item.type}</h3>
                          {item.mandatory ? (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                              Mandatory
                            </span>
                          ) : (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              Optional
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{item.dueDate}</p>
                        {item.note && (
                          <p className="text-xs text-gray-500 mt-1">{item.note}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">KSh {item.amount.toLocaleString()}</p>
                        <span className={`text-sm ${
                          item.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {item.status}
                        </span>
                        {item.status !== 'Paid' && (
                          <button
                            onClick={() => handlePayNow(item)}
                            className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <h2 className="text-xl font-semibold mb-6">Payment History</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {financialOverview.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Mar 15, 2024</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">KSh {item.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            item.status === 'Paid' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <PaymentModal
              isOpen={isPaymentModalOpen}
              closeModal={() => setIsPaymentModalOpen(false)}
              amount={selectedPayment.amount}
              feeDetails={selectedPayment.type ? {
                type: selectedPayment.type,
                dueDate: selectedPayment.dueDate || '',
                mandatory: selectedPayment.mandatory || false
              } : undefined}
              isMultipleFees={!selectedPayment.type}
            />
          </div>
        );

      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-purple-500" />
                Upcoming Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map(event => (
                  <div key={event.id} 
                       className="p-4 rounded-xl bg-gray-50 hover:bg-purple-50/50 hover:border-purple-100 border-2 border-transparent 
                                transition-all duration-200">
                    <h3 className="font-medium text-lg mb-2">{event.title}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-gray-500">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'communication':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <h2 className="text-xl font-semibold mb-6 flex items-center">
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-blue-500" />
                Messages from Teachers
              </h2>
              <div className="space-y-4">
                {academicProgress.map(subject => (
                  <div key={subject.id} 
                       className="p-4 rounded-xl bg-gray-50 hover:bg-blue-50/50 hover:border-blue-100 border-2 border-transparent 
                                transition-all duration-200">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-medium">{subject.subject}</h3>
                        <p className="text-sm text-gray-500">Lecturer: {subject.lecturer}</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                        Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Announcements Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
              <h2 className="text-xl font-semibold mb-6">School Announcements</h2>
              <div className="space-y-4">
                {upcomingEvents.map(event => (
                  <div key={event.id} 
                       className="p-4 rounded-xl bg-gray-50 hover:bg-blue-50/50 hover:border-blue-100 border-2 border-transparent 
                                transition-all duration-200">
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{event.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderStudentOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <div className="flex items-center">
        <AcademicCapIcon className="w-12 h-12 text-blue-500" />
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">Student Name</h3>
          <p className="text-lg font-semibold text-gray-800">{studentInfo.name}</p>
        </div>
      </div>
      <div className="flex items-center">
        <ChartBarIcon className="w-12 h-12 text-green-500" />
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">Program</h3>
          <p className="text-lg font-semibold text-gray-800">{studentInfo.program}</p>
        </div>
      </div>
      <div className="flex items-center">
        <ClockIcon className="w-12 h-12 text-purple-500" />
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">Attendance</h3>
          <p className="text-lg font-semibold text-gray-800">{studentInfo.attendance}%</p>
        </div>
      </div>
      <div className="flex items-center">
        <CheckCircleIcon className="w-12 h-12 text-yellow-500" />
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">Overall Grade</h3>
          <p className="text-lg font-semibold text-gray-800">{studentInfo.overallGrade}</p>
        </div>
      </div>
      <div className="flex items-center">
        <HomeIcon className="w-12 h-12 text-indigo-500" />
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">Accommodation</h3>
          <p className="text-lg font-semibold text-gray-800">{studentInfo.accommodation}</p>
        </div>
      </div>
    </div>
  );

  // Update the navigation items
  const navigationItems = [
    { id: 'overview', icon: AcademicCapIcon, label: 'Academic Progress' },
    { id: 'financial', icon: CurrencyDollarIcon, label: 'Financial Overview' },
    { id: 'schedule', icon: CalendarIcon, label: 'Schedule' },
    { id: 'communication', icon: ChatBubbleLeftRightIcon, label: 'Communication' },
    { id: 'notifications', icon: BellIcon, label: 'Notifications' },
    { id: 'consent', icon: ShieldCheckIcon, label: 'Consent Management' },
    { id: 'access-logs', icon: ClockIcon, label: 'Access Logs' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modified Header - moved to the right */}
      <div className="fixed top-0 right-0 left-0 lg:left-64 z-10 transition-all duration-300">
        <DashboardHeader userRole="Parent" userName="Mr. Smith" />
      </div>
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-20 p-2 rounded-lg bg-white shadow-md hover:bg-gray-50"
      >
        {isSidebarOpen ? (
          <XMarkIcon className="w-6 h-6 text-gray-600" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-gray-600" />
        )}
      </button>

      {/* Responsive Sidebar */}
      <div className={`fixed top-0 left-0 h-full bg-white shadow-lg z-10 transition-all duration-300 
                      ${isSidebarOpen ? 'w-64' : 'w-0 lg:w-64'} overflow-hidden`}>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Parent Portal</h2>
              <p className="text-sm text-gray-500">Spring 2024</p>
            </div>
          </div>
          <div className="h-0.5 bg-gray-100 w-full mb-6"></div>
          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <a
                key={item.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(item.id);
                  // Close sidebar on mobile when clicking a link
                  if (window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`flex items-center p-3 rounded-xl transition-all duration-200
                  ${activeTab === item.id 
                    ? 'bg-blue-500 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-white' : ''}`} />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Modified Main Content - responsive padding */}
      <div className="pt-16 transition-all duration-300 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Welcome Banner */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8 rounded-2xl shadow-lg">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome back, Mr. Smith! 👋</h1>
              <p className="text-blue-100">Here's an overview of {studentInfo.name}'s academic progress in {studentInfo.program}.</p>
            </div>
          </div>

          {/* Student Overview Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 mb-6">
            {renderStudentOverview()}
          </div>

          {/* Render content based on active tab */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;