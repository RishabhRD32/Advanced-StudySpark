# 🎓 StudySpark - Modern Academic Hub

StudySpark is a high-fidelity, AI-powered academic workspace designed for both students and teachers. It leverages state-of-the-art Cloud AI and Local Neural Engines to streamline note-taking, study planning, and classroom management.

---

## 🚀 Key Features

### 🎓 For Students
- **AI Tutor**: Get instant, grounded explanations based on your own study materials using Cloud or Local hardware.
- **My Schedule**: A personal space to manage study blocks, theory exams, and practical evaluations.
- **Focus Studio**: A "Zen Mode" study timer with ambient sounds and session logging to track study intensity.
- **Teacher Vault**: Access broadcasted materials and resources shared by your faculty via institutional Class Codes.
- **GPA Tracking**: A weighted credit calculator to estimate and track your cumulative academic performance.
- **Public Library**: A global community archive where you can search and share notes with learners worldwide.
- **Global News**: Stay updated with real-time academic and scientific feeds from BBC and New Scientist.

### 🏫 For Teachers
- **Announcement Hub**: Broadcast urgent updates and campus news directly to linked student dashboards.
- **Class Roster**: Manage and view all students linked to your institutional Class Code in a unified list.
- **Smart Scheduler**: An algorithmic conflict-free tool to generate optimized weekly schedules based on teacher quotas.
- **Lesson Planner**: Design professional, timed pedagogical blueprints and learning objectives in seconds.
- **Faculty Chat**: Manage direct student queries and academic communication in a private, encrypted environment.

### 🤖 AI & Logic Tool Suite
- **Natural Writer**: Make AI-generated text sound more human and engaging.
- **Summarizer**: Distill large pieces of text into key academic takeaways.
- **Memory Tricks**: Turn complex terms into catchy recall hacks (Acronyms, Rhymes, Stories).
- **Memory Fill**: Test your knowledge by filling in the gaps of your own notes (Algorithmic Logic).
- **Unit Converter**: High-precision conversion for scientific metrics and numeral systems.
- **Practice Quiz**: Generate multiple-choice exams from any text source.
- **Outline Maker**: Create professional presentation outlines from any study topic.

---

## 🛠️ Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/)
- **Backend**: [Firebase](https://firebase.google.com/) (Auth, Firestore)
- **AI Engine**: [Genkit](https://firebase.google.com/docs/genkit) (Gemini) & [WebLLM](https://webllm.mlc.ai/) (Local GPU Inference)
- **Visuals**: Lucide React, Recharts (Analytics), Framer Motion / CSS-3D

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- **Node.js**: version 18.x or later.
- **Browser**: Modern browser with WebGPU support (Chrome/Edge) for Local AI features.

### 2. Environment Variables
Create a `.env` file in the root directory and populate it with your Firebase and GenAI credentials:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Generative AI Configuration
GOOGLE_GENAI_API_KEY=your_gemini_api_key
OPENAI_API_KEY= your_openai_api
GROQ_API_KEY=your_groq_api 
MISTRAL_API_KEY=your_mistral_api
CEREBRAS_API_KEY=your_cerebras_api
COHERE_API_KEY=your_cohere_api
```

### 3. Run Commands

**Install Dependencies:**
```bash
npm install
```

**Run Development Server:**
```bash
npm run dev
```
*Access the app at `http://localhost:9002`*

**Build for Production:**
```bash
npm run build
npm start
```

---

## 🛡️ Security & Privacy
StudySpark uses a **CC Code (Class Code)** validation system:
- **Privacy**: Personal subjects, tasks, and to-do lists are strictly private to the owner.
- **Collaboration**: Teachers sharing a Class Code can view a shared student roster and manage a collective announcement feed.
- **Hardware Autonomy**: The "Offline Mode" runs AI models directly on your device hardware, ensuring 100% data privacy for sensitive study material.

---
© 2026 StudySpark. Designed for efficiency and academic excellence.