
import React, { useState } from 'react';
import { Classroom } from '../types';
import LoginIcon from './icons/LoginIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import { joinClassroom } from '../services/apiService';

interface StudentDashboardProps {
  classrooms: Classroom[];
  refreshData: () => void;
  onSelectClassroom: (classroom: Classroom) => void;
}

const STUDENT_ID = 'student-01'; // Mock student ID

const StudentDashboard: React.FC<StudentDashboardProps> = ({ classrooms, refreshData, onSelectClassroom }) => {
  const [secretCode, setSecretCode] = useState('');
  const [error, setError] = useState('');
  
  const studentClassrooms = classrooms.filter(c => c.studentIds.includes(STUDENT_ID));

  const handleJoinClassroom = async () => {
    setError('');
    const code = secretCode.trim();
    if (!code) {
        setError('Please enter a classroom code.');
        return;
    }
    try {
        await joinClassroom(code);
        alert('Successfully joined classroom!');
        refreshData();
        setSecretCode('');
    } catch (err: any) {
        setError(err.message || 'Invalid classroom code. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Join a Classroom</h3>
        <div className="flex items-start gap-2">
          <div className="flex-grow">
            <input
              type="text"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Enter Secret Code"
            />
             {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <button
            onClick={handleJoinClassroom}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
          >
            <LoginIcon className="w-5 h-5" />
            Join
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">My Classrooms</h2>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {studentClassrooms.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {studentClassrooms.map((classroom) => (
              <li key={classroom.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                        <div className="flex-shrink-0 bg-primary-100 rounded-full p-2">
                             <BookOpenIcon className="w-6 h-6 text-primary-600"/>
                        </div>
                        <div className="ml-4 min-w-0">
                            <p className="text-lg font-semibold text-primary-800 truncate">{classroom.name}</p>
                            <p className="text-sm text-gray-500">Teacher ID: {classroom.teacherId}</p>
                        </div>
                    </div>
                  <button onClick={() => onSelectClassroom(classroom)} className="text-gray-400 hover:text-primary-600">
                    <ChevronRightIcon className="w-7 h-7" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center p-12 text-gray-500">
            <BookOpenIcon className="w-16 h-16 mx-auto text-gray-300"/>
            <h3 className="mt-2 text-lg font-medium">No classrooms joined</h3>
            <p className="mt-1 text-sm">Use the form above to join a classroom with a secret code.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
