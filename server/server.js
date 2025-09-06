require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const { gradeHomework } = require('./geminiService');
const { convertPdfToImage } = require('./pdfConverter');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images

// Multer setup for file uploads in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Helper functions for DB operations
const readDB = () => {
    try {
        if (!fs.existsSync(DB_PATH)) {
            // If db.json doesn't exist, create it with an empty structure
            fs.writeFileSync(DB_PATH, JSON.stringify({ classrooms: [] }, null, 2));
        }
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading database:', error);
        // Return a default structure if reading fails
        return { classrooms: [] };
    }
};

const writeDB = (data) => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing to database:', error);
    }
};

// --- API Routes ---

// POST to test PDF to Image conversion (for Postman debugging)
app.post('/api/test-pdf-conversion', upload.single('homeworkPdf'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No PDF file uploaded. Please upload a file with the key "homeworkPdf".' });
    }

    try {
        // Convert the PDF buffer to a base64 image string
        const imageBase64 = await convertPdfToImage(req.file.buffer);
        
        res.status(200).json({
            fileName: req.file.originalname,
            fileData: imageBase64,
        });
    } catch (error) {
        console.error('PDF Conversion Test Error:', error);
        res.status(500).json({ message: error.message || 'An error occurred during PDF conversion.' });
    }
});

// POST to test AI evaluation directly from a PDF file upload (for Postman)
app.post('/api/test-evaluation', upload.single('homeworkPdf'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No PDF file uploaded. Please upload a file with the key "homeworkPdf".' });
    }

    try {
        // Convert the PDF buffer to a base64 image string
        const imageBase64 = await convertPdfToImage(req.file.buffer);
        
        // Send the image to the AI for grading
        const evaluation = await gradeHomework(imageBase64);
        
        res.status(200).json(evaluation);
    } catch (error) {
        console.error('PDF Evaluation Error:', error);
        res.status(500).json({ message: error.message || 'An error occurred during PDF processing or AI evaluation.' });
    }
});


// POST simulate AI evaluation from a base64 image (used by frontend)
app.post('/api/evaluate', async (req, res) => {
    const { fileData } = req.body;
    if (!fileData) {
        return res.status(400).json({ message: 'fileData (base64 string) is required.' });
    }
    try {
        const evaluation = await gradeHomework(fileData);
        res.status(200).json(evaluation);
    } catch (error) {
        console.error('AI Evaluation Error:', error);
        res.status(500).json({ message: error.message || 'An error occurred during AI evaluation.' });
    }
});

// GET all classrooms
app.get('/api/classrooms', (req, res) => {
    const db = readDB();
    res.json(db.classrooms);
});

// POST create a new classroom
app.post('/api/classrooms', (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ message: 'Classroom name is required.' });
    }
    const db = readDB();
    const newClassroom = {
        id: uuidv4(),
        name,
        teacherId: 'teacher-01', // mock teacher id
        secretCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        assignments: [],
        studentIds: []
    };
    db.classrooms.push(newClassroom);
    writeDB(db);
    res.status(201).json(newClassroom);
});

// POST join a classroom
app.post('/api/classrooms/join', (req, res) => {
    const { secretCode, studentId } = req.body;
    if (!secretCode || !studentId) {
        return res.status(400).json({ message: 'Secret code and student ID are required.' });
    }
    const db = readDB();
    const classroomToJoin = db.classrooms.find(c => c.secretCode === secretCode.toUpperCase());

    if (!classroomToJoin) {
        return res.status(404).json({ message: 'Invalid classroom code. Please try again.' });
    }
    if (classroomToJoin.studentIds.includes(studentId)) {
        return res.status(409).json({ message: 'You are already in this classroom.' });
    }

    classroomToJoin.studentIds.push(studentId);
    writeDB(db);
    res.status(200).json(classroomToJoin);
});

// POST create an assignment
app.post('/api/classrooms/:classroomId/assignments', (req, res) => {
    const { classroomId } = req.params;
    const { title } = req.body;
    if (!title) {
        return res.status(400).json({ message: 'Assignment title is required.' });
    }
    const db = readDB();
    const classroom = db.classrooms.find(c => c.id === classroomId);
    if (!classroom) {
        return res.status(404).json({ message: 'Classroom not found.' });
    }
    const newAssignment = {
        id: uuidv4(),
        title,
        createdAt: new Date().toISOString(),
        submissions: [],
    };
    classroom.assignments.push(newAssignment);
    writeDB(db);
    res.status(201).json(newAssignment);
});

// POST submit an assignment
app.post('/api/classrooms/:classroomId/assignments/:assignmentId/submissions', (req, res) => {
    const { classroomId, assignmentId } = req.params;
    const { studentId, fileData, fileName } = req.body;

    const db = readDB();
    const classroom = db.classrooms.find(c => c.id === classroomId);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found.' });
    const assignment = classroom.assignments.find(a => a.id === assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });

    // Remove existing submission for the same student, if any
    assignment.submissions = assignment.submissions.filter(s => s.studentId !== studentId);

    const newSubmission = {
        id: uuidv4(),
        studentId,
        fileData,
        fileName,
        submittedAt: new Date().toISOString(),
        evaluation: null,
        isGraded: false,
    };
    assignment.submissions.push(newSubmission);
    writeDB(db);
    res.status(201).json(newSubmission);
});

// PUT update a submission (grade it)
app.put('/api/classrooms/:classroomId/assignments/:assignmentId/submissions/:submissionId', (req, res) => {
    const { classroomId, assignmentId, submissionId } = req.params;
    const { evaluation } = req.body;

    const db = readDB();
    const classroom = db.classrooms.find(c => c.id === classroomId);
    if (!classroom) return res.status(404).json({ message: 'Classroom not found.' });
    const assignment = classroom.assignments.find(a => a.id === assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found.' });
    const submission = assignment.submissions.find(s => s.id === submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found.' });

    submission.evaluation = evaluation;
    submission.isGraded = true;
    writeDB(db);
    res.status(200).json(submission);
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
