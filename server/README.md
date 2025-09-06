# AI Math Grader Backend

This directory contains a simple Node.js and Express backend to provide API endpoints and data persistence for the AI Math Grader application.

## Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or later recommended)

## Setup and Running

1.  **Navigate to the `server` directory:**
    ```bash
    cd server
    ```

2.  **Install Native Dependencies (IMPORTANT):**
    This server uses the `canvas` package for processing PDF files, which has native dependencies that must be compiled. You **must** install the necessary build tools for your operating system **before** running `npm install`.

    ### For Windows:
    The recommended way is to install Microsoft's C++ build tools.
    1.  **Install Visual Studio Build Tools**: Download the installer from the [Visual Studio website](https://visualstudio.microsoft.com/visual-cpp-build-tools/).
    2.  Run the installer and select the "**Desktop development with C++**" workload.
    3.  **Install Python**: Install a recent version of Python from the [official website](https://www.python.org/downloads/) or the Microsoft Store.
    4.  Open PowerShell or Command Prompt **as an Administrator** and run the following commands to configure npm:
        ```bash
        npm config set msvs_version 2022
        ```

    ### For macOS:
    Use [Homebrew](https://brew.sh/) to install the required libraries.
    ```bash
    brew install pkg-config cairo pango libpng jpeg giflib librsvg
    ```

    ### For Linux (Debian/Ubuntu):
    Use `apt-get` to install the required libraries.
    ```bash
    sudo apt-get update
    sudo apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
    ```

3.  **Install Node.js dependencies:**
    Once the native build tools are installed, run:
    ```bash
    npm install
    ```

4.  **Start the server:**
    ```bash
    npm start
    ```

The server will start on `http://localhost:3001`. The frontend application is configured to communicate with this server.

## Data Storage

The server uses a simple `db.json` file to store all application data. This file is created automatically if it doesn't exist. All data for classrooms, assignments, and submissions is persisted in this file.

## API Endpoints

You can use a tool like Postman to interact with these endpoints directly for testing purposes. See the `POSTMAN_GUIDE.md` for detailed instructions.

- `GET /api/classrooms`: Retrieve all classrooms.
- `POST /api/classrooms`: Create a new classroom.
- `POST /api/classrooms/join`: Join a student to a classroom.
- `POST /api/classrooms/:classroomId/assignments`: Create a new assignment.
- `POST /api/classrooms/:classroomId/assignments/:assignmentId/submissions`: Create or update a student's submission (from frontend).
- `PUT /api/classrooms/:classroomId/assignments/:assignmentId/submissions/:submissionId`: Add or update an evaluation for a submission.
- `POST /api/evaluate`: Send a base64 encoded image to get an AI evaluation.
- `POST /api/test-evaluation`: Upload a PDF file directly to get an AI evaluation (for testing).