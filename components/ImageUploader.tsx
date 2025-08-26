
import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import type { GradingResponse, ErrorType } from '../types';
import type { Language } from '../App';
import { Spinner } from './Spinner';

interface ImageUploaderProps {
  onFileSelect: (file: File | null) => void;
  imageUrl: string | null;
  onGradeRequest: () => void;
  isLoading: boolean;
  isProcessingFile: boolean;
  hasResult: boolean;
  gradingResult: GradingResponse | null;
  hoveredError: { problemIndex: number, errorIndex: number } | null;
  language: Language;
}

const errorTypeToColor = (type: ErrorType) => {
    switch (type) {
        case 'minor_slip': return 'border-yellow-400';
        case 'procedural_error': return 'border-orange-500';
        case 'conceptual_error': return 'border-red-600';
        default: return 'border-transparent';
    }
}

const errorTypeToBg = (type: ErrorType) => {
    switch (type) {
        case 'minor_slip': return 'bg-yellow-400/30';
        case 'procedural_error': return 'bg-orange-500/30';
        case 'conceptual_error': return 'bg-red-600/30';
        default: return 'bg-transparent';
    }
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, imageUrl, onGradeRequest, isLoading, isProcessingFile, hasResult, gradingResult, hoveredError, language }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        onFileSelect(file);
      } else {
        alert("Please upload an image or PDF file.");
      }
    }
  }, [onFileSelect]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
    e.target.value = '';
  };

  const texts = {
    en: {
        yourSubmission: "Your Submission",
        processingFile: "Processing file...",
        clickToUpload: "Click to upload",
        dragAndDrop: "or drag and drop",
        fileTypes: "PNG, JPG, WEBP, or PDF",
        gradeHomework: "Grade Homework",
        grading: "Grading..."
    },
    he: {
        yourSubmission: "ההגשה שלך",
        processingFile: "מעבד קובץ...",
        clickToUpload: "לחץ להעלאה",
        dragAndDrop: "או גרור ושחרר",
        fileTypes: "PNG, JPG, WEBP, or PDF",
        gradeHomework: "בדוק את שיעורי הבית",
        grading: "בודק..."
    }
  };

  if (imageUrl && hasResult) {
    const allErrors = gradingResult?.problem_breakdown.flatMap((problem, pIndex) => 
        problem.errors.map((error, eIndex) => ({
            ...error,
            problemIndex: pIndex,
            errorIndex: eIndex
        }))
    ) ?? [];

    return (
        <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200 h-full sticky top-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">{texts[language].yourSubmission}</h2>
            <div className="relative w-full overflow-hidden rounded-lg border border-gray-200">
                <img src={imageUrl} alt="Homework submission" className="w-full h-auto block" />
                {allErrors.map((error) => {
                    const isHovered = hoveredError?.problemIndex === error.problemIndex && hoveredError?.errorIndex === error.errorIndex;
                    const borderColor = errorTypeToColor(error.error_type);
                    const bgColor = errorTypeToBg(error.error_type);

                    return (
                        <div
                            key={`${error.problemIndex}-${error.errorIndex}`}
                            className={`absolute rounded-sm transition-all duration-200 ease-in-out pointer-events-none border-2 ${borderColor} ${isHovered ? bgColor : ''}`}
                            style={{
                                left: `${error.boundingBox.x * 100}%`,
                                top: `${error.boundingBox.y * 100}%`,
                                width: `${error.boundingBox.width * 100}%`,
                                height: `${error.boundingBox.height * 100}%`,
                                borderWidth: isHovered ? '3px' : '2px',
                            }}
                        ></div>
                    );
                })}
            </div>
        </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200" dir={language === 'he' ? 'rtl' : 'ltr'}>
      {isProcessingFile ? (
        <div className="flex flex-col items-center justify-center w-full h-64">
          <Spinner />
          <p className="mt-4 text-lg font-semibold text-gray-700">{texts[language].processingFile}</p>
        </div>
      ) : !imageUrl ? (
        <label
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadIcon className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">{texts[language].clickToUpload}</span> {texts[language].dragAndDrop}
            </p>
            <p className="text-xs text-gray-500">{texts[language].fileTypes}</p>
          </div>
          <input id="dropzone-file" type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileChange} />
        </label>
      ) : (
        <div className="text-center">
          <div className="w-full max-h-[60vh] overflow-hidden rounded-lg border border-gray-200 mb-4">
              <img src={imageUrl} alt="Homework preview" className="w-full h-full object-contain" />
          </div>
          <button
            onClick={onGradeRequest}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? texts[language].grading : texts[language].gradeHomework}
          </button>
        </div>
      )}
    </div>
  );
};