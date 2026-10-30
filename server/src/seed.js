import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Job from './models/Job.js';
import Course from './models/Course.js';
import Mentor from './models/Mentor.js';
import Assessment from './models/Assessment.js';
import Application from './models/Application.js';
import { calculateJobMatch } from './services/aiEngine.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skillbridge');
    console.log('[Seed] Connected to MongoDB');

    // Clear collections
    await User.deleteMany();
    await Job.deleteMany();
    await Course.deleteMany();
    await Mentor.deleteMany();
    await Assessment.deleteMany();
    await Application.deleteMany();

    // 1. Create Default Student: Aditya
    const student = await User.create({
      name: 'Aditya',
      email: 'aditya@example.com',
      password: 'password123',
      role: 'student',
      headline: 'Passionate Junior Full Stack Developer & AI Enthusiast',
      bio: 'Final year engineering student eager to bridge modern web frameworks and machine learning into production pipelines.',
      targetRole: 'Full Stack Developer',
      skills: [
        { name: 'React', level: 'Intermediate', verified: true },
        { name: 'JavaScript', level: 'Advanced', verified: true },
        { name: 'MongoDB', level: 'Intermediate', verified: false }
      ],
      education: [
        {
          degree: 'B.Tech in Computer Science',
          institution: 'National Institute of Technology',
          year: '2022 - 2026',
          grade: '8.8 CGPA'
        }
      ],
      resume: {
        title: 'Aditya Full-Stack Resume',
        summary: 'Motivated developer with practical projects in React and MongoDB. Seeking full-time or internship opportunity to apply backend expertise.',
        experience: [
          {
            role: 'Web Development Intern',
            company: 'TechNovation Labs',
            period: 'May 2025 - Jul 2025',
            description: 'Built interactive student dashboard components using React and styled modern dark theme interfaces.'
          }
        ],
        projects: [
          {
            title: 'SkillBridge Platform',
            tech: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
            link: 'https://github.com/aditya/skillbridge',
            description: 'AI-assisted youth employability system with skill-gap recommendations and match scoring.'
          }
        ],
        certifications: ['Meta Front-End Developer', 'MongoDB Basics Associate']
      }
    });

    // 2. Create Admin User
    const admin = await User.create({
      name: 'Admin Sarah',
      email: 'admin@skillbridge.io',
      password: 'adminpassword',
      role: 'admin',
      headline: 'SkillBridge Operations & Talent Lead',
      bio: 'Overseeing youth employability programs and university partnerships.'
    });

    // 3. Create Sample Jobs & Internships
    const jobs = await Job.create([
      {
        title: 'Junior Full Stack Engineer',
        company: 'Vercel Ecosystem Labs',
        location: 'Remote',
        type: 'Internship',
        workplaceType: 'Remote',
        salary: '$50,000 - $65,000 / yr',
        experienceLevel: 'Junior',
        description: 'Join our developer platform team to build fast, reactive user experiences with modern serverless architectures and Node microservices.',
        requiredSkills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'Express'],
        preferredSkills: ['Docker', 'TypeScript'],
        responsibilities: [
          'Develop reusable components and integrate with REST APIs.',
          'Optimize query performances with MongoDB aggregation pipelines.',
          'Participate in agile sprints and code reviews.'
        ],
        postedBy: admin._id
      },
      {
        title: 'Backend Systems Intern',
        company: 'HyperScale Cloud Systems',
        location: 'Bengaluru / Hybrid',
        type: 'Internship',
        workplaceType: 'Hybrid',
        salary: '₹35,000 / month',
        experienceLevel: 'Junior',
        description: 'Work with high-throughput API microservices, containerized services, and database reliability engineering.',
        requiredSkills: ['Node.js', 'Express', 'Docker', 'MongoDB'],
        preferredSkills: ['Redis', 'Kubernetes'],
        responsibilities: [
          'Build Docker containers and setup CI/CD pipelines.',
          'Design scalable RESTful endpoints with Express and Mongoose.'
        ],
        postedBy: admin._id
      },
      {
        title: 'Frontend React Developer',
        company: 'NeoDesign Studios',
        location: 'San Francisco, CA',
        type: 'Full-time',
        workplaceType: 'Remote',
        salary: '$80,000 - $95,000 / yr',
        experienceLevel: 'Junior',
        description: 'Craft ultra-fluid, dark-themed user dashboards with tactile micro-interactions and high-density data visualizations.',
        requiredSkills: ['React', 'JavaScript', 'Tailwind CSS', 'Git'],
        preferredSkills: ['Next.js', 'Figma'],
        responsibilities: [
          'Translate Figma mockups into pixel-perfect React JSX.',
          'Ensure accessibility and 60fps animations.'
        ],
        postedBy: admin._id
      },
      {
        title: 'AI Platform Research Associate',
        company: 'DeepSynthetics AI',
        location: 'New York / Hybrid',
        type: 'Internship',
        workplaceType: 'Hybrid',
        salary: '$60,000 / yr',
        experienceLevel: 'Junior',
        description: 'Explore state-of-the-art LLM architectures, tokenization pipelines, embeddings spaces, and attention layers.',
        requiredSkills: ['Python', 'Tokenization', 'Attention Mechanism', 'Embeddings', 'Docker'],
        preferredSkills: ['PyTorch', 'FastAPI'],
        responsibilities: [
          'Run automated evaluation suites on attention matrices.',
          'Implement fast tokenization utilities.'
        ],
        postedBy: admin._id
      }
    ]);

    // 4. Create Recommended Courses
    await Course.create([
      {
        title: 'Node.js & Express Architecture Masterclass',
        provider: 'SkillBridge Academy',
        targetSkill: 'Node.js',
        relatedSkills: ['Express', 'REST API', 'JavaScript'],
        level: 'Beginner',
        duration: '14 hours',
        modulesCount: 7,
        rating: 4.9,
        summary: 'Learn backend asynchronous runtimes, middleware chains, routing, and REST architectural patterns.',
        topics: ['Event Loop & Async I/O', 'Express Router & Middleware', 'Authentication with JWT', 'Error Handling Paradigms']
      },
      {
        title: 'Production Docker & Microservices for Developers',
        provider: 'DevOps Campus',
        targetSkill: 'Docker',
        relatedSkills: ['Containers', 'CI/CD', 'Linux'],
        level: 'Intermediate',
        duration: '10 hours',
        modulesCount: 5,
        rating: 4.8,
        summary: 'Containerize multi-container MERN web applications with Docker Compose and production multi-stage builds.',
        topics: ['Dockerfile Directives', 'Docker Compose Orchestration', 'Volume Persistence & Networking', 'CI Integration']
      },
      {
        title: 'Model Foundations: Tokenization & Attention in Action',
        provider: 'AI Engineering Lab',
        targetSkill: 'Tokenization',
        relatedSkills: ['Attention Mechanism', 'Embeddings', 'Python'],
        level: 'Beginner',
        duration: '18 min / module',
        modulesCount: 6,
        rating: 4.95,
        summary: 'Interactive deep dive into how models break text into tokens and compute self-attention weight tensors.',
        topics: ['Byte-Pair Encoding', 'Embedding Projections', 'Multi-Head Attention Matrices', 'KV Caching']
      },
      {
        title: 'Production MongoDB Aggregations & Schema Design',
        provider: 'DataScale Institute',
        targetSkill: 'MongoDB',
        relatedSkills: ['NoSQL', 'Database Design', 'Mongoose'],
        level: 'Intermediate',
        duration: '8 hours',
        modulesCount: 4,
        rating: 4.7,
        summary: 'Master complex indexing, aggregations, lookup pipelines, and transactional safety in MongoDB.',
        topics: ['Pipeline Operators', 'Compound Indexes', 'Schema Embedding vs Referencing', 'Performance Tuning']
      }
    ]);

    // 5. Create Mentors
    const mentor1 = await Mentor.create({
      name: 'Dr. Elena Vance',
      title: 'Principal Staff Engineer',
      company: 'Stripe',
      expertise: ['Node.js', 'Express', 'Distributed Systems', 'Docker'],
      bio: 'Ex-Google, helping new grads transition from simple tutorials to resilient high-throughput backend services.',
      experienceYears: 12,
      availability: '3 slots open this week',
      rating: 4.95,
      sessionsCompleted: 114
    });

    await Mentor.create({
      name: 'Marcus Chen',
      title: 'Senior Frontend Architect',
      company: 'Linear',
      expertise: ['React', 'JavaScript', 'Design Systems', 'Next.js'],
      bio: 'Obsessed with fluid dark interfaces, keyboard navigation, and fast web application performance.',
      experienceYears: 8,
      availability: '5 slots open this week',
      rating: 4.9,
      sessionsCompleted: 88
    });

    // Link default mentor
    student.matchedMentorId = mentor1._id;
    await student.save();

    // 6. Create Interactive Skill Assessments
    await Assessment.create([
      {
        skill: 'React',
        title: 'React Fundamentals & Component Architecture',
        description: 'Verify your proficiency in hooks, virtual DOM, and component state management.',
        passingScore: 70,
        questions: [
          {
            question: 'What is the primary advantage of the React Virtual DOM?',
            options: [
              'It bypasses JavaScript runtime constraints',
              'It minimizes direct, costly DOM manipulations via batch diffing',
              'It eliminates the need for CSS styling',
              'It runs strictly on web server hardware'
            ],
            correctAnswer: 1,
            explanation: 'The virtual DOM compares previous and new state trees and calculates the minimal batch updates required for the actual DOM.'
          },
          {
            question: 'When does useEffect with an empty dependency array `[]` run?',
            options: [
              'On every re-render of the component',
              'Only once after the initial render (mount)',
              'Whenever props update',
              'Only during server side rendering'
            ],
            correctAnswer: 1,
            explanation: 'An empty dependency array indicates no state triggers re-execution after mount.'
          },
          {
            question: 'Why should you avoid using array indices as `key` props when list order may change?',
            options: [
              'It triggers compiler syntax errors',
              'It can cause component state bugs and inefficient re-renders during reordering',
              'Keys must only be UUID strings',
              'It slows down network transfer speeds'
            ],
            correctAnswer: 1,
            explanation: 'Index keys mislead Reacts reconciliation algorithm when items are shifted, prepended, or deleted.'
          }
        ]
      },
      {
        skill: 'Node.js',
        title: 'Node.js Runtimes & Asynchronous Architecture',
        description: 'Assess understanding of event loops, streams, and non-blocking I/O.',
        passingScore: 70,
        questions: [
          {
            question: 'Which component coordinates non-blocking asynchronous I/O operations in Node.js?',
            options: [
              'V8 Engine',
              'libuv event loop and thread pool',
              'Babel transpiler',
              'NPM package manager'
            ],
            correctAnswer: 1,
            explanation: 'libuv is the multi-platform C library that handles the event loop and asynchronous thread pool tasks in Node.js.'
          },
          {
            question: 'What happens if you execute CPU-intensive blocking loops on Node’s main thread?',
            options: [
              'Node automatically spins up new processes per core',
              'It blocks the event loop, causing all incoming requests to freeze or stall',
              'The memory garbage collector terminates the program',
              'Nothing, Node is multithreaded by default for loops'
            ],
            correctAnswer: 1,
            explanation: 'Because JavaScript execution is single-threaded on the event loop, heavy sync computations block incoming event processing.'
          }
        ]
      },
      {
        skill: 'Docker',
        title: 'Containerization & Dockerfile Basics',
        description: 'Test skills on container isolation, images, layers, and networking.',
        passingScore: 70,
        questions: [
          {
            question: 'What is the primary difference between a Docker Image and a Docker Container?',
            options: [
              'An image is a running instance; a container is the static template file',
              'An image is a read-only immutable blueprint; a container is a runnable, isolated instance of that image',
              'Images require virtual machines while containers do not',
              'There is no difference'
            ],
            correctAnswer: 1,
            explanation: 'Images are immutable layers representing code, dependencies, and filesystem. Containers are live running instances.'
          }
        ]
      }
    ]);

    // 7. Create Sample Application for Aditya
    const job1 = jobs[0];
    const match1 = calculateJobMatch(student.skills, job1.requiredSkills, job1.preferredSkills);
    await Application.create({
      jobId: job1._id,
      studentId: student._id,
      status: 'Under Review',
      coverNote: 'Excited about the full stack role at Vercel Ecosystem Labs! Currently learning Node.js and Express to close all gaps.',
      matchScore: match1.score,
      matchedSkills: match1.matchedSkills,
      missingSkills: match1.missingSkills,
      timeline: [
        {
          status: 'Submitted',
          note: `Applied with ${match1.score}% match score`,
          date: new Date(Date.now() - 3 * 86400000)
        },
        {
          status: 'Under Review',
          note: 'Resume shortlisted for technical review by Hiring Lead',
          date: new Date(Date.now() - 1 * 86400000)
        }
      ]
    });

    console.log('[Seed] Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seed();
