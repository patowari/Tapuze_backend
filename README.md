# AI Math Homework Grader

This is a full-stack web application designed to streamline the process of grading handwritten math homework. Teachers can create virtual classrooms, issue assignments, and leverage the power of Google's Gemini AI for detailed, automated grading assistance. Students can join classrooms and submit their homework as PDF files.

The application is built with a React frontend and a Node.js/Express backend, providing a robust and interactive user experience.

## Key Features

- **Dual User Roles**: Separate dashboards and functionalities for Teachers and Students.
- **Classroom Management**: Teachers can create classrooms, each with a unique, shareable secret code.
- **Assignment Creation**: Teachers can create assignments within their classrooms.
- **Student Enrollment**: Students can easily join classrooms using the secret code.
- **PDF Homework Submission**: Students can upload their homework as multi-page PDF files, which are automatically converted into a single image for grading.
- **AI-Powered Evaluation**: Teachers can use the Gemini AI to analyze a student's submission. The AI provides:
    - An overall score.
    - A detailed, problem-by-problem breakdown.
    - Identification and categorization of errors (minor slips, procedural, conceptual).
    - Constructive, bilingual (English & Hebrew) feedback for both the student and the teacher.
    - Bounding boxes that visually pinpoint errors on the submission image.
- **Manual Grading & Overrides**: The AI's evaluation is a suggestion. Teachers have full control to manually edit scores, feedback, and error details before submitting the final grade.
- **Persistent Data**: A Node.js backend stores all classroom, assignment, and submission data in a local `db.json` file.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **AI**: Google Gemini API (`gemini-2.5-flash`)
- **PDF Processing**: `pdf.js` library

## Project Structure

```
.
├── server/                 # Node.js Backend
│   ├── .env                # Server environment variables (for API Key)
│   ├── node_modules/
│   ├── db.json             # Local JSON database file
│   ├── package.json
│   ├── README.md           # Backend-specific instructions
│   ├── server.js           # Express server logic
│   └── geminiService.js    # Service for Gemini API calls
├── src/                    # React Frontend
│   ├── components/         # React components
│   ├── services/           # API service client
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main application component
│   └── index.tsx           # Entry point
├── index.html
├── metadata.json
├── README.md               # This file
└── POSTMAN_GUIDE.md        # Guide for API testing
```

---

## Setup and Running the Application

To run this project, you need to have both the backend server and the frontend application running.

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- An active **Google Gemini API Key**. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### 1. Backend Setup

The backend server handles data persistence and all communication with the Gemini AI.

1.  **Navigate to the server directory:**
    ```bash
    cd server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Create an environment file:** In the `server` directory, create a new file named `.env`.

4.  **Add your API key to the `server/.env` file:**
    ```
    API_KEY=your_gemini_api_key_here
    ```
    Replace `your_gemini_api_key_here` with your actual Gemini API key.

5.  **Start the server:**
    ```bash
    npm start
    ```
    The server will now be running on `http://localhost:3001`. Keep this terminal window open.

### 2. Frontend Setup

The frontend is a static application that communicates with your local backend server.

1.  **Run the frontend:** Open the `index.html` file in your web browser from the project's root directory. Using a live server extension in your code editor is recommended for the best experience.

You can now use the application.

---

## How to Use the Application

1.  **Login**: Open the application and choose either the "Teacher" or "Student" role.
2.  **Teacher Workflow**:
    - Create a new classroom.
    - Share the generated "Secret Code" with your students.
    - Create assignments within your classroom.
    - When students submit their work, you will see the submissions appear.
    - Click "Evaluate" on a submission. You can then use the "Evaluate with AI" button to get a suggested grade or grade it manually.
    - Review and edit the AI's feedback, scores, and error analysis as needed.
    - Click "Save & Submit to Student" to finalize the grade.
3.  **Student Workflow**:
    - Use the "Join a Classroom" form and enter the secret code provided by your teacher.
    - Once in a classroom, you will see a list of assignments.
    - Click "Upload Homework (PDF)" for an assignment and select your multi-page PDF file.
    - After your teacher grades your work, you can click "View Grade & Feedback" to see your results.

## API Testing

For detailed instructions on how to test the backend API endpoints using a tool like Postman, please see the [**POSTMAN_GUIDE.md**](./POSTMAN_GUIDE.md) file.