import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import type { ClassAnalytics, StudentAnalytics, AssignmentAnalytics, DiscussionAnalytics } from '../../services/analyticsService';

interface AnalyticsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  classAnalytics: ClassAnalytics;
  studentAnalytics: StudentAnalytics[];
  assignmentAnalytics: AssignmentAnalytics[];
  discussionAnalytics: DiscussionAnalytics[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AnalyticsDetailModal: React.FC<AnalyticsDetailModalProps> = ({
  isOpen,
  onClose,
  classAnalytics,
  studentAnalytics,
  assignmentAnalytics,
  discussionAnalytics
}) => {
  if (!isOpen) return null;

  const gradeDistribution = [
    { name: 'A (90-100)', value: studentAnalytics.filter(s => s.grade >= 90).length },
    { name: 'B (80-89)', value: studentAnalytics.filter(s => s.grade >= 80 && s.grade < 90).length },
    { name: 'C (70-79)', value: studentAnalytics.filter(s => s.grade >= 70 && s.grade < 80).length },
    { name: 'D (60-69)', value: studentAnalytics.filter(s => s.grade >= 60 && s.grade < 70).length },
    { name: 'F (<60)', value: studentAnalytics.filter(s => s.grade < 60).length },
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-6xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Analytics for {classAnalytics.class_name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Class Overview */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-lg font-semibold mb-4">Class Overview</h4>
            <div className="space-y-2">
              <p>Total Students: {classAnalytics.total_students}</p>
              <p>Average Progress: {classAnalytics.average_progress.toFixed(1)}%</p>
              <p>Average Attendance: {classAnalytics.average_attendance.toFixed(1)}%</p>
              <p>Average Grade: {classAnalytics.average_grade.toFixed(1)}%</p>
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-lg font-semibold mb-4">Grade Distribution</h4>
            <PieChart width={300} height={300}>
              <Pie
                data={gradeDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

          {/* Student Performance */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-lg font-semibold mb-4">Student Performance</h4>
            <BarChart
              width={500}
              height={300}
              data={studentAnalytics}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="student_name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="grade" name="Grade" fill="#8884d8" />
              <Bar dataKey="attendance" name="Attendance" fill="#82ca9d" />
            </BarChart>
          </div>

          {/* Assignment Completion */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-lg font-semibold mb-4">Assignment Completion</h4>
            <LineChart
              width={500}
              height={300}
              data={assignmentAnalytics}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="submitted_count" name="Submissions" stroke="#8884d8" />
              <Line type="monotone" dataKey="average_grade" name="Average Grade" stroke="#82ca9d" />
            </LineChart>
          </div>

          {/* Discussion Activity */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h4 className="text-lg font-semibold mb-4">Discussion Activity</h4>
            <BarChart
              width={500}
              height={300}
              data={discussionAnalytics}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_posts" name="Total Posts" fill="#8884d8" />
              <Bar dataKey="participating_students" name="Participating Students" fill="#82ca9d" />
            </BarChart>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDetailModal; 