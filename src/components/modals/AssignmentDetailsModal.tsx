import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { StudentAssignment } from '../../services/assignmentService';

interface AssignmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: StudentAssignment;
  onSubmit: (assignment: StudentAssignment) => Promise<void> | void;
  submittingAssignmentId: number | null;
  submissionText: { [assignmentId: number]: string };
  setSubmissionText: React.Dispatch<React.SetStateAction<{ [assignmentId: number]: string }>>;
  submissionFile: { [assignmentId: number]: File | null };
  setSubmissionFile: React.Dispatch<React.SetStateAction<{ [assignmentId: number]: File | null }>>;
}

const AssignmentDetailsModal: React.FC<AssignmentDetailsModalProps> = ({
  isOpen,
  onClose,
  assignment,
  onSubmit,
  submittingAssignmentId,
  submissionText,
  setSubmissionText,
  submissionFile,
  setSubmissionFile,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  if (!isOpen) return null;

  const isText = assignment.type === 'text';
  const isFile = assignment.type === 'file';
  const textValue = submissionText[assignment.id] || '';
  const fileValue = submissionFile[assignment.id];
  const canSubmit = (isText && textValue.trim().length > 0) || (isFile && !!fileValue);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (!canSubmit) {
      setError(isText ? 'Please enter your answer.' : 'Please select a file to upload.');
      return;
    }
    try {
      await onSubmit(assignment);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit assignment.');
    }
  };

  // Instructional text
  let instruction = '';
  if (isText) instruction = 'Type your answer below and click Submit Assignment.';
  if (isFile) instruction = 'Upload your completed assignment file below and click Submit Assignment.';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-2xl font-bold text-blue-700">Assignment Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XMarkIcon className="w-7 h-7" />
          </button>
        </div>
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-1">{assignment.title}</h4>
          <p className="text-gray-600 mb-2">Due: {new Date(assignment.due_date).toLocaleString()}</p>
          <p className="text-gray-700 mb-4 whitespace-pre-line">{assignment.description}</p>
        </div>
        <div className="mb-4 text-blue-700 font-medium text-sm">{instruction}</div>
        {/* Show teacher's file for file assignments */}
        {isFile && assignment.assignment_file_path && (
          <div className="mb-4">
            <div className="font-semibold text-gray-700 mb-1">Download Assignment File (from Teacher):</div>
            <a href={assignment.assignment_file_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Download Instructions/Template</a>
          </div>
        )}
        {assignment.submission_status ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium mr-2">Submitted</span>
            {assignment.marks_obtained !== null && assignment.marks_obtained !== undefined && !isNaN(Number(assignment.marks_obtained)) ? (
              <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium mr-2">Marks: {assignment.marks_obtained}</span>
            ) : (
              <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-medium mr-2">Marks: -</span>
            )}
            {assignment.graded_at && (
              <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium">Graded</span>
            )}
            {/* Show submitted answer or file info if available */}
            {isText && assignment.submission_text && (
              <div className="mt-4">
                <div className="font-semibold text-gray-700 mb-1">Your Submitted Answer:</div>
                <div className="bg-white border rounded p-3 text-gray-800 whitespace-pre-line">{assignment.submission_text || 'No answer submitted.'}</div>
              </div>
            )}
            {isFile && assignment.student_file_path && (
              <div className="mt-4">
                <div className="font-semibold text-gray-700 mb-1">Your Submitted File:</div>
                <a href={assignment.student_file_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Submitted File</a>
              </div>
            )}
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>
            )}
            {isText && (
              <div>
                <label className="block font-semibold text-gray-700 mb-1" htmlFor="assignment-textarea">Your Answer</label>
                <textarea
                  id="assignment-textarea"
                  className={`w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${touched && !textValue.trim() ? 'border-red-400' : ''}`}
                  rows={6}
                  placeholder="Enter your answer..."
                  value={textValue}
                  onChange={e => setSubmissionText(prev => ({ ...prev, [assignment.id]: e.target.value }))}
                  required
                />
              </div>
            )}
            {isFile && (
              <div>
                <label className="block font-semibold text-gray-700 mb-1" htmlFor="assignment-file">Upload your file</label>
                <input
                  id="assignment-file"
                  type="file"
                  className={`w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${touched && !fileValue ? 'border-red-400' : ''}`}
                  onChange={e => setSubmissionFile(prev => ({ ...prev, [assignment.id]: e.target.files?.[0] || null }))}
                  required
                />
              </div>
            )}
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingAssignmentId === assignment.id || !canSubmit}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingAssignmentId === assignment.id ? 'Submitting...' : 'Submit Assignment'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetailsModal; 