Advanced StudySpark - Modern Academic Hub

StudySpark is a comprehensive, AI-powered academic workspace designed for both students and teachers. It leverages state-of-the-art AI to streamline note-taking, study planning, and classroom management.

## 🚀 Key Features

### 🎓 For Students
- **AI Tutor**: Get instant, ground explanations based on your own study materials.
- **My Schedule**: A personal space to manage study blocks and theory/practical exams.
- **Study Planner**: Automatically generate balanced weekly plans based on subject priority.
- **Teacher Vault**: Access broadcasted materials and resources shared by your faculty via Class Codes.
- **AI Tool Suite**: Includes a MultiLingual Dictionary, Mnemonic Maker, Problem Solver, and Portfolio Builder.

### 🏫 For Teachers
- **Announcement Hub**: Broadcast urgent updates and campus news directly to student dashboards.
- **Class Roster**: Manage and view all students linked to your institutional Class Code.
- **Timetable Generator**: AI-driven tool to create optimized weekly schedules for your curriculum.
- **Lesson Planner**: Design professional, timed pedagogical blueprints in seconds.

## 🛠️ Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **UI & Styling**: [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [ShadCN UI](https://ui.shadcn.com/)
- **Backend**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **AI Engine**: [Genkit](https://firebase.google.com/docs/genkit) powered by Google Gemini Models
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js 18.x or later
- A Firebase Project
- A Google AI (Gemini), OpenAI, Cohere, Mistral, Groq, Cerebras AI API Key

### 2. Environment Variables
Create a `.env` file in the root directory and populate it with your credentials:

```env
# Firebase Configuration (Get these from your Firebase Console)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI Configuration (Gemini)
GOOGLE_GENAI_API_KEY=your_gemini_api_key
OPENAI_API_KEY= your_openai_api
GROQ_API_KEY=your_groq_api 
MISTRAL_API_KEY=your_mistral_api
CEREBRAS_API_KEY=your_cerebras_api
COHERE_API_KEY=your_cohere_api
```

### 3. Commands

**Install Dependencies:**
```bash
npm install
```

**Run Development Server:**
```bash
npm run dev
```
*Access the app at `http://localhost:9002`*

**Start Genkit Developer UI:**
```bash
npm run genkit:dev
```
*Use this to test and debug AI flows independently.*

## 📂 Project Architecture
- `src/app`: Next.js App Router structure (Pages, Layouts, Globals).
- `src/ai/flows`: Definitions for all AI agents (Tutor, Humanizer, etc.).
- `src/components/ui`: ShadCN UI component library.
- `src/hooks/use-firestore.ts`: Unified data fetching layer with real-time listeners.
- `src/lib/auth`: Firebase Authentication context and provider.
- `firestore.rules`: Security configuration for role-based data access.

## 🛡️ Security Model
StudySpark uses a **CC Code (Class Code)** validation system:
- **Privacy**: Personal subjects, tasks, and to-do lists are only visible to the owner.
- **Sharing**: Teachers can mark materials or schedules as `isBroadcast` or `isShared`. These become visible to students who have entered the matching Class Code in their profile.
- **Public**: The Library allows global searching of any materials explicitly marked as `isPublic` by their creators.

---
© 2026 StudySpark. All rights reserved. Designed for efficiency and academic excellence.
