
import React, { useState, useCallback, useEffect } from 'react';
import { UserRole, Classroom, Assignment, Submission } from './types';
import { getClassrooms } from './services/apiService';
import LoginPage from './components/LoginPage';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import ClassroomView from './components/ClassroomView';
import EvaluationView from './components/EvaluationView';
import Header from './components/Header';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'classroom' | 'evaluation'>('dashboard');
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<{ submission: Submission, assignment: Assignment } | null>(null);

  const fetchAndSetClassrooms = useCallback(async () => {
    try {
      setError(null);
      setIsLoading(true);
      const data = await getClassrooms();
      setClassrooms(data);
      // FIX: Return the fetched data so it can be used to update the selected classroom after a refresh.
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data from the server.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if(userRole){
      fetchAndSetClassrooms();
    }
  }, [userRole, fetchAndSetClassrooms]);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUserRole(null);
    setSelectedClassroom(null);
    setSelectedSubmission(null);
    setCurrentView('dashboard');
  };
  
  const handleSelectClassroom = useCallback((classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setCurrentView('classroom');
  }, []);

  const handleSelectSubmission = useCallback((submission: Submission, assignment: Assignment, classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setSelectedSubmission({ submission, assignment });
    setCurrentView('evaluation');
  }, []);

  const handleBackToDashboard = () => {
    setSelectedClassroom(null);
    setSelectedSubmission(null);
    setCurrentView('dashboard');
    fetchAndSetClassrooms();
  };
  
  const handleBackToClassroom = () => {
    const classroomId = selectedClassroom?.id;
    setSelectedSubmission(null);
    setCurrentView('classroom');
    fetchAndSetClassrooms().then((refreshedClassrooms) => {
        if(classroomId && refreshedClassrooms){
             const updatedClassroom = (refreshedClassrooms as Classroom[]).find(c => c.id === classroomId);
             setSelectedClassroom(updatedClassroom || null);
        }
    });
  };

  const renderContent = () => {
    if (!userRole) {
      return <LoginPage onLogin={handleLogin} />;
    }
    
    if (isLoading) {
        return <div className="text-center p-10"><Spinner text="Loading data..."/></div>;
    }
    
    if (error) {
        return (
          <div className="text-center p-10 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-red-700">Connection Error</h3>
            <p className="text-red-600 mt-2">Could not connect to the backend server. Please ensure the server is running and accessible.</p>
            <p className="text-sm text-gray-500 mt-4">Follow the instructions in the `server/README.md` file to start the backend.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700"
            >
              Retry Connection
            </button>
          </div>
        );
    }

    if (currentView === 'evaluation' && selectedSubmission && selectedClassroom) {
       const currentClassroomData = classrooms.find(c => c.id === selectedClassroom.id);
       if(!currentClassroomData) return null;
       
      return <EvaluationView 
        submission={selectedSubmission.submission}
        assignment={selectedSubmission.assignment}
        classroom={currentClassroomData}
        onBack={handleBackToClassroom} 
        refreshData={fetchAndSetClassrooms}
        userRole={userRole}
      />;
    }

    if (currentView === 'classroom' && selectedClassroom) {
      const currentClassroomData = classrooms.find(c => c.id === selectedClassroom.id);
      if (!currentClassroomData) {
        handleBackToDashboard();
        return null;
      }
      return <ClassroomView 
        classroom={currentClassroomData} 
        onBack={handleBackToDashboard} 
        userRole={userRole}
        refreshData={fetchAndSetClassrooms}
        onSelectSubmission={(submission, assignment) => handleSelectSubmission(submission, assignment, currentClassroomData)}
      />;
    }

    switch (userRole) {
      case UserRole.Teacher:
        return <TeacherDashboard 
                  classrooms={classrooms} 
                  refreshData={fetchAndSetClassrooms}
                  onSelectClassroom={handleSelectClassroom}
                />;
      case UserRole.Student:
        return <StudentDashboard 
                  classrooms={classrooms}
                  refreshData={fetchAndSetClassrooms}
                  onSelectClassroom={handleSelectClassroom}
                />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {userRole && <Header userRole={userRole} onLogout={handleLogout} />}
      <main className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;