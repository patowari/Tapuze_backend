import React, { useState } from 'react';
import type { ProblemBreakdown, AIError, Language } from '../types';
import CheckIcon from './icons/CheckIcon';
import XCircleIcon from './icons/XCircleIcon';
import SparklesIcon from './icons/SparklesIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

interface ProblemAccordionItemProps {
  problem: ProblemBreakdown;
  language: Language;
  onHoverError: (error: AIError | null) => void;
  isEditable: boolean;
  onProblemChange: (field: keyof ProblemBreakdown, value: any, subfield?: 'en' | 'he') => void;
  onErrorChange: (errorIndex: number, field: keyof AIError, value: any, subfield?: 'en' | 'he') => void;
  onAddError: () => void;
  onRemoveError: (errorIndex: number) => void;
}

const getGradeColor = (score: number, maxScore = 100) => {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    if (percentage >= 90) return 'text-emerald-500';
    if (percentage >= 75) return 'text-blue-500';
    if (percentage >= 60) return 'text-amber-500';
    return 'text-red-500';
};

const ErrorTypePill: React.FC<{ type: AIError['error_type'], language: Language }> = ({ type, language }) => {
    const styles = {
        minor_slip: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        procedural_error: 'bg-orange-100 text-orange-800 border-orange-300',
        conceptual_error: 'bg-red-100 text-red-800 border-red-300',
    };
    const text = {
        en: { minor_slip: 'Minor Slip', procedural_error: 'Procedural Error', conceptual_error: 'Conceptual Error' },
        he: { minor_slip: 'טעות קלה', procedural_error: 'שגיאה פרוצדורלית', conceptual_error: 'שגיאה מושגית' }
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

const stopPropagation = (e: React.MouseEvent | React.FocusEvent) => e.stopPropagation();

const ProblemAccordionItem: React.FC<ProblemAccordionItemProps> = ({ problem, language, onHoverError, isEditable, onProblemChange, onErrorChange, onAddError, onRemoveError }) => {
    const [isOpen, setIsOpen] = useState(problem.errors.length > 0 || problem.score < problem.max_score);
    const isPerfect = problem.score === problem.max_score;
    const dir = language === 'he' ? 'rtl' : 'ltr';

    const texts = {
        en: { points: "pts", studentFeedback: "Student Feedback:", teacherRecommendation: "Teacher Recommendation:", errorDetails: "Error Details:", hint: "Hint", addError: "Add Error" },
        he: { points: "נק'", studentFeedback: "משוב לתלמיד:", teacherRecommendation: "המלצה למורה:", errorDetails: "פירוט הטעויות:", hint: "רמז", addError: "הוסף שגיאה" }
    };

    return (
        <div className="border border-gray-200 last:border-b-0 bg-white rounded-lg shadow-sm">
            <h2>
                <button
                    type="button"
                    className="flex items-center justify-between w-full p-4 text-left text-gray-800 hover:bg-gray-50 focus:outline-none"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    dir={dir}
                >
                    <div className="flex items-center flex-grow min-w-0">
                         <span className={`w-6 h-6 flex-shrink-0 ${language === 'he' ? 'ml-3' : 'mr-3'} ${isPerfect ? 'text-green-500' : 'text-red-500'}`}>
                            {isPerfect ? <CheckIcon/> : <XCircleIcon/>}
                        </span>
                        {isEditable ? (
                            <input
                                type="text"
                                value={problem.problem_description[language]}
                                onChange={(e) => onProblemChange('problem_description', e.target.value, language)}
                                className="font-semibold bg-transparent border-b w-full"
                                onClick={stopPropagation}
                            />
                        ) : (
                            <span className="font-semibold truncate">{problem.problem_description[language]}</span>
                        )}
                    </div>
                    <div className={`flex items-center flex-shrink-0 ${language === 'he' ? 'mr-2' : 'ml-2'}`}>
                       {isEditable ? (
                            <div className="flex items-center gap-1" onClick={stopPropagation} onFocus={stopPropagation}>
                                <input
                                    type="number"
                                    value={problem.score}
                                    onChange={(e) => onProblemChange('score', parseInt(e.target.value) || 0)}
                                    className="w-14 p-1 text-center font-bold text-lg border rounded-md"
                                />
                                <span className="font-bold text-lg text-gray-400">/</span>
                                <input
                                    type="number"
                                    value={problem.max_score}
                                    onChange={(e) => onProblemChange('max_score', parseInt(e.target.value) || 0)}
                                    className="w-14 p-1 text-center font-bold text-lg border rounded-md"
                                />
                            </div>
                        ) : (
                            <span className={`font-bold text-lg ${getGradeColor(problem.score, problem.max_score)}`}>
                                {problem.score}/{problem.max_score}
                            </span>
                        )}
                        <ChevronDownIcon className={`w-5 h-5 transform transition-transform duration-200 ${language === 'he' ? 'mr-2' : 'ml-2'} ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                </button>
            </h2>
            <div
                className={`transition-[max-height] duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px]' : 'max-h-0'}`}
                onMouseLeave={() => onHoverError(null)}
            >
                <div className="p-4 bg-gray-50/50" dir={dir}>
                    <div className="mb-4">
                        <h4 className="font-semibold mb-1 text-gray-800">{texts[language].studentFeedback}</h4>
                         {isEditable ? (
                            <textarea
                                value={problem.feedback[language]}
                                onChange={(e) => onProblemChange('feedback', e.target.value, language)}
                                className="text-gray-700 w-full p-2 border rounded-md min-h-[80px]"
                                onClick={stopPropagation}
                            />
                        ) : (
                            <p className="text-gray-700">{problem.feedback[language]}</p>
                        )}
                    </div>
                    <div className="mb-4 p-3 bg-primary-50 border-l-4 border-primary-300 rounded">
                        <h4 className="font-semibold mb-1 text-primary-800">{texts[language].teacherRecommendation}</h4>
                         {isEditable ? (
                            <textarea
                                value={problem.teacher_recommendation[language]}
                                onChange={(e) => onProblemChange('teacher_recommendation', e.target.value, language)}
                                className="text-primary-700 w-full p-2 border rounded-md min-h-[80px] bg-primary-50"
                                onClick={stopPropagation}
                            />
                        ) : (
                            <p className="text-primary-700">{problem.teacher_recommendation[language]}</p>
                        )}
                    </div>
                    {problem.errors.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2 text-gray-800">{texts[language].errorDetails}</h4>
                            <ul className="space-y-4">
                                {problem.errors.map((error, errorIndex) => (
                                    <li
                                        key={errorIndex}
                                        className="p-3 -mx-3 rounded-lg hover:bg-red-100/50 cursor-pointer transition-colors duration-150 relative"
                                        onMouseEnter={() => onHoverError(error)}
                                        onClick={stopPropagation}
                                    >
                                        <div className="flex justify-between items-center mb-2">
                                            {isEditable ? (
                                                <select
                                                    value={error.error_type}
                                                    onChange={(e) => onErrorChange(errorIndex, 'error_type', e.target.value)}
                                                    className="px-2 py-1 text-xs font-medium rounded-full border bg-white"
                                                >
                                                    <option value="minor_slip">Minor Slip</option>
                                                    <option value="procedural_error">Procedural Error</option>
                                                    <option value="conceptual_error">Conceptual Error</option>
                                                </select>
                                            ) : (
                                                <ErrorTypePill type={error.error_type} language={language} />
                                            )}
                                            
                                            {isEditable ? (
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="number"
                                                        value={error.deduction}
                                                        onChange={e => onErrorChange(errorIndex, 'deduction', parseInt(e.target.value) || 0)}
                                                        className="w-16 p-1 text-center font-bold text-red-600 border rounded-md"
                                                    />
                                                    <span className="font-semibold text-gray-600">{texts[language].points}</span>
                                                </div>
                                            ) : (
                                                <span className={`font-bold ${error.deduction >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {error.deduction >= 0 ? `-${error.deduction}` : `+${-error.deduction}`} {texts[language].points}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {isEditable ? (
                                            <textarea
                                                value={error.explanation[language]}
                                                onChange={e => onErrorChange(errorIndex, 'explanation', e.target.value, language)}
                                                className="text-gray-600 w-full p-2 border rounded-md text-sm"
                                                placeholder={language === 'en' ? 'Error explanation...' : 'הסבר השגיאה...'}
                                            />
                                        ) : (
                                            <p className="text-gray-600">{error.explanation[language]}</p>
                                        )}

                                        <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-300 rounded">
                                            <div className="flex items-start">
                                                <SparklesIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" style={{ marginRight: language === 'en' ? '0.5rem' : '0', marginLeft: language === 'he' ? '0.5rem' : '0' }} />
                                                <div>
                                                    <h5 className="font-semibold text-sm text-yellow-800">{texts[language].hint}:</h5>
                                                    {isEditable ? (
                                                        <textarea
                                                            value={error.hint[language]}
                                                            onChange={e => onErrorChange(errorIndex, 'hint', e.target.value, language)}
                                                            className="text-yellow-700 w-full p-1 border-none rounded-md text-sm bg-yellow-50 focus:ring-0"
                                                            placeholder={language === 'en' ? 'Actionable hint...' : 'רמז...'}
                                                        />
                                                    ) : (
                                                        <p className="text-sm text-yellow-700">{error.hint[language]}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {isEditable && (
                                            <button
                                                onClick={() => onRemoveError(errorIndex)}
                                                className="absolute top-1 right-1 p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors"
                                                aria-label="Remove error"
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {isEditable && (
                        <div className="mt-4">
                            <button
                                onClick={onAddError}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-100 rounded-md hover:bg-primary-200 transition"
                            >
                                <PlusIcon className="w-4 h-4" />
                                {texts[language].addError}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProblemAccordionItem;