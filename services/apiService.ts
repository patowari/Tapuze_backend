import { Classroom, Assignment, Submission, GradingResponse } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';
const STUDENT_ID = 'student-01'; // Mock student ID, should be managed in a real auth system

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const getClassrooms = async (): Promise<Classroom[]> => {
    const response = await fetch(`${API_BASE_URL}/classrooms`);
    return handleResponse(response);
};

export const createClassroom = async (name: string): Promise<Classroom> => {
    const response = await fetch(`${API_BASE_URL}/classrooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
    });
    return handleResponse(response);
};

export const joinClassroom = async (secretCode: string): Promise<Classroom> => {
    const response = await fetch(`${API_BASE_URL}/classrooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretCode, studentId: STUDENT_ID }),
    });
    return handleResponse(response);
};

export const createAssignment = async (classroomId: string, title: string): Promise<Assignment> => {
     const response = await fetch(`${API_BASE_URL}/classrooms/${classroomId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
    });
    return handleResponse(response);
};

export const submitAssignment = async (classroomId: string, assignmentId: string, fileData: string, fileName: string): Promise<Submission> => {
    const response = await fetch(`${API_BASE_URL}/classrooms/${classroomId}/assignments/${assignmentId}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: STUDENT_ID, fileData, fileName }),
    });
    return handleResponse(response);
};

export const updateSubmissionEvaluation = async (classroomId: string, assignmentId: string, submissionId: string, evaluation: GradingResponse): Promise<Submission> => {
    const response = await fetch(`${API_BASE_URL}/classrooms/${classroomId}/assignments/${assignmentId}/submissions/${submissionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ evaluation }),
    });
    return handleResponse(response);
};

export const gradeHomeworkWithAI = async (fileData: string): Promise<GradingResponse> => {
    const response = await fetch(`${API_BASE_URL}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileData }),
    });
    return handleResponse(response);
};