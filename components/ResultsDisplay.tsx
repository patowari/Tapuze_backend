
import React, { useState } from 'react';
import type { GradingResponse, ProblemAnalysis, ErrorType } from '../types';
import type { Language } from '../App';
import { XCircleIcon } from './icons/XCircleIcon';
import { CheckIcon } from './icons/CheckIcon';

const getGradeColor = (score: number, maxScore = 100) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-emerald-500';
    if (percentage >= 75) return 'text-sky-500';
    if (percentage >= 60) return 'text-amber-500';
    return 'text-red-500';
};

const ErrorTypePill: React.FC<{ type: ErrorType, language: Language }> = ({ type, language }) => {
    const styles = {
        minor_slip: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        procedural_error: 'bg-orange-100 text-orange-800 border-orange-300',
        conceptual_error: 'bg-red-100 text-red-800 border-red-300',
    };
    const text = {
        en: {
            minor_slip: 'Minor Slip',
            procedural_error: 'Procedural Error',
            conceptual_error: 'Conceptual Error',
        },
        he: {
            minor_slip: 'טעות קלה',
            procedural_error: 'שגיאה פרוצדורלית',
            conceptual_error: 'שגיאה מושגית',
        }
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${styles[type]}`}>
            {text[language][type]}
        </span>
    );
};

const ChevronDownIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);


const ProblemAccordionItem: React.FC<{
    problem: ProblemAnalysis;
    problemIndex: number;
    onHoverError: (problemIndex: number, errorIndex: number | null) => void;
    language: Language;
}> = ({ problem, problemIndex, onHoverError, language }) => {
    const [isOpen, setIsOpen] = useState(problem.errors.length > 0);
    const isPerfect = problem.score === problem.max_score;
    const dir = language === 'he' ? 'rtl' : 'ltr';

    const texts = {
        en: {
            points: "pts",
            studentFeedback: "Student Feedback:",
            teacherRecommendation: "Teacher Recommendation:",
            errorDetails: "Error Details:"
        },
        he: {
            points: "נק'",
            studentFeedback: "משוב לתלמיד:",
            teacherRecommendation: "המלצה למורה:",
            errorDetails: "פירוט הטעויות:"
        }
    };

    return (
        <div className="border-b border-gray-200 last:border-b-0">
            <h2>
                <button
                    type="button"
                    className="flex items-center justify-between w-full p-4 text-left text-gray-800 hover:bg-gray-50 focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    dir={dir}
                >
                    <div className="flex items-center">
                         <span className={`w-6 h-6 flex-shrink-0 ${language === 'he' ? 'ml-3' : 'mr-3'} ${isPerfect ? 'text-green-500' : 'text-red-500'}`}>
                            {isPerfect ? <CheckIcon/> : <XCircleIcon/>}
                        </span>
                        <span className="font-semibold">{problem.problem_description[language]}</span>
                    </div>
                    <div className={`flex items-center flex-shrink-0 ${language === 'he' ? 'pl-2' : 'pr-2'}`}>
                        <span className={`font-bold text-lg ${getGradeColor(problem.score, problem.max_score)}`}>
                            {problem.score}/{problem.max_score}
                        </span>
                        <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-200 ${language === 'he' ? 'mr-2' : 'ml-2'} ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </button>
            </h2>
            <div
                className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}
                onMouseLeave={() => onHoverError(problemIndex, null)}
            >
                <div className="p-4 bg-gray-50/50" dir={dir}>
                    <div className="mb-4">
                        <h4 className="font-semibold mb-1 text-gray-800">{texts[language].studentFeedback}</h4>
                        <p className="text-gray-700">{problem.feedback[language]}</p>
                    </div>
                    <div className="mb-4 p-3 bg-indigo-50 border-l-4 border-indigo-300 rounded">
                        <h4 className="font-semibold mb-1 text-indigo-800">{texts[language].teacherRecommendation}</h4>
                        <p className="text-indigo-700">{problem.teacher_recommendation[language]}</p>
                    </div>
                    {problem.errors.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2 text-gray-800">{texts[language].errorDetails}</h4>
                            <ul className="space-y-3">
                                {problem.errors.map((error, errorIndex) => (
                                    <li
                                        key={errorIndex}
                                        className="p-3 -mx-3 rounded-lg hover:bg-red-100/50 cursor-pointer transition-colors duration-150"
                                        onMouseEnter={() => onHoverError(problemIndex, errorIndex)}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <ErrorTypePill type={error.error_type} language={language} />
                                            <span className="font-bold text-red-600">-{error.deduction} {texts[language].points}</span>
                                        </div>
                                        <p className="text-gray-600">{error.explanation[language]}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const ResultsDisplay: React.FC<{
  result: GradingResponse;
  onReset: () => void;
  onHoverError: (problemIndex: number | null, errorIndex: number | null) => void;
  language: Language;
}> = ({ result, onReset, onHoverError, language }) => {

  const texts = {
    en: {
        analysisComplete: "Analysis Complete",
        overallScore: "Overall Score",
        scoreBreakdown: "Score Breakdown",
        gradeAnother: "Grade Another Assignment"
    },
    he: {
        analysisComplete: "הניתוח הושלם",
        overallScore: "ציון כללי",
        scoreBreakdown: "פירוט הציון",
        gradeAnother: "בדיקת עבודה נוספת"
    }
  };
  const dir = language === 'he' ? 'rtl' : 'ltr';

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 h-full flex flex-col" dir={dir}>
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">{texts[language].analysisComplete}</h2>
      
        <div className="text-center p-6 bg-gray-50 rounded-lg mb-6 border border-gray-200">
            <p className="text-lg text-gray-600">{texts[language].overallScore}</p>
            <p className={`text-6xl font-bold ${getGradeColor(result.overall_score)}`}>
                {result.overall_score}
                <span className="text-3xl text-gray-500"> / 100</span>
            </p>
        </div>

        <div className="flex-grow mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 px-4">{texts[language].scoreBreakdown}</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                {result.problem_breakdown.map((problem, index) => (
                    <ProblemAccordionItem 
                        key={index} 
                        problem={problem} 
                        problemIndex={index}
                        onHoverError={(pIndex, eIndex) => onHoverError(pIndex, eIndex)}
                        language={language}
                    />
                ))}
            </div>
        </div>

        <button
            onClick={onReset}
            className="w-full mt-auto inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
        >
            {texts[language].gradeAnother}
        </button>
    </div>
  );
};