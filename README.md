<div align="center">

# 🌉 SkillBridge
### Youth Employability & AI Skill-Gap Analysis Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-brightgreen.svg)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-orange.svg)](https://ai.google.dev/)

*An AI-driven platform addressing youth unemployment and graduate underemployment by diagnosing skill gaps against real job postings, generating custom learning paths based on premier university curricula (Stanford CS224N & MIT OCW), and providing AI-evaluated interview preparation.*

</div>

---

## 📌 1. Problem Statement

Across higher education institutions globally, millions of students graduate with formal diplomas and academic degrees yet struggle to secure meaningful employment. This is known as the **Graduate Employability Paradox**:

1. **Qualification ≠ Industry Readiness**: Traditional university curricula lag behind rapid industry transformations (modern cloud infrastructure, large language models, asynchronous runtimes, containerization).
2. **Opaque Job Requirements**: Job postings list dozens of tools and buzzwords without clarifying which are core competencies versus nice-to-haves, leaving students confused about what to study.
3. **No Closed Feedback Loop**: When a student gets rejected or lacks interview readiness, there is zero diagnosis explaining *which* skill was missing, *why* it mattered, or *how* to bridge it.
4. **Passive Learning Overload**: Generic MOOC catalogs present hundreds of disjointed video hours rather than precise, goal-oriented skill bridges aligned with specific job openings.

---

## 💡 2. What SkillBridge Solves

**SkillBridge** acts as the dynamic interface between students, academic institutions, and employers. It automates skill gap identification, provides tailored learning trajectories, and evaluates candidate competencies:

* **Automated Skill-Gap Diagnosis**: Analyzes a candidate’s current skill inventory (e.g., `React`, `JavaScript`, `MongoDB`) against specific industry job profiles or benchmark role models (e.g., `Full Stack Developer`, `AI/ML Engineer`), pinpointing missing bridges (e.g., `Node.js`, `Express`, `Docker`).
* **Live Job-Skill Matching**: Calculates algorithmic compatibility scores (`0% - 100%`) for active openings, categorizing matched vs. missing skills so candidates know exactly where they stand before applying.
* **Stanford CS224N Academic Curriculum**: Integrates a full 15-lecture, 5-module curriculum based on **Stanford University's CS224N** (*Natural Language Processing with Deep Learning*), complete with video lectures from Stanford Online & MIT OCW, foundational research paper readings, and PyTorch coding assignments.
* **Interactive 92-Question Interview Arena**: Prepares candidates across 3 tracks (*Model Foundations*, *Inference & Optimization*, *Prompt Engineering*) with:
  - **Conceptual Questions** with direct input boxes evaluated in real time by **Google Gemini 2.5 Flash / Flash-Lite**.
  - **MCQ Benchmarks** with instant scoring and mathematical explanations.
  - **In-Browser JavaScript Code Sandboxes** executed against automated test assertions.
* **ATS Resume Builder & AI Audit**: Offers an interactive builder for clean ATS-friendly resumes and an automated parser that grades keyword relevance, structural completeness, and role alignment.
* **1-Click Application Tracking**: Complete application management workflow with transparent hiring status milestones (*Submitted* ➔ *Under Review* ➔ *Interview Scheduled* ➔ *Offered*).

---

## 👥 3. Target Stakeholders

| Stakeholder | Key Value Proposition |
| :--- | :--- |
| **Students & Graduates** | Clear roadmap from graduation to employment; personalized course recommendations; practice with 92 AI-graded interview questions; instant compatibility feedback on applications. |
| **Recruiters & Companies** | Access pre-vetted candidates with verified assessment badges; post openings with custom skill criteria; manage candidate pipelines with automated match scoring. |
| **Academic Institutions & Career Cells** | Visibility into student skill distributions; identify department-wide curricular blind spots based on real-time hiring demand analytics. |
| **Industry Mentors** | Direct 1-on-1 connection with aspiring engineers based on tech stack relevance; structured guidance on candidate portfolios and career trajectories. |

---

## 🎨 4. Design & UI Aesthetics

SkillBridge features a matte dark dashboard aesthetic (`#0e1013`, `#15181e`, `#1b1e25`) inspired by modern developer productivity environments, with an instant toggle for clean light mode:
* **Interactive Architecture Visualizers**:
  - **Tokenization**: Interactive frequency bar charts comparing token distributions across vocabularies (GPT vs. Llama).
  - **Embeddings**: 2D PCA vector projections demonstrating semantic clustering.
  - **Attention**: Scaled dot-product self-attention multi-head arc visualizations.
* **Adaptive Theme Support**: Seamless light/dark mode switcher with persistent preference.
* **Dock Navigation**: Minimalist icon dock with quick tooltips and role indicator pills.

---

## 🏗️ 5. System Architecture & Tech Stack

```
skill_bridge/
├── client/                     # React 18 Single Page Application
│   ├── src/
│   │   ├── components/         # Dashboard, CS224N Course, Jobs, Assessments, Resume, Mentors
│   │   ├── context/            # AuthContext (JWT) & ThemeContext (Dark/Light)
│   │   ├── data/               # 92 Interview Questions, CS224N Syllabus, Video Mappings
│   │   └── App.jsx             # Main Router & View Orchestrator
│   └── vite.config.js          # Vite config with backend API proxy
├── server/                     # Node.js & Express REST API
│   ├── src/
│   │   ├── config/             # MongoDB Mongoose Connection
│   │   ├── middleware/         # JWT Bearer Authentication & Role-based Guards
│   │   ├── models/             # User, Job, Application, Course, Mentor, Assessment
│   │   ├── routes/             # Auth, Jobs, Applications, Interview, AI Evaluation
│   │   ├── services/           # AI Skill-Gap Engine & Resume Parser
│   │   └── seed.js             # Seed script for initial students, jobs & assessments
└── README.md
```

### Technology Matrix
- **Frontend**: React 18, Vite 5, TailwindCSS 3.4, Lucide Icons
- **Backend**: Node.js, Express 4, JWT (`jsonwebtoken`), `bcryptjs`, CORS
- **Database**: MongoDB 7.0 via Mongoose 8
- **AI Integration**: Google Gemini 2.5 Flash / Flash-Lite API (with heuristic fallback)
- **Video Learning**: Stanford Online (CS224N) & MIT OpenCourseWare (6.S191)

---

## ⚡ 6. How to Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally on port `27017` or via Docker)
- [Git](https://git-scm.com/)

### Step 1: Clone the Repository
```bash
git clone https://github.com/kshrs/skill_bridge.git
cd skill_bridge
```

### Step 2: Start MongoDB
If using Docker:
```bash
docker run -d --name skillbridge-mongo -p 27017:27017 mongo:latest
```
*Or ensure your local MongoDB service is running:*
```bash
sudo systemctl start mongod
```

### Step 3: Configure Environment Variables
Inside `server/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillbridge
JWT_SECRET=skillbridge_super_secret_jwt_key_2026
NODE_ENV=development
# Optional: GEMINI_API_KEY=AIzaSy... (Can also be set directly in the User Profile tab)
```

### Step 4: Install Dependencies & Seed Sample Data
```bash
# 1. Setup Backend
cd server
npm install
npm run seed     # Seeds demo student (Aditya), admin, job openings, and mentors

# 2. Setup Frontend
cd ../client
npm install
```

### Step 5: Start the Development Servers
In separate terminal tabs:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# Client runs on http://localhost:5173
```

Open your browser at **`http://localhost:5173`**.

---

## 🔑 7. Demo Accounts & Testing

The login modal contains **One-Click Quick Login** buttons:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **Demo Student** | `aditya@example.com` | `password123` | View AI skill-gap, watch Stanford CS224N lectures, take quizzes, build resumes, practice in the 92-question interview arena, apply for jobs. |
| **Demo Admin** | `admin@skillbridge.io` | `adminpassword` | Access Admin Hub, view student skill distributions, post new jobs, manage candidate application milestones. |

---

## 📄 8. License

This project is licensed under the [MIT License](LICENSE).
