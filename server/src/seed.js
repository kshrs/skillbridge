require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const User = require('./models/User');
const Course = require('./models/Course');
const Assessment = require('./models/Assessment');
const Placement = require('./models/Placement');
const PlacementApplication = require('./models/PlacementApplication');
const Enrollment = require('./models/Enrollment');

const mongoUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/skillbridge';

async function seedDatabase() {
  console.log('\n======================================================');
  console.log('🚀 SkillBridge Automated Database Initializer & Seeder');
  console.log('======================================================');
  console.log(`[Connecting to MongoDB]: ${mongoUri}`);

  await mongoose.connect(mongoUri);
  console.log('✔ Connected to MongoDB successfully.\n');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // --------------------------------------------------------------------------
  // 1. DEFAULT AUTHENTICATION ACCOUNTS (STUDENTS, FACULTY MENTORS, ADMINS)
  // --------------------------------------------------------------------------
  console.log('--- 1. Initializing User Accounts & Academic Identities ---');
  const defaultUsers = [
    // Students
    {
      name: 'Aditya Sharma',
      email: 'aditya@example.com',
      password: passwordHash,
      role: 'student',
      academicProfile: {
        department: 'Information Technology',
        year: 3,
        section: 'A',
        rollNumber: '22IT1042',
        cgpa: 8.92
      },
      headline: 'Third Year IT Student | Aspiring AI/ML & Systems Engineer',
      bio: 'Studying Stanford CS224N and MIT OpenCourseWare. Working on Transformers, PyTorch implementations, and distributed backend architectures.',
      targetRole: 'AI / ML Engineer',
      skills: [
        { name: 'Python', level: 'Advanced', verified: true, verifiedAt: new Date() },
        { name: 'PyTorch', level: 'Intermediate', verified: true, verifiedAt: new Date() },
        { name: 'Transformers & NLP', level: 'Intermediate', verified: false },
        { name: 'Distributed Systems', level: 'Intermediate', verified: true, verifiedAt: new Date() },
        { name: 'React', level: 'Intermediate', verified: true },
        { name: 'Node.js', level: 'Intermediate', verified: true }
      ],
      activityLog: [
        { date: '2026-11-01', count: 4, action: 'Watched CS224N Lecture 2' },
        { date: '2026-11-02', count: 7, action: 'Completed Scaled Attention Quiz' },
        { date: '2026-11-03', count: 5, action: 'Updated Lecture Notes' },
        { date: '2026-11-04', count: 8, action: 'Applied to Google & Microsoft Drives' }
      ]
    },
    {
      name: 'Priya Sundaram',
      email: 'priya.s@student.edu',
      password: passwordHash,
      role: 'student',
      academicProfile: {
        department: 'Computer Science',
        year: 4,
        section: 'A',
        rollNumber: '21CS1014',
        cgpa: 9.34
      },
      headline: 'Final Year CS Student | Distributed Systems & Go Enthusiast',
      bio: 'Researched Raft consensus implementations and microservices caching. Looking for Core Backend Systems roles.',
      targetRole: 'Backend Systems Engineer',
      skills: [
        { name: 'Go', level: 'Advanced', verified: true, verifiedAt: new Date() },
        { name: 'Distributed Systems', level: 'Intermediate', verified: true, verifiedAt: new Date() },
        { name: 'Docker & Kubernetes', level: 'Intermediate', verified: true },
        { name: 'PostgreSQL', level: 'Advanced', verified: true },
        { name: 'gRPC & Protobuf', level: 'Intermediate', verified: false }
      ],
      activityLog: [
        { date: '2026-11-01', count: 4, action: 'Completed Distributed Systems Benchmark' },
        { date: '2026-11-03', count: 6, action: 'Submitted Lab 4: Raft Election' }
      ]
    },
    {
      name: 'Rohan Verma',
      email: 'rohan.v@student.edu',
      password: passwordHash,
      role: 'student',
      academicProfile: {
        department: 'Information Technology',
        year: 3,
        section: 'B',
        rollNumber: '22IT1088',
        cgpa: 8.45
      },
      headline: 'Junior IT Undergrad | NLP & Large Language Models',
      bio: 'Deep diving into Attention mechanisms, Transformer tokenizers, and PyTorch fine-tuning workflows.',
      targetRole: 'AI / ML Engineer',
      skills: [
        { name: 'Python', level: 'Advanced', verified: true },
        { name: 'PyTorch', level: 'Advanced', verified: true, verifiedAt: new Date() },
        { name: 'Transformers & NLP', level: 'Intermediate', verified: true },
        { name: 'Vector Databases', level: 'Intermediate', verified: false },
        { name: 'FastAPI', level: 'Intermediate', verified: true }
      ],
      activityLog: [
        { date: '2026-10-28', count: 3, action: 'Watched CS224N Lecture 4' },
        { date: '2026-11-02', count: 5, action: 'Built LoRA Fine-Tuning Sandbox' }
      ]
    },

    // Faculty Mentors across 8 Disciplines
    {
      name: 'Dr. Aris Thorne',
      email: 'thorne@faculty.edu',
      password: passwordHash,
      role: 'faculty',
      headline: 'Associate Professor | Distributed Systems & Operating Systems',
      staffProfile: {
        department: 'Computer Science',
        title: 'Associate Professor',
        designation: 'Associate Professor & Systems Lab Director',
        disciplines: ['Distributed Systems', 'Operating Systems', 'Consensus Algorithms'],
        officeLocation: 'Block B, Turing Hall 304',
        officeHours: 'Mon-Thu 2:00 PM - 5:00 PM',
        contactEmail: 'thorne@faculty.edu'
      }
    },
    {
      name: 'Prof. Elena Rostova',
      email: 'elena@faculty.edu',
      password: passwordHash,
      role: 'faculty',
      headline: 'Associate Professor | NLP, LLM Architectures & Transformers',
      staffProfile: {
        department: 'Information Technology',
        title: 'Associate Professor',
        designation: 'Director of Applied NLP Research',
        disciplines: ['Natural Language Processing', 'Transformers', 'Self-Attention Models'],
        officeLocation: 'Block A, Lovelace Suite 210',
        officeHours: 'Wed-Fri 3:00 PM - 5:00 PM',
        contactEmail: 'elena@faculty.edu'
      }
    },
    {
      name: 'Dr. Marcus Sterling',
      email: 'sterling@faculty.edu',
      password: passwordHash,
      role: 'faculty',
      headline: 'Professor of Cryptography & Network Security',
      staffProfile: {
        department: 'Cybersecurity & Networks',
        title: 'Professor & Lab Head',
        designation: 'Chair of Cyber Defence',
        disciplines: ['Zero-Knowledge Proofs', 'Post-Quantum Cryptography', 'Kernel Security'],
        officeLocation: 'Security Wing, Block C Room 102',
        officeHours: 'Tue-Thu 10:00 AM - 1:00 PM',
        contactEmail: 'sterling@faculty.edu'
      }
    },
    {
      name: 'Prof. Ananya Sen',
      email: 'ananya@faculty.edu',
      password: passwordHash,
      role: 'faculty',
      headline: 'Lead Faculty | Theoretical Computer Science & Complexity',
      staffProfile: {
        department: 'Computer Science',
        title: 'Assistant Professor',
        designation: 'Director of Algorithms Institute',
        disciplines: ['Algorithms & Complexity', 'Graph Theory', 'Approximation Algorithms'],
        officeLocation: 'Ramanujan Mathematical Sciences 401',
        officeHours: 'Mon-Wed 11:00 AM - 2:00 PM',
        contactEmail: 'ananya@faculty.edu'
      }
    },
    {
      name: 'Dr. Devraj Mukherjee',
      email: 'devraj@faculty.edu',
      password: passwordHash,
      role: 'faculty',
      headline: 'Professor | Database Engines, High-Throughput OLAP & KV Stores',
      staffProfile: {
        department: 'Information Technology',
        title: 'Professor',
        designation: 'Data Systems Group Chair',
        disciplines: ['Database Internals', 'LSM Trees & RocksDB', 'Query Optimization'],
        officeLocation: 'Dijkstra Complex 505',
        officeHours: 'Mon-Thu 4:00 PM - 6:00 PM',
        contactEmail: 'devraj@faculty.edu'
      }
    },
    {
      name: 'Prof. Sarah Jenkins',
      email: 'jenkins@faculty.edu',
      password: passwordHash,
      role: 'faculty',
      headline: 'Associate Professor | Computer Vision, NeRFs & Robotics',
      staffProfile: {
        department: 'Robotics & AI',
        title: 'Associate Professor',
        designation: 'Robotics Perception Lab Lead',
        disciplines: ['3D Vision', 'Diffusion Models', 'Autonomous Navigation'],
        officeLocation: 'Robotics Hangar, Bay 4',
        officeHours: 'Tue-Fri 2:00 PM - 4:00 PM',
        contactEmail: 'jenkins@faculty.edu'
      }
    },
    {
      name: 'Dr. Vikramaditya Rao',
      email: 'rao@faculty.edu',
      password: passwordHash,
      role: 'faculty',
      headline: 'Associate Professor | High Performance Computing & GPU Kernels',
      staffProfile: {
        department: 'Computer Engineering',
        title: 'Associate Professor',
        designation: 'HPC Cluster Director',
        disciplines: ['CUDA Programming', 'Triton & FlashAttention', 'Parallel Computing'],
        officeLocation: 'Supercomputing Facility 201',
        officeHours: 'Wed-Fri 1:00 PM - 4:00 PM',
        contactEmail: 'rao@faculty.edu'
      }
    },

    // Administration
    {
      name: 'Dr. Kaelen Vance',
      email: 'vance@faculty.edu',
      password: passwordHash,
      role: 'admin',
      headline: 'Dean of Academic Computing & Corporate Placement Directorate',
      staffProfile: {
        department: 'Information Technology',
        title: 'Dean & Professor',
        designation: 'Dean of Academic Computing',
        disciplines: ['Curriculum Design', 'Placement Oversight', 'Enterprise Architecture'],
        officeLocation: 'Administrative Tower Suite 401',
        officeHours: 'Tue-Fri 10:00 AM - 1:00 PM',
        contactEmail: 'vance@faculty.edu'
      }
    }
  ];

  for (const u of defaultUsers) {
    await User.findOneAndUpdate({ email: u.email }, u, { upsert: true, new: true });
    console.log(`  ✓ Seeded User: ${u.name} (${u.email}) [${u.role.toUpperCase()}]`);
  }

  // --------------------------------------------------------------------------
  // 2. CURATED 28 UNIVERSITY COURSES (STANFORD, MIT, HARVARD, BERKELEY, CMU)
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Initializing 28 University Courses Catalog ---');
  const catalogPath = path.join(__dirname, 'data', 'coursesCatalog.json');
  if (fs.existsSync(catalogPath)) {
    const coursesData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    for (const c of coursesData) {
      await Course.findOneAndUpdate({ code: c.code }, c, { upsert: true, new: true });
    }
    console.log(`  ✓ Successfully seeded ${coursesData.length} university courses from catalog.`);
  } else {
    console.warn(`  ⚠ Catalog file ${catalogPath} not found.`);
  }

  // --------------------------------------------------------------------------
  // 3. COHORT BENCHMARK ASSESSMENTS
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Initializing Cohort Benchmark Assessments ---');
  const assessmentsData = [
    {
      title: 'Cohort Benchmark: Distributed Systems & Raft Consensus',
      description: 'Mandatory cohort evaluation covering consensus invariants, leader election, and log compaction.',
      skill: 'Distributed Systems',
      category: 'cohort-drive',
      targetClass: { department: 'All', year: 0, section: 'All' },
      timeLimitMinutes: 30,
      passingScore: 70,
      questions: [
        {
          type: 'mcq',
          question: 'In the Raft consensus protocol, what condition must be true for a leader to commit a log entry from a previous term?',
          options: [
            'It can be committed directly once stored on a majority of servers.',
            'It cannot be committed directly; it must be committed by committing an entry from its current term.',
            'It requires an immediate quorum reconfiguration heartbeat.',
            'It can only be committed if all candidate votes are unanimous.'
          ],
          correctAnswer: 1,
          explanation: 'Raft does not commit previous-term entries by counting replicas directly; a leader commits them indirectly by replicating and committing an entry from its current term (Section 5.4.2 of Raft paper).',
          points: 50
        },
        {
          type: 'conceptual',
          question: 'Explain how Split-Brain is prevented in a 5-node distributed cluster when network partition separates 2 nodes from 3 nodes.',
          sampleSolution: 'In a 5-node cluster, a strict quorum requires (5/2)+1 = 3 nodes. The partition with 2 nodes cannot achieve a majority quorum and rejects write requests or abdicates leadership. The 3-node partition achieves quorum and continues safely.',
          points: 50
        }
      ]
    },
    {
      title: 'Stanford CS224N Diagnostic: Self-Attention & Transformers',
      description: 'Assessment on Scaled Dot-Product Attention, Multi-Head projection dimensions, and LayerNorm ordering.',
      skill: 'Transformers & NLP',
      category: 'cohort-drive',
      targetClass: { department: 'All', year: 0, section: 'All' },
      timeLimitMinutes: 25,
      passingScore: 70,
      questions: [
        {
          type: 'mcq',
          question: 'Why is the dot-product in Scaled Dot-Product Attention divided by sqrt(d_k)?',
          options: [
            'To accelerate backward gradient propagation through GPU matrix cores.',
            'To avoid softmax saturation and vanishing gradients for large key dimension sizes.',
            'To ensure that the attention matrix diagonal always sums to 1.0.',
            'To normalize the output vector magnitude to unit Euclidean norm.'
          ],
          correctAnswer: 1,
          explanation: 'Dividing by sqrt(d_k) prevents the dot products from growing excessively large for large dimensions, which would push the softmax function into regions with vanishingly small gradients.',
          points: 50
        },
        {
          type: 'coding',
          question: 'Implement a vectorized computation for Scaled Dot-Product Attention in Python given Q, K, V numpy matrices.',
          starterCode: 'import numpy as np\n\ndef scaled_dot_product_attention(Q, K, V):\n    # d_k = Q.shape[-1]\n    # Return attention output\n    pass',
          sampleSolution: 'import numpy as np\n\ndef scaled_dot_product_attention(Q, K, V):\n    d_k = Q.shape[-1]\n    scores = np.matmul(Q, K.swapaxes(-2, -1)) / np.sqrt(d_k)\n    weights = np.exp(scores - np.max(scores, axis=-1, keepdims=True))\n    weights = weights / np.sum(weights, axis=-1, keepdims=True)\n    return np.matmul(weights, V)',
          points: 50
        }
      ]
    },
    {
      title: 'CMU 15-445 Verification: B+ Tree Indexing & Buffer Pool Management',
      description: 'Storage engine benchmarking covering LRU-K frame evictions, latch crabbing protocols, and disk page layouts.',
      skill: 'Database Systems',
      category: 'skill-verification',
      targetClass: { department: 'All', year: 0, section: 'All' },
      timeLimitMinutes: 30,
      passingScore: 75,
      questions: [
        {
          type: 'mcq',
          question: 'Why does the LRU-K buffer replacement policy outperform standard LRU in database management systems?',
          options: [
            'It replaces frames based on time of K-th backward reference, mitigating sequential scan pollution.',
            'It eliminates hash table lock contention completely across buffer frames.',
            'It avoids dirty page flushes to non-volatile storage.',
            'It reduces pointer width from 64-bit to 32-bit.'
          ],
          correctAnswer: 0,
          explanation: 'LRU-K uses the backward distance to the K-th previous access to differentiate between frequent sequential scans and genuine popular pages.',
          points: 50
        },
        {
          type: 'conceptual',
          question: 'Describe how Latch Crabbing / Coupling safely allows concurrent search and insert operations in a B+ Tree.',
          sampleSolution: 'Search starts at root and latches child before unlatching parent. Inserts hold parent latches until a child is found to be safe (will not split).',
          points: 50
        }
      ]
    },
    {
      title: 'Full Stack Architecture: Microservices, Redis Caching & Event Loops',
      description: 'Evaluation on Node.js asynchronous event loops, idempotency keys, and distributed caching strategies.',
      skill: 'Full Stack Engineering',
      category: 'cohort-drive',
      targetClass: { department: 'All', year: 0, section: 'All' },
      timeLimitMinutes: 20,
      passingScore: 70,
      questions: [
        {
          type: 'mcq',
          question: 'What happens when a long-running CPU-bound mathematical loop executes synchronously in a Node.js Express route?',
          options: [
            'It blocks the single JavaScript event loop, preventing all incoming HTTP socket requests from being serviced.',
            'It automatically spawns a separate OS worker thread from the libuv pool.',
            'Node.js automatically context-switches to the next asynchronous callback.',
            'The OS dynamically balances the thread across idle CPU cores.'
          ],
          correctAnswer: 0,
          explanation: 'Node.js runs user JavaScript on a single thread. CPU-intensive loops starve the event loop, causing all concurrent connections to stall.',
          points: 50
        },
        {
          type: 'mcq',
          question: 'Which caching strategy prevents "Cache Avalanche" when thousands of cache keys expire simultaneously?',
          options: [
            'Adding a randomized jitter offset to key TTL durations.',
            'Using write-through cache eviction without read quorums.',
            'Increasing the database connection pool size to infinity.',
            'Disabling Redis memory persistence (AOF/RDB).'
          ],
          correctAnswer: 0,
          explanation: 'Adding random jitter to expiration times spreads out database misses so all keys do not simultaneously expire.',
          points: 50
        }
      ]
    }
  ];

  for (const a of assessmentsData) {
    await Assessment.findOneAndUpdate({ title: a.title }, a, { upsert: true, new: true });
    console.log(`  ✓ Seeded Assessment: ${a.title}`);
  }

  // --------------------------------------------------------------------------
  // 4. CAMPUS RECRUITMENT DRIVES
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Initializing Campus Recruitment Drives ---');
  const drivesData = [
    {
      companyName: 'Microsoft',
      roleTitle: 'Software Engineer - Azure Cloud Core',
      driveType: 'On-Campus',
      status: 'Registration Open',
      ctcPackage: '42 - 50 LPA',
      location: 'Hyderabad / Bangalore',
      description: 'Build hyperscale cloud control planes, virtualized software-defined networking, and high-performance kernel drivers for Azure.',
      eligibleDepartments: ['Information Technology', 'Computer Science'],
      eligibleGraduationYears: [2026, 2027],
      minCgpa: 8.0,
      requiredSkills: ['Distributed Systems', 'Go', 'Python', 'Linux Internals'],
      preferredSkills: ['Kubernetes', 'Docker & Kubernetes', 'gRPC & Protobuf'],
      driveDate: new Date('2026-11-28'),
      registrationDeadline: new Date('2026-11-20'),
      selectionProcess: ['Online Assessment', 'System Architecture Round', 'Technical Interview', 'Behavioral HR']
    },
    {
      companyName: 'NVIDIA',
      roleTitle: 'Deep Learning Systems Engineer',
      driveType: 'On-Campus',
      status: 'Registration Open',
      ctcPackage: '38 - 46 LPA',
      location: 'Bangalore / Hybrid',
      description: 'Optimize high-throughput LLM serving kernels, TensorRT engines, and multi-GPU collective communications libraries (NCCL).',
      eligibleDepartments: ['Information Technology', 'Computer Science', 'Data Science'],
      eligibleGraduationYears: [2026, 2027],
      minCgpa: 8.2,
      requiredSkills: ['Python', 'PyTorch', 'Transformers & NLP'],
      preferredSkills: ['CUDA', 'C++', 'Distributed Systems'],
      driveDate: new Date('2026-12-04'),
      registrationDeadline: new Date('2026-11-24'),
      selectionProcess: ['CUDA/PyTorch Hackathon', 'Deep Learning Architecture Round', 'HR Interview']
    },
    {
      companyName: 'Google',
      roleTitle: 'Software Engineer - Core Systems',
      driveType: 'On-Campus',
      status: 'Registration Open',
      ctcPackage: '45 - 55 LPA',
      location: 'Bangalore',
      description: 'Scale Google internal infrastructure, Borg container scheduling, Spanner globally-distributed ACID database, and gRPC routing.',
      eligibleDepartments: ['Information Technology', 'Computer Science', 'Data Science'],
      eligibleGraduationYears: [2026, 2027],
      minCgpa: 8.5,
      requiredSkills: ['Data Structures & Algorithms', 'C++', 'Distributed Systems', 'Python'],
      preferredSkills: ['Go', 'Spanner', 'Linux Internals'],
      driveDate: new Date('2026-12-12'),
      registrationDeadline: new Date('2026-11-30'),
      selectionProcess: ['Google Coding Challenge', '3 Technical Rounds', 'Googleyness & Leadership']
    },
    {
      companyName: 'Meta Platforms',
      roleTitle: 'Production Engineer - Global Infrastructure',
      driveType: 'On-Campus',
      status: 'Registration Open',
      ctcPackage: '44 - 52 LPA',
      location: 'Hyderabad / Hybrid',
      description: 'Operate global scale edge caches, Linux kernel observability via eBPF, and real-time streaming pipelines for 3+ billion users.',
      eligibleDepartments: ['Information Technology', 'Computer Science'],
      eligibleGraduationYears: [2026, 2027],
      minCgpa: 8.0,
      requiredSkills: ['Linux Internals', 'Python', 'Distributed Systems', 'Networking'],
      preferredSkills: ['eBPF', 'C++', 'Kubernetes'],
      driveDate: new Date('2026-12-18'),
      registrationDeadline: new Date('2026-12-05'),
      selectionProcess: ['Linux Systems Screener', 'Systems Architecture', 'Live Debugging Round', 'HR']
    },
    {
      companyName: 'Atlassian',
      roleTitle: 'Cloud Platform & Microservices Engineer',
      driveType: 'Virtual Drive',
      status: 'Registration Open',
      ctcPackage: '36 - 42 LPA',
      location: 'Bangalore / Remote',
      description: 'Build enterprise-grade collaboration platforms supporting Jira, Confluence, and Bitbucket using event-driven architectures.',
      eligibleDepartments: ['Information Technology', 'Computer Science', 'Data Science'],
      eligibleGraduationYears: [2026, 2027],
      minCgpa: 7.5,
      requiredSkills: ['React', 'Node.js', 'Distributed Systems', 'PostgreSQL'],
      preferredSkills: ['Kafka', 'AWS', 'GraphQL'],
      driveDate: new Date('2026-12-22'),
      registrationDeadline: new Date('2026-12-10'),
      selectionProcess: ['Online Assessment', 'Full Stack Coding Round', 'System Design', 'Values Interview']
    }
  ];

  for (const d of drivesData) {
    await Placement.findOneAndUpdate({ companyName: d.companyName, roleTitle: d.roleTitle }, d, { upsert: true, new: true });
    console.log(`  ✓ Seeded Placement Drive: ${d.companyName} (${d.ctcPackage})`);
  }

  // --------------------------------------------------------------------------
  // 5. SEED ENROLLMENTS, LECTURE WATCH DATA & APPLICATION TICKETS
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Initializing Student Course Enrollments & Drive Tickets ---');
  const studentUsers = await User.find({ role: 'student' });
  const activeDrives = await Placement.find();
  const allCourses = await Course.find();

  // Enroll students in courses with watch progress & sample project artifacts
  for (const student of studentUsers) {
    for (let cIdx = 0; cIdx < Math.min(3, allCourses.length); cIdx++) {
      const course = allCourses[cIdx];
      const existingEnroll = await Enrollment.findOne({ user: student._id, course: course._id });
      if (!existingEnroll) {
        await Enrollment.create({
          user: student._id,
          course: course._id,
          completedLectures: [1, 2],
          lastWatchedLecture: 2,
          progressPercentage: 50,
          notes: [{
            lectureNumber: 1,
            title: 'Foundational Mechanics & Notes',
            content: 'Detailed lecture breakdown on mathematical invariants and asymptotic complexities.',
            attachedFiles: []
          }],
          projectArtifacts: [{
            title: `${course.code} Implementation Suite`,
            description: 'Modular implementation completed following university lecture problem sets.',
            repoUrl: 'https://github.com/skillbridge/portfolio-artifacts',
            demoUrl: 'https://skillbridge.edu/demo',
            submittedAt: new Date()
          }]
        });
      }
    }

    // Register 2 placement tickets per student
    for (let dIdx = 0; dIdx < Math.min(2, activeDrives.length); dIdx++) {
      const drive = activeDrives[dIdx];
      const existingApp = await PlacementApplication.findOne({ placement: drive._id, student: student._id });
      if (!existingApp) {
        const deptCode = student.academicProfile?.department ? student.academicProfile.department.slice(0, 2).toUpperCase() : 'CS';
        const ticketNumber = `TKT-${new Date().getFullYear()}-${deptCode}-${Math.floor(1000 + Math.random() * 9000)}`;
        const stages = ['Registered', 'Shortlisted', 'Assessment Round', 'Technical Interview'];
        const stage = stages[dIdx % stages.length];

        await PlacementApplication.create({
          ticketNumber,
          placement: drive._id,
          student: student._id,
          academicSnapshot: {
            department: student.academicProfile?.department || 'Information Technology',
            year: student.academicProfile?.year || 3,
            rollNumber: student.academicProfile?.rollNumber || '22IT1042',
            cgpa: student.academicProfile?.cgpa || 8.5
          },
          skillMatchSnapshot: {
            score: 75 + Math.floor(Math.random() * 20),
            matchedSkills: drive.requiredSkills.slice(0, 2),
            missingSkills: drive.requiredSkills.slice(2)
          },
          currentStage: stage,
          stageHistory: [
            { stage: 'Registered', updatedAt: new Date(Date.now() - 86400000 * 3), notes: 'Candidate registered through 1-Click Placement Portal.' },
            { stage: stage, updatedAt: new Date(), notes: 'Reviewed and audited by campus placement cell.' }
          ]
        });
        console.log(`  ✓ Issued Drive Ticket: ${ticketNumber} (${student.name} -> ${drive.companyName})`);
      }
    }
  }

  console.log('\n======================================================');
  console.log('✅ ALL DEFAULT DATABASE VALUES SEEDED SUCCESSFULLY!');
  console.log('======================================================');
  console.log('Test Authentication Credentials:');
  console.log('• Student:        aditya@example.com / password123');
  console.log('• Faculty Mentor: thorne@faculty.edu / password123');
  console.log('• Administrator:  vance@faculty.edu  / password123');
  console.log('======================================================\n');
  process.exit(0);
}

seedDatabase().catch(err => {
  console.error('\n❌ [Seed Fatal Error]:', err);
  process.exit(1);
});
