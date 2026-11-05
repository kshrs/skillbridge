# 🎓 SkillBridge – Academic Competency & Placement Infrastructure

A production-grade, modular, and minimal **MERN Stack** (MongoDB, Express.js, React 19, Node.js) web application running fully in **Docker**.

---

## 📋 Project Submission Details

1. **Name of the Application**: **SkillBridge**
2. **Problem/Domain Addressed**: 
   - **Higher Education & Student Employability Paradox**: Bridging the disconnect between university curricula, practical skill acquisition, and campus placement drives.
   - Diagnoses student technical skill gaps, delivers Ivy League/top university open courseware (Stanford CS224N, MIT 6.824, UC Berkeley CS162), validates competencies via cohort-targeted assessments, and connects students with verified campus placements through an auditable application ticket pipeline.
3. **Brief Description**:
   - SkillBridge is an academic and recruitment engine built on the MERN stack. It empowers students to master systems and AI curriculums, write rich notes with file attachments, take skill assessments, and apply to recruitment drives with 1-click verified credentials. Concurrently, it equips academic administrators and faculty mentors with a comprehensive workstation to publish batch-targeted assessments, coordinate campus drives, inspect granular student dossiers, audit application tickets, and resolve student doubts in real time.
4. **Team Members / Register Numbers**:
   - Aditya Sharma (`22IT1042`) – Lead Fullstack Engineering
   - SkillBridge Development Team
5. **Major Features & Modules**:
   - **Student Identity & Activity Portfolio**: Academic profile, verified skills tags, 365-day engagement heatmap.
   - **Learn Canvas**: Split sub-views for *"My Learning"* (telemetry watch progress, resume links) and *"Explore Catalog"* (Stanford, MIT, UC Berkeley courses with syllabus accordion, notes editor, and file attachment uploads).
   - **Cohort Benchmark Assessments**: MCQ, conceptual rubric grading, and live coding sandboxes with auto-verification of skills upon passing.
   - **Campus Recruitment Drives & Ticket System**: Prerequisite skill matching algorithms, 1-click application ticket generation (`TKT-YYYY-DEPT-XXXX`), and stage history tracking.
   - **Faculty Mentors Directory**: Direct doubt clearance channels between students and professors across 8 CS disciplines.
   - **Administrative & Faculty Workstation**:
     - *Students Roster & Dossiers*: Filter by department/year with deep inspection of CGPA, skills, enrolled course watch telemetry, and drive tickets.
     - *Publish Assessment*: Class/batch targeting (1st-4th year, specific department), multiple question types, and curriculum templates.
     - *Publish Drives*: Configure CTC packages, minimum CGPA cutoff, required skills, and interview selection pipelines.
     - *Manage Drive Tickets*: Advance stages (`Registered` ➔ `Shortlisted` ➔ `Assessment Round` ➔ `Technical Interview` ➔ `Offered`) with audit notes.
     - *Student Doubts & Messaging*: Resolve doubts with quick reply presets.
6. **MERN Stack Components Used**:
   - **MongoDB 7.0**: Multi-collection persistence (`users`, `courses`, `enrollments`, `assessments`, `assessmentresults`, `placements`, `placementapplications`, `messages`).
   - **Express.js 4**: Clean REST API architecture, JWT authentication middleware, role-based access control (`student`, `faculty`, `admin`).
   - **React 19 & Vite 6**: High-performance interactive Single Page Application (SPA), Notion/Linear minimalist aesthetic, CSS variables for light/dark themes.
   - **Node.js 20 (Alpine)**: Lightweight, containerized asynchronous runtime.
   - **Docker & Docker Compose**: Multi-container orchestration (MongoDB on port `27019`, Express API on port `5000`, Nginx/React frontend on port `3000`).

---

## 🚀 Quick Start with Docker

```bash
# 1. Clone the repository
git clone https://github.com/kshrs/skillbridge.git
cd skillbridge
git checkout test

# 2. Build and launch all containers
docker-compose up -d --build

# 3. Seed demonstration data (students, faculty, courses, drives, tickets)
docker exec skillbridge-backend node src/seed.js
```

The application is now live at:
- **Frontend Web Application**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **MongoDB Database**: `mongodb://localhost:27019/skillbridge`

---

## 🔑 Test User Presets (1-Click Login)

| Role | Name | Email | Password |
|---|---|---|---|
| **Student** | Aditya Sharma | `aditya@example.com` | `password123` |
| **Faculty Mentor** | Dr. Aris Thorne | `thorne@faculty.edu` | `password123` |
| **Dean / Admin** | Dr. Kaelen Vance | `vance@faculty.edu` | `password123` |
