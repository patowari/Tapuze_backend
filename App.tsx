
import React, { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { gradeHomework } from './services/geminiService';
import type { GradingResponse } from './types';
import { ImageUploader } from './components/ImageUploader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Spinner } from './components/Spinner';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@5.4.54/build/pdf.worker.mjs`;

export type Language = 'en' | 'he';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [gradingResult, setGradingResult] = useState<GradingResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hoveredError, setHoveredError] = useState<{ problemIndex: number; errorIndex: number; } | null>(null);
  const [language, setLanguage] = useState<Language>('he');

  const handleFileSelect = useCallback(async (file: File | null) => {
    if (!file) return;

    setImageFile(file);
    setImageUrl(null);
    setGradingResult(null);
    setError(null);
    setIsProcessingFile(true);

    try {
      if (file.type.startsWith('image/')) {
        setImageUrl(URL.createObjectURL(file));
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) {
          throw new Error('Could not get canvas context');
        }
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext as any).promise;
        setImageUrl(canvas.toDataURL('image/jpeg'));
      } else {
        throw new Error('Unsupported file type. Please upload an image or a PDF.');
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(`Failed to process file: ${message}`);
      setImageFile(null);
    } finally {
      setIsProcessingFile(false);
    }
  }, []);

  const handleGradeRequest = useCallback(async () => {
    if (!imageFile) return;
    setIsLoading(true);
    setError(null);
    setGradingResult(null);
    try {
      const result = await gradeHomework(imageFile);
      setGradingResult(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [imageFile]);

  const handleReset = () => {
    setImageFile(null);
    setImageUrl(null);
    setGradingResult(null);
    setError(null);
    setIsLoading(false);
    setIsProcessingFile(false);
    setHoveredError(null);
  };

  const handleHoverError = useCallback((problemIndex: number | null, errorIndex: number | null) => {
    if (problemIndex === null || errorIndex === null) {
      setHoveredError(null);
    } else {
      setHoveredError({ problemIndex, errorIndex });
    }
  }, []);

  const appTexts = {
    en: {
      title: "AI Math Homework Grader",
      subtitle: "Upload your handwritten math homework for an AI-powered analysis.",
      errorTitle: "Oops! Something went wrong.",
      loadingText: "The AI is analyzing your work...",
      footer: "Powered by Gemini API. Grades and feedback are AI-generated and should be used as a study aid."
    },
    he: {
      title: "בודק שיעורי בית במתמטיקה מבוסס AI",
      subtitle: "העלו את שיעורי הבית שלכם במתמטיקה בכתב יד לקבלת ניתוח מבוסס בינה מלאכותית.",
      errorTitle: "אופס! משהו השתבש.",
      loadingText: "הבינה המלאכותית מנתחת את עבודתך...",
      footer: "מופעל באמצעות Gemini API. הציונים והמשוב נוצרו על ידי בינה מלאכותית ויש להשתמש בהם ככלי עזר ללמידה."
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">{appTexts[language].title}</h1>
              <p className="mt-2 text-lg text-gray-600" dir={language === 'he' ? 'rtl' : 'ltr'}>
                {appTexts[language].subtitle}
              </p>
            </div>
            <div className="flex-1 flex justify-end">
                <div className="flex items-center rounded-lg p-1 bg-gray-200">
                    <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>English</button>
                    <button onClick={() => setLanguage('he')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${language === 'he' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}>עברית</button>
                </div>
            </div>
          </div>
        </header>

        <main>
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-md" role="alert" dir={language === 'he' ? 'rtl' : 'ltr'}>
              <p className="font-bold">{appTexts[language].errorTitle}</p>
              <p>{error}</p>
            </div>
          )}

          <div className={`transition-all duration-500 ${gradingResult ? 'grid lg:grid-cols-2 gap-8 items-start' : ''}`}>
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-10">
                  <Spinner />
                  <p className="mt-4 text-lg font-semibold text-gray-700">{appTexts[language].loadingText}</p>
                </div>
              )}
              <ImageUploader 
                onFileSelect={handleFileSelect} 
                imageUrl={imageUrl}
                onGradeRequest={handleGradeRequest}
                isLoading={isLoading}
                isProcessingFile={isProcessingFile}
                hasResult={!!gradingResult}
                gradingResult={gradingResult}
                hoveredError={hoveredError}
                language={language}
              />
            </div>

            {gradingResult && (
              <div className="mt-8 lg:mt-0">
                <ResultsDisplay 
                  result={gradingResult} 
                  onReset={handleReset} 
                  onHoverError={handleHoverError}
                  language={language}
                />
              </div>
            )}
          </div>
        </main>

        <footer className="text-center mt-12 text-gray-500 text-sm">
            <p>{appTexts[language].footer}</p>
        </footer>
      </div>
    </div>
  );
};

export default App;