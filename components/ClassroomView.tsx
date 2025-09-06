
import React, { useState } from 'react';
import { Classroom, UserRole, Assignment, Submission } from '../types';
import Modal from './Modal';
import PlusIcon from './icons/PlusIcon';
import UploadIcon from './icons/UploadIcon';
import Spinner from './Spinner';
import { convertPdfToImage } from '../utils/fileUtils';
import { createAssignment, submitAssignment } from '../services/apiService';

const STUDENT_ID = 'student-01'; // Mock student ID

interface ClassroomViewProps {
  classroom: Classroom;
  onBack: () => void;
  userRole: UserRole;
  refreshData: () => void;
  onSelectSubmission: (submission: Submission, assignment: Assignment) => void;
}

const ClassroomView: React.FC<ClassroomViewProps> = ({ classroom, onBack, userRole, refreshData, onSelectSubmission }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [uploadingAssignmentId, setUploadingAssignmentId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleCreateAssignment = async () => {
    if (newAssignmentTitle.trim()) {
      try {
        await createAssignment(classroom.id, newAssignmentTitle.trim());
        refreshData();
        setNewAssignmentTitle('');
        setIsModalOpen(false);
      } catch (error) {
          alert('Failed to create assignment. Please try again.');
          console.error(error);
      }
    }
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>, assignmentId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setUploadError('Please upload a PDF file.');
        return;
      }
      setUploadError('');
      setIsUploading(true);
      try {
        const imageBase64 = await convertPdfToImage(file);
        await submitAssignment(classroom.id, assignmentId, imageBase64, file.name);
        refreshData();
      } catch (error: any) {
        setUploadError(error.message || 'Failed to process file.');
      } finally {
        setIsUploading(false);
        setUploadingAssignmentId(null);
      }
    }
  };

  const studentSubmission = (assignment: Assignment): Submission | undefined => {
    return assignment.submissions.find(s => s.studentId === STUDENT_ID);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <button onClick={onBack} className="mb-4 text-sm font-medium text-primary-600 hover:text-primary-800">
        &larr; Back to Dashboard
      </button>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">{classroom.name}</h2>
        {userRole === UserRole.Teacher && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
          >
            <PlusIcon className="w-5 h-5" />
            Create Assignment
          </button>
        )}
      </div>

      <div className="space-y-6">
        {classroom.assignments.length > 0 ? (
          classroom.assignments.map(assignment => (
            <div key={assignment.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold text-gray-900">{assignment.title}</h3>
              <p className="text-sm text-gray-500 mb-4">Created on: {new Date(assignment.createdAt).toLocaleDateString()}</p>

              {userRole === UserRole.Teacher && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Submissions ({assignment.submissions.length})</h4>
                  {assignment.submissions.length > 0 ? (
                    <ul className="divide-y divide-gray-200 border rounded-md">
                      {assignment.submissions.map(sub => (
                        <li key={sub.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                          <div>
                            <p className="font-medium text-gray-800">{sub.fileName}</p>
                            <p className="text-xs text-gray-500">By: {sub.studentId} on {new Date(sub.submittedAt).toLocaleString()}</p>
                          </div>
                           <button
                              onClick={() => onSelectSubmission(sub, assignment)}
                              className={`px-3 py-1 text-sm font-medium text-white rounded-md transition ${sub.isGraded ? 'bg-green-600 hover:bg-green-700' : 'bg-primary-600 hover:bg-primary-700'}`}
                            >
                              {sub.isGraded ? 'View Graded' : 'Evaluate'}
                            </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No submissions yet.</p>
                  )}
                </div>
              )}
              
              {userRole === UserRole.Student && (() => {
                const submission = studentSubmission(assignment);

                if (submission?.isGraded) {
                    return (
                        <div className="mt-4">
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-center">
                                <p className="font-semibold text-blue-800">Your assignment has been graded!</p>
                                <button
                                    onClick={() => onSelectSubmission(submission, assignment)}
                                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 cursor-pointer transition"
                                >
                                    View Grade & Feedback
                                </button>
                            </div>
                        </div>
                    );
                }
                
                return (
                    <div className="mt-4">
                        {submission ? (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                                <p className="font-semibold text-green-800">You have submitted: {submission.fileName}</p>
                                <p className="text-sm text-green-700">on {new Date(submission.submittedAt).toLocaleString()}</p>
                                <p className="mt-2 text-sm text-gray-600">You can re-upload to replace your submission.</p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic">You have not submitted this assignment yet.</p>
                        )}
                        <div className="mt-4">
                            <label 
                                htmlFor={`upload-${assignment.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 cursor-pointer transition"
                            >
                                <UploadIcon className="w-5 h-5"/>
                                {submission ? 'Re-upload Homework' : 'Upload Homework (PDF)'}
                            </label>
                            <input 
                                id={`upload-${assignment.id}`} 
                                type="file" 
                                className="hidden" 
                                accept="application/pdf"
                                onChange={(e) => handleFileChange(e, assignment.id)}
                                onClick={() => setUploadingAssignmentId(assignment.id)}
                            />
                            {isUploading && uploadingAssignmentId === assignment.id && <div className="mt-2"><Spinner text="Processing PDF..."/></div>}
                            {uploadError && uploadingAssignmentId === assignment.id && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
                        </div>
                    </div>
                );
              })()}
            </div>
          ))
        ) : (
          <div className="text-center p-12 bg-white rounded-lg shadow-md text-gray-500">
            <h3 className="text-lg font-medium">No assignments yet</h3>
            {userRole === UserRole.Teacher ? (
                <p className="mt-1 text-sm">Create the first assignment for this class.</p>
            ) : (
                <p className="mt-1 text-sm">Your teacher has not created any assignments yet.</p>
            )}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create a new assignment">
        <div className="space-y-4">
          <div>
            <label htmlFor="assignmentTitle" className="block text-sm font-medium text-gray-700">Assignment Title</label>
            <input
              type="text"
              id="assignmentTitle"
              value={newAssignmentTitle}
              onChange={(e) => setNewAssignmentTitle(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="e.g., Chapter 3 Homework"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleCreateAssignment}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClassroomView;
