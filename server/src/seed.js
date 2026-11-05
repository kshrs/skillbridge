require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Course = require('./models/Course');
const Assessment = require('./models/Assessment');
const Placement = require('./models/Placement');
const PlacementApplication = require('./models/PlacementApplication');

const mongoUri = process.env.MONGODB_URI || 'mongodb://mongodb:27017/skillbridge';

async function seed() {
  await mongoose.connect(mongoUri);
  console.log('[Seed]: Connected to MongoDB');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Users
  const usersData = [
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
        officeLocation: 'Academic Complex Block B, Room 304',
        officeHours: 'Mon-Thu 2:00 PM - 5:00 PM',
        contactEmail: 'thorne@faculty.edu'
      }
    },
    {
      name: 'Dr. Kaelen Vance',
      email: 'vance@faculty.edu',
      password: passwordHash,
      role: 'admin',
      headline: 'Dean of Academic Computing & Placement Directorate',
      staffProfile: {
        department: 'Information Technology',
        title: 'Dean & Professor',
        designation: 'Dean of Academic Computing',
        disciplines: ['Curriculum Design', 'Placement Oversight', 'Enterprise Architecture'],
        officeLocation: 'Administrative Tower Suite 401',
        officeHours: 'Tue-Fri 10:00 AM - 1:00 PM',
        contactEmail: 'vance@faculty.edu'
      }
    },
    {
      name: 'Prof. Elena Rostova',
      email: 'elena@faculty.edu',
      password: passwordHash,
      role: 'faculty',
      headline: 'Assistant Professor | NLP & Deep Learning',
      staffProfile: {
        department: 'Information Technology',
        title: 'Assistant Professor',
        designation: 'Assistant Professor of Machine Learning',
        disciplines: ['NLP', 'Transformers', 'Deep Learning'],
        officeLocation: 'Turing Hall 210',
        officeHours: 'Wed-Fri 3:00 PM - 5:00 PM',
        contactEmail: 'elena@faculty.edu'
      }
    }
  ];

  for (const u of usersData) {
    await User.findOneAndUpdate({ email: u.email }, u, { upsert: true, new: true });
    console.log(`[Seed User]: ${u.name} (${u.email}) [${u.role}]`);
  }

  // 2. Curated Courses
  const coursesData = [
    {
      title: 'CS224N: Natural Language Processing with Deep Learning',
      institution: 'Stanford University',
      code: 'STANFORD-CS224N',
      instructor: 'Prof. Christopher Manning',
      term: 'Winter 2024',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
      description: 'Comprehensive graduate course on deep learning approaches to natural language processing, word vectors, attention mechanisms, transformers, and large language models.',
      skillsTaught: ['PyTorch', 'Transformers & NLP', 'Deep Learning', 'Attention Mechanisms', 'Vector Databases'],
      modules: [
        {
          moduleId: 'mod-1',
          title: 'Foundations: Word Embeddings & Language Modeling',
          lectures: [
            {
              lectureNumber: 1,
              title: 'Introduction and Word Vectors (Word2Vec & Skip-gram)',
              youtubeId: 'rmVRLeJRkl4',
              duration: '82m',
              readingNotes: 'Study Mikolov et al. (2013) on Distributed Representations of Words.'
            },
            {
              lectureNumber: 2,
              title: 'Neural Classifiers and Word Window Models',
              youtubeId: 'gqaHkPEZAew',
              duration: '76m',
              readingNotes: 'Review Cross-Entropy Loss derivation and Backpropagation over matrix Jacobians.'
            }
          ]
        },
        {
          moduleId: 'mod-2',
          title: 'Recurrence to Attention & Transformer Architectures',
          lectures: [
            {
              lectureNumber: 3,
              title: 'Recurrent Neural Networks (RNNs) and Language Models',
              youtubeId: '0LixF202Foc',
              duration: '79m',
              readingNotes: 'Exploding and vanishing gradient solutions: LSTMs and GRUs.'
            },
            {
              lectureNumber: 4,
              title: 'Self-Attention and the Transformer Architecture',
              youtubeId: 'ptoG_AasdBg',
              duration: '84m',
              readingNotes: 'Vaswani et al. (2017) "Attention Is All You Need" thorough review.'
            }
          ]
        }
      ]
    },
    {
      title: '6.824: Distributed Systems',
      institution: 'MIT OpenCourseWare',
      code: 'MIT-6.824',
      instructor: 'Prof. Robert Morris',
      term: 'Spring 2024',
      thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=60',
      description: 'MIT flagship systems engineering course covering distributed consensus (Raft, Paxos), primary-backup replication, fault tolerance, RPCs, and consistency models.',
      skillsTaught: ['Distributed Systems', 'Go', 'Consensus Algorithms', 'Fault Tolerance', 'gRPC & Protobuf'],
      modules: [
        {
          moduleId: 'mod-1',
          title: 'RPCs, Concurrency & Primary-Backup Replication',
          lectures: [
            {
              lectureNumber: 1,
              title: 'Introduction to Distributed Systems Infrastructure',
              youtubeId: 'cQP8WApzIQQ',
              duration: '80m',
              readingNotes: 'Understand race conditions, RPC sematics at-least-once vs at-most-once.'
            },
            {
              lectureNumber: 2,
              title: 'RPC and Threads in Go',
              youtubeId: 'gA4yxNYsv4E',
              duration: '75m',
              readingNotes: 'Go channels, sync.Mutex, and condition variables in network daemons.'
            }
          ]
        },
        {
          moduleId: 'mod-2',
          title: 'Consensus Protocols: Raft Invariants',
          lectures: [
            {
              lectureNumber: 3,
              title: 'The Raft Consensus Algorithm (Part 1: Leader Election)',
              youtubeId: 'R2-9bsKmvdQ',
              duration: '82m',
              readingNotes: 'Study Ongaro & Ousterhout (2014) "In Search of an Understandable Consensus Algorithm".'
            },
            {
              lectureNumber: 4,
              title: 'Raft Log Replication and Safety Invariants (Part 2)',
              youtubeId: 'uXEPyTrJy1w',
              duration: '85m',
              readingNotes: 'Review the Raft state machine safety invariant and commit rules.'
            }
          ]
        }
      ]
    },
    {
      title: 'CS 162: Operating Systems and Systems Programming',
      institution: 'UC Berkeley',
      code: 'UCB-CS162',
      instructor: 'Prof. John Kubiatowicz',
      term: 'Fall 2023',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
      description: 'Comprehensive study of operating systems internals, memory virtualization, POSIX synchronization, paging, and kernel scheduling.',
      skillsTaught: ['C++', 'Operating Systems', 'Linux Internals', 'Virtual Memory', 'Multithreading'],
      modules: [
        {
          moduleId: 'mod-1',
          title: 'Processes, Threads & Concurrency Primitives',
          lectures: [
            {
              lectureNumber: 1,
              title: 'Operating System Abstractions & Hardware Protections',
              youtubeId: '2bT_XoZ_XnE',
              duration: '78m',
              readingNotes: 'Dual-mode CPU operation, trap handlers, and context switching overhead.'
            }
          ]
        }
      ]
    }
  ];

  for (const c of coursesData) {
    await Course.findOneAndUpdate({ code: c.code }, c, { upsert: true, new: true });
    console.log(`[Seed Course]: ${c.code} - ${c.title}`);
  }

  // 3. Assessments
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
    }
  ];

  for (const a of assessmentsData) {
    await Assessment.findOneAndUpdate({ title: a.title }, a, { upsert: true, new: true });
    console.log(`[Seed Assessment]: ${a.title}`);
  }

  // 4. Placement Drives
  const placementsData = [
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
    }
  ];

  for (const p of placementsData) {
    await Placement.findOneAndUpdate({ companyName: p.companyName, roleTitle: p.roleTitle }, p, { upsert: true, new: true });
    console.log(`[Seed Placement]: ${p.companyName} (${p.ctcPackage})`);
  }

  // 5. Sample Placement Applications for Tickets Demo
  const seededDrives = await Placement.find();
  const seededStudents = await User.find({ role: 'student' });

  for (const student of seededStudents) {
    for (let i = 0; i < Math.min(2, seededDrives.length); i++) {
      const drive = seededDrives[i];
      const existing = await PlacementApplication.findOne({ placement: drive._id, student: student._id });
      if (!existing) {
        const deptCode = student.academicProfile?.department ? student.academicProfile.department.slice(0, 2).toUpperCase() : 'CS';
        const ticketNumber = `TKT-${new Date().getFullYear()}-${deptCode}-${Math.floor(1000 + Math.random() * 9000)}`;
        const stages = ['Registered', 'Shortlisted', 'Assessment Round', 'Technical Interview'];
        const stage = stages[Math.floor(Math.random() * stages.length)];

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
            { stage: 'Registered', updatedAt: new Date(Date.now() - 86400000 * 3), notes: 'Student application submitted' },
            { stage: stage, updatedAt: new Date(), notes: 'Audited by placement cell' }
          ]
        });
        console.log(`[Seed Ticket]: ${ticketNumber} (${student.name} -> ${drive.companyName})`);
      }
    }
  }

  console.log('[Seed]: All collections populated successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('[Seed Error]:', err);
  process.exit(1);
});
