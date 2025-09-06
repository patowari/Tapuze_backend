
import React, { useState } from 'react';
import { Classroom } from '../types';
import Modal from './Modal';
import PlusIcon from './icons/PlusIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import { createClassroom } from '../services/apiService';

interface TeacherDashboardProps {
  classrooms: Classroom[];
  refreshData: () => void;
  onSelectClassroom: (classroom: Classroom) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ classrooms, refreshData, onSelectClassroom }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  const handleCreateClassroom = async () => {
    if (newClassName.trim()) {
      try {
        await createClassroom(newClassName.trim());
        refreshData();
        setNewClassName('');
        setIsModalOpen(false);
      } catch (error) {
          alert('Failed to create classroom. Please try again.');
          console.error(error);
      }
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">My Classrooms</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition"
        >
          <PlusIcon className="w-5 h-5" />
          Create Classroom
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {classrooms.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {classrooms.map((classroom) => (
              <li key={classroom.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                        <div className="flex-shrink-0 bg-primary-100 rounded-full p-2">
                             <BookOpenIcon className="w-6 h-6 text-primary-600"/>
                        </div>
                        <div className="ml-4 min-w-0">
                            <p className="text-lg font-semibold text-primary-800 truncate">{classroom.name}</p>
                            <div className="flex items-center mt-1">
                                <p className="text-sm text-gray-500">Secret Code:</p>
                                <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 font-mono text-sm rounded">{classroom.secretCode}</span>
                                <button onClick={() => handleCopyCode(classroom.secretCode)} className="ml-2 text-gray-400 hover:text-gray-600">
                                  <ClipboardIcon className="w-5 h-5"/>
                                </button>
                                {copiedCode === classroom.secretCode && <span className="ml-2 text-xs text-green-600">Copied!</span>}
                            </div>
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
            <h3 className="mt-2 text-lg font-medium">No classrooms yet</h3>
            <p className="mt-1 text-sm">Get started by creating your first classroom.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create a new classroom">
        <div className="space-y-4">
          <div>
            <label htmlFor="className" className="block text-sm font-medium text-gray-700">Classroom Name</label>
            <input
              type="text"
              id="className"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="e.g., Algebra 1 - Period 3"
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleCreateClassroom}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeacherDashboard;
