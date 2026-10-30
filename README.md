# SkillBridge – Youth Employability Platform

SkillBridge is an AI-enhanced youth employability and skill-gap identification platform that bridges the gap between student academic qualifications and actual industry job requirements.

The visual layout and dashboard design faithfully implement the dark, sleek UI aesthetics seen in the design reference (including the model foundation track cards, review calendar, tokenization bar visualizer, dimensional embeddings projection, and softmax attention arc graphs).

---

## 🌟 Core Features

### 1. Mandatory Requirements
- **Student Registration & Authentication**: JWT-backed secure student and recruiter/admin registration with customizable target roles.
- **Student Profile**: Detailed profile management (name, bio, target role, education degrees, verified skills).
- **Skills System**: Multi-level skill inventory (Beginner / Intermediate / Advanced) with self-reporting and verification badges.
- **Job / Internship Listings**: Filterable opportunities (Remote, Hybrid, Internships, Full-Time) with required/preferred skills.
- **Application System**: Instant 1-click applications with custom cover statements and dynamic status updates.
- **Admin Dashboard**: Comprehensive dashboard showing student skill distributions, live applicant pipelines, job posting creation, and application status management.
- **MongoDB Database**: Scalable NoSQL models for Users, Jobs, Applications, Courses, Mentors, and Assessments.
- **Full CRUD Support**: Complete Create, Read, Update, and Delete operations across profiles, skills, job postings, and applications.

### 2. Additional Features
- **Interactive Skill Assessments**: Multiple-choice assessments (React, Node.js, Docker) with automated grading, explanations, and automatic profile skill verification upon passing.
- **Resume Builder**: In-browser ATS-formatted resume builder with real-time export and profile persistence.
- **Course Recommendations**: Intelligent curriculum modules aligned with student skill deficiencies.
- **Mentor Matching**: 1-on-1 industry mentor connection tailored to candidate target roles and tech stacks.
- **Application Tracking**: Visual timeline tracking of milestones (Submitted ➔ Under Review ➔ Skill Assessment ➔ Interview Scheduled ➔ Offered).

### 3. Advanced Features
- **AI Resume Analysis**: Automated regex and neural parsing engine that scans resumes for keywords, sections, and calculates ATS strength scores with improvement tips.
- **AI Skill-Gap Analysis**: Compares a student's current skills against target industry benchmarks (e.g., *Current: React, JavaScript, MongoDB* ➔ *Recommended: Node.js, Express, Docker*).
- **Job-Skill Matching**: Calculates an exact percentage compatibility score for every job listing based on required vs. user skills.
- **Personalized Course Recommendation**: Dynamically generates tailored learning modules based on missing skills.

---

## 🖼 UI Design Match

Designed following the exact matte dark theme (`#0e1013` & `#15181e`) shown in the reference:
- Left-side navigation bar with minimal icon styling and quick tooltip previews.
- Top greeting with hero module continue action and embedded token frequency bar charts.
- **Model Foundations** interactive cards:
  - *Tokenization* (BPE visualizer)
  - *Embeddings* (2D PCA vector scatter chart)
  - *Attention* (Softmax multi-head attention arc diagram)
- Right review panel with interactive October calendar and 92-question interview preparation breakdown across Junior, Mid, and Senior tiers.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or via Docker container `skillbridge-mongo`)

### 1. Start MongoDB
If using Docker:
```bash
docker run -d --name skillbridge-mongo -p 27017:27017 mongo:latest
```

### 2. Backend Setup
```bash
cd server
npm install
npm run seed     # Populates sample students (Aditya), admin, jobs, courses, assessments, and mentors
npm run dev      # Starts server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

### Demo Credentials
- **Student**: `aditya@example.com` / `password123`
- **Admin**: `admin@skillbridge.io` / `adminpassword`
*(Quick-login buttons are also provided on the sign-in modal for one-click access)*
