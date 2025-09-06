import React, { useState, useRef, useEffect } from 'react';
import { Submission, Assignment, Classroom, GradingResponse, AIError, Language, UserRole, ProblemBreakdown, BoundingBox } from '../types';
import { gradeHomeworkWithAI } from '../services/apiService';
import { updateSubmissionEvaluation } from '../services/apiService';
import Spinner from './Spinner';
import SparklesIcon from './icons/SparklesIcon';
import PlusIcon from './icons/PlusIcon';
import GradeDonutChart from './GradeDonutChart';
import ProblemAccordionItem from './ProblemAccordionItem';
import InfoBanner from './InfoBanner';

interface EvaluationViewProps {
  submission: Submission;
  assignment: Assignment;
  classroom: Classroom;
  onBack: () => void;
  refreshData: () => void;
  userRole: UserRole;
}

const EvaluationView: React.FC<EvaluationViewProps> = ({ submission, assignment, classroom, onBack, refreshData, userRole }) => {
  const [manualEvaluation, setManualEvaluation] = useState<GradingResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [activeError, setActiveError] = useState<AIError | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  useEffect(() => {
    setManualEvaluation(submission.evaluation ? JSON.parse(JSON.stringify(submission.evaluation)) : null);
  }, [submission.evaluation]);

  const handleEvaluate = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await gradeHomeworkWithAI(submission.fileData);
      setManualEvaluation(result);
    } catch (e: any) {
      console.error("Evaluation failed:", e);
      setError(`Evaluation failed. ${e.message || 'An unknown error occurred.'} Please check the console for details and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFinalScore = (breakdown: ProblemBreakdown[]): number => {
    const totalScore = breakdown.reduce((acc, prob) => acc + (Number(prob.score) || 0), 0);
    const totalMaxScore = breakdown.reduce((acc, prob) => acc + (Number(prob.max_score) || 0), 0);
    return totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
  };

  const handleProblemChange = (index: number, field: keyof ProblemBreakdown, value: any, subfield?: 'en' | 'he') => {
    setManualEvaluation(prev => {
        if (!prev) return null;
        const newBreakdown = [...prev.problem_breakdown];
        const problemToUpdate = { ...newBreakdown[index] };

        if (subfield && typeof (problemToUpdate as any)[field] === 'object') {
            (problemToUpdate as any)[field][subfield] = value;
        } else {
            (problemToUpdate as any)[field] = value;
        }
        newBreakdown[index] = problemToUpdate;
        
        return { ...prev, overall_score: calculateFinalScore(newBreakdown), problem_breakdown: newBreakdown };
    });
  };

  const handleErrorChange = (problemIndex: number, errorIndex: number, field: keyof AIError, value: any, subfield?: 'en' | 'he') => {
      setManualEvaluation(prev => {
          if (!prev) return null;
          const newBreakdown = [...prev.problem_breakdown];
          const problemToUpdate = { ...newBreakdown[problemIndex] };
          const newErrors = [...problemToUpdate.errors];
          const errorToUpdate = { ...newErrors[errorIndex] };

          if (subfield && typeof (errorToUpdate as any)[field] === 'object') {
              (errorToUpdate as any)[field][subfield] = value;
          } else {
              (errorToUpdate as any)[field] = value;
          }
          newErrors[errorIndex] = errorToUpdate;
          problemToUpdate.errors = newErrors;
          newBreakdown[problemIndex] = problemToUpdate;
          return { ...prev, problem_breakdown: newBreakdown };
      });
  };

  const handleAddError = (problemIndex: number) => {
      const newError: AIError = {
          error_type: 'minor_slip',
          deduction: 1,
          explanation: { en: 'New error explanation.', he: 'הסבר שגיאה חדש.' },
          hint: { en: 'New hint.', he: 'רמז חדש.' },
          boundingBox: { x: 0, y: 0, width: 0.1, height: 0.1 } as BoundingBox,
      };
      setManualEvaluation(prev => {
          if (!prev) return null;
          const newBreakdown = [...prev.problem_breakdown];
          const problemToUpdate = { ...newBreakdown[problemIndex] };
          problemToUpdate.errors = [...problemToUpdate.errors, newError];
          newBreakdown[problemIndex] = problemToUpdate;
          return { ...prev, problem_breakdown: newBreakdown };
      });
  };

  const handleRemoveError = (problemIndex: number, errorIndex: number) => {
      setManualEvaluation(prev => {
          if (!prev) return null;
          const newBreakdown = [...prev.problem_breakdown];
          const problemToUpdate = { ...newBreakdown[problemIndex] };
          problemToUpdate.errors = problemToUpdate.errors.filter((_, idx) => idx !== errorIndex);
          newBreakdown[problemIndex] = problemToUpdate;
          return { ...prev, problem_breakdown: newBreakdown };
      });
  };

  const handleOverallScoreChange = (newScore: number) => {
      if (!isNaN(newScore) && newScore >= 0 && newScore <= 100) {
          setManualEvaluation(prev => prev ? {...prev, overall_score: newScore} : null);
      }
  }

  const handleAddProblem = () => {
    const newProblem: ProblemBreakdown = {
        problem_description: { en: 'New Question', he: 'שאלה חדשה' },
        score: 0,
        max_score: 25,
        feedback: { en: '', he: '' },
        teacher_recommendation: { en: '', he: '' },
        errors: [],
    };
    setManualEvaluation(prev => {
        const newBreakdown = prev ? [...prev.problem_breakdown, newProblem] : [newProblem];
        const newScore = calculateFinalScore(newBreakdown);
        return { overall_score: newScore, problem_breakdown: newBreakdown };
    });
  };

  const handleSaveAndSubmit = async () => {
    if (!manualEvaluation) return;

    try {
        await updateSubmissionEvaluation(classroom.id, assignment.id, submission.id, manualEvaluation);
        alert('Grade has been submitted to the student!');
        onBack();
    } catch (err) {
        alert('Failed to save and submit the grade. Please try again.');
        console.error(err);
    }
  };


  const getErrorColor = (type: AIError['error_type']) => {
    switch(type) {
      case 'minor_slip': return 'border-yellow-400';
      case 'procedural_error': return 'border-orange-500';
      case 'conceptual_error': return 'border-red-600';
      default: return 'border-gray-400';
    }
  }

  const renderBoundingBox = (error: AIError) => {
    if (!imageRef.current) return null;
    
    const { naturalWidth, naturalHeight, offsetWidth, offsetHeight } = imageRef.current;
    if (naturalWidth === 0 || naturalHeight === 0) return null;
    
    const style: React.CSSProperties = {
      position: 'absolute',
      left: `${error.boundingBox.x * offsetWidth}px`,
      top: `${error.boundingBox.y * offsetHeight}px`,
      width: `${error.boundingBox.width * offsetWidth}px`,
      height: `${error.boundingBox.height * offsetHeight}px`,
      borderWidth: '3px',
      transition: 'all 0.2s ease-in-out',
      transform: activeError === error ? 'scale(1.05)' : 'scale(1)',
      zIndex: activeError === error ? 20 : 10,
    };
    
    return <div style={style} className={`${getErrorColor(error.error_type)} rounded-sm shadow-lg pointer-events-none`}></div>;
  };

  const isTeacher = userRole === UserRole.Teacher;

  return (
    <div className="max-w-7xl mx-auto">
      <button onClick={onBack} className="mb-4 text-sm font-medium text-primary-600 hover:text-primary-800">
        &larr; Back to Classroom
      </button>
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">{assignment.title}</h2>
                <p className="text-sm text-gray-500">Submission by: {submission.studentId} ({submission.fileName})</p>
            </div>
        </div>
        
        <InfoBanner>
            <p className="font-bold">Beta Version: Scoring Assistant</p>
            <p className="text-sm">This is a scoring assistant, not an auto-grader. The AI provides suggestions for mistakes and scores, but the final grade must be determined by the teacher.</p>
        </InfoBanner>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="border rounded-lg overflow-y-auto bg-gray-100 shadow-inner h-[75vh]">
            <div className="relative">
              <img ref={imageRef} src={`data:image/png;base64,${submission.fileData}`} alt="Student Submission" className="w-full h-auto" onLoad={() => setImageLoaded(true)} />
              {manualEvaluation && imageLoaded && manualEvaluation.problem_breakdown.flatMap(p => p.errors).map((err, index) => (
                  <React.Fragment key={index}>{renderBoundingBox(err)}</React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col bg-gray-50 rounded-lg shadow-inner overflow-hidden">
            {!manualEvaluation && !isLoading && isTeacher && (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <SparklesIcon className="w-16 h-16 text-primary-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-800">Ready to Grade</h3>
                <p className="text-gray-600 text-center mt-2 mb-6">Use AI to get a detailed evaluation or start grading manually.</p>
                <div className='flex flex-col gap-2 w-full max-w-xs'>
                  <button onClick={handleEvaluate} className="flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition">
                    <SparklesIcon className="w-5 h-5" /> Evaluate with AI
                  </button>
                  <button onClick={handleAddProblem} className="flex items-center justify-center gap-2 px-6 py-3 text-base font-medium text-primary-700 bg-primary-100 rounded-lg hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition">
                     <PlusIcon className="w-5 h-5" /> Grade Manually
                  </button>
                </div>
              </div>
            )}
            
            {isLoading && <div className="h-full flex items-center justify-center"><Spinner text="AI is grading..." /></div>}
            
            {error && <div className="h-full flex items-center justify-center p-4"><p className="text-red-500">{error}</p></div>}
            
            {manualEvaluation && (
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex-shrink-0 p-4 border-b bg-white">
                        <div className="flex justify-between items-start">
                             <div>
                                <h3 className="text-xl font-bold text-gray-800">{isTeacher ? "Evaluation & Grading" : "Evaluation Result"}</h3>
                                <p className="text-sm text-gray-500">Review the score and feedback below</p>
                             </div>
                             <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
                                <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-sm rounded-md ${language === 'en' ? 'bg-white shadow' : ''}`}>EN</button>
                                <button onClick={() => setLanguage('he')} className={`px-3 py-1 text-sm rounded-md ${language === 'he' ? 'bg-white shadow' : ''}`}>HE</button>
                            </div>
                        </div>
                         <div className="flex justify-center items-center my-4">
                            <GradeDonutChart 
                                score={manualEvaluation.overall_score} 
                                isEditable={isTeacher}
                                onScoreChange={handleOverallScoreChange}
                            />
                        </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-grow overflow-y-auto p-4 space-y-3">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Score Breakdown</h4>
                        {manualEvaluation.problem_breakdown.map((problem, idx) => (
                           <ProblemAccordionItem
                                key={idx}
                                problem={problem}
                                language={language}
                                onHoverError={setActiveError}
                                isEditable={isTeacher}
                                onProblemChange={(field, value, subfield) => handleProblemChange(idx, field, value, subfield)}
                                onErrorChange={(errorIdx, field, value, subfield) => handleErrorChange(idx, errorIdx, field, value, subfield)}
                                onAddError={() => handleAddError(idx)}
                                onRemoveError={(errorIdx) => handleRemoveError(idx, errorIdx)}
                           />
                        ))}
                    </div>

                     {/* Footer */}
                     {isTeacher && (
                        <div className="flex-shrink-0 mt-auto p-4 border-t bg-white space-y-2">
                            <button onClick={handleAddProblem} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-primary-700 bg-primary-100 rounded-lg hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition">
                                <PlusIcon className="w-5 h-5" /> Add Missing Question
                            </button>
                            <button onClick={handleSaveAndSubmit} className="w-full px-6 py-3 text-base font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition">
                                Save & Submit to Student
                            </button>
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationView;