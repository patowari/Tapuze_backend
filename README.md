# 🤖 AI Math Homework Grader

An intelligent web application that uses the Google Gemini API to automatically grade handwritten Hebrew math homework. Users can upload an image or a PDF of their work and receive a detailed, problem-by-problem analysis with error highlighting and constructive feedback.

![AI Math Homework Grader Screenshot](https://storage.googleapis.com/genai-assets/readme/math-grader-demo.png)

---

## ✨ Features

-   **Multi-Format Upload**: Accepts common image formats (PNG, JPG, WEBP) and single-page PDFs.
-   **Client-Side PDF Processing**: PDFs are rendered into images directly in the browser using `pdf.js`.
-   **AI-Powered Analysis**: Leverages the powerful multi-modal capabilities of **Google's Gemini 2.5 Flash** model to understand and grade the homework.
-   **Detailed Scoring**: Provides an overall score and a breakdown for each individual problem.
-   **Interactive Error Highlighting**: Visually connects feedback to the specific location of the error on the student's work. Hovering over an error in the report highlights the corresponding bounding box on the image.
-   **Categorized Feedback**: Classifies mistakes into `minor_slip`, `procedural_error`, or `conceptual_error`, each with a clear explanation in Hebrew.
-   **Structured JSON Output**: Uses Gemini's `responseSchema` to ensure reliable, structured, and easy-to-parse data from the API.
-   **Responsive Design**: A clean, modern UI built with Tailwind CSS that works beautifully on all screen sizes.
-   **Drag & Drop**: User-friendly drag-and-drop interface for file uploads.

---

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript
-   **AI**: Google Gemini API (`@google/genai`)
-   **Styling**: Tailwind CSS
-   **PDF Handling**: `pdfjs-dist`
-   **Module Loading**: ES Modules with an Import Map (no build step needed)

---

## 🚀 How It Works

The magic of this application lies in its clever use of the Gemini API's multi-modal and structured data features.

1.  **File Upload & Preparation**: The user uploads a file. If it's a PDF, `pdf.js` renders the first page onto an HTML `<canvas>` element on the client side. This canvas is then converted into a JPEG image data URL.
2.  **API Request**: The image is converted to a base64 string and sent to the Gemini API as an `inlineData` part.
3.  **Advanced Prompt Engineering**: A highly detailed **system prompt** (`GRADING_PROMPT`) is sent along with the image. This prompt acts as the AI's "brain," instructing it to:
    -   Act as an expert math teacher's assistant.
    -   Use a specific grading rubric (minor, procedural, conceptual errors).
    -   Provide all textual feedback in Hebrew.
    -   Return its analysis in a strictly defined JSON structure.
4.  **Enforced JSON Schema**: To guarantee a predictable response, the API call includes a `responseSchema`. This schema forces the AI's output to conform to the `GradingResponse` TypeScript type, eliminating the need for fragile string parsing and making the integration robust.
5.  **Dynamic Rendering**: The frontend receives the structured JSON data. It then uses React to dynamically render the results, including the overall score, the accordion for each problem, and the interactive bounding boxes that highlight errors on the original image.

---

## ⚙️ Local Development Setup

This project uses a modern, build-free setup with ES Modules and an import map.

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/patowari/hebrew-math-grader.git
    cd ai-math-grader
    ```

2.  **Set Up API Key**
    This project requires a Google Gemini API key. You must have it available as an environment variable. Since this is a client-side only project, you'll need a local development server that can inject this variable or a way to provide it to the browser context.

    For a quick start, you can temporarily hardcode it in `index.html` for local testing (NOT recommended for production). A better approach is using a simple server that can manage this.

3.  **Run a Local Server**
    You need a simple HTTP server to serve the files. The popular `serve` package is a great option.

    ```bash
    # Install serve globally if you don't have it
    npm install -g serve

    # Run the server from the project's root directory
    serve .
    ```
    Your application will be running at a local URL, typically `http://localhost:5173`.

4.  **Provide the API Key**
    The code expects `process.env.API_KEY`. When running a simple static server, `process.env` will not be defined. The easiest way to test is to create a `.env` file in the root:
    
    `.env`
    ```
    API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```
    
    *Note: A real production deployment would use a secure method to provide this key, often through a backend or a hosting provider's environment variable settings.*

