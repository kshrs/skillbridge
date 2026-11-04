import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Course from './models/Course.js';
import Enrollment from './models/Enrollment.js';
import Assessment from './models/Assessment.js';
import AssessmentResult from './models/AssessmentResult.js';
import Placement from './models/Placement.js';
import PlacementApplication from './models/PlacementApplication.js';
import Message from './models/Message.js';
import Job from './models/Job.js';
import Mentor from './models/Mentor.js';

dotenv.config();

// Helper to generate 365-day realistic learning heatmap activity
const generateYearlyActivity = () => {
  const activities = [];
  const now = new Date();
  for (let i = 365; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    
    // Create authentic learning patterns (more active on weekdays, streaks)
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const rand = Math.random();

    let count = 0;
    if (isWeekend) {
      if (rand > 0.45) count = Math.floor(Math.random() * 5) + 1; // 1-5
    } else {
      if (rand > 0.25) count = Math.floor(Math.random() * 8) + 2; // 2-9
    }

    if (count > 0) {
      activities.push({
        date: dateStr,
        count,
        details: [
          { type: 'lecture_watch', at: d },
          { type: 'quiz_attempt', at: d }
        ]
      });
    }
  }
  return activities;
};

export const COURSES_CATALOG = [
  // 1. Stanford Online
  {
    title: 'CS224N: Natural Language Processing with Deep Learning',
    code: 'CS224N',
    university: 'Stanford Online',
    instructor: 'Prof. Christopher Manning',
    description: 'Premier university lecture series covering word embeddings, transformer architectures, self-attention, and large language models (LLMs).',
    category: 'Artificial Intelligence',
    difficulty: 'Advanced',
    durationHours: 42,
    rating: 4.9,
    enrolledCount: 1840,
    skillsCovered: ['Natural Language Processing', 'PyTorch', 'Transformers', 'Self-Attention', 'Hugging Face', 'Word2Vec'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'cs224n-m1',
        title: 'Word Vectors, SVD, and Word2Vec',
        description: 'Foundations of natural language representations, singular value decomposition, continuous skip-gram, and negative sampling.',
        skillsLearned: ['Word2Vec', 'Vector Semantics', 'Cosine Distance'],
        lectures: [
          {
            lectureId: 'cs224n-l1',
            title: 'Lecture 1: Introduction and Word Vectors',
            youtubeVideoId: 'rmVRLeJRkl4',
            youtubeUrl: 'https://www.youtube.com/watch?v=rmVRLeJRkl4',
            durationSeconds: 4800,
            summary: 'Deep dive into distributional semantics and word vector objective functions.'
          },
          {
            lectureId: 'cs224n-l2',
            title: 'Lecture 2: Neural Classifiers & Backpropagation',
            youtubeVideoId: 'gqaHkPEZAew',
            youtubeUrl: 'https://www.youtube.com/watch?v=gqaHkPEZAew',
            durationSeconds: 4920,
            summary: 'Cross-entropy loss, gradient descent, and computational graphs for text classification.'
          }
        ]
      },
      {
        moduleId: 'cs224n-m2',
        title: 'Recurrent Neural Networks and Language Models',
        description: 'Sequence modeling, vanishing/exploding gradients, GRUs, LSTMs, and modern attention foundations.',
        skillsLearned: ['LSTM', 'GRU', 'Sequence Modeling'],
        lectures: [
          {
            lectureId: 'cs224n-l3',
            title: 'Lecture 6: Simple and LSTM RNNs',
            youtubeVideoId: '0LixOH96snY',
            youtubeUrl: 'https://www.youtube.com/watch?v=0LixOH96snY',
            durationSeconds: 4700,
            summary: 'How gated recurrent units and cell memory gates solve temporal degradation.'
          },
          {
            lectureId: 'cs224n-l4',
            title: 'Lecture 7: Translation, Seq2Seq, and Attention',
            youtubeVideoId: 'XXtpJxZBa2c',
            youtubeUrl: 'https://www.youtube.com/watch?v=XXtpJxZBa2c',
            durationSeconds: 5100,
            summary: 'Bahdanau additive attention and scaled dot-product attention architectures.'
          }
        ]
      },
      {
        moduleId: 'cs224n-m3',
        title: 'Transformers, Self-Attention, and Pre-trained LLMs',
        description: 'Multi-head self-attention mechanisms, positional encodings, BERT, GPT, and modern fine-tuning.',
        skillsLearned: ['Transformers', 'Multi-Head Attention', 'BERT', 'GPT'],
        lectures: [
          {
            lectureId: 'cs224n-l5',
            title: 'Lecture 9: Transformers and Large Language Models',
            youtubeVideoId: 'ptuGllU5SQQ',
            youtubeUrl: 'https://www.youtube.com/watch?v=ptuGllU5SQQ',
            durationSeconds: 5040,
            summary: 'The Transformer architecture (Vaswani et al.) and pre-training objectives.'
          }
        ]
      }
    ]
  },
  {
    title: 'CS229: Machine Learning',
    code: 'CS229',
    university: 'Stanford Online',
    instructor: 'Prof. Andrew Ng',
    description: 'The definitive foundational machine learning course covering supervised learning, SVMs, kernels, neural networks, unsupervised clustering, and learning theory.',
    category: 'Machine Learning',
    difficulty: 'Intermediate',
    durationHours: 48,
    rating: 4.95,
    enrolledCount: 3120,
    skillsCovered: ['Machine Learning', 'Linear Algebra', 'Gradient Descent', 'SVM', 'Logistic Regression', 'PCA'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'cs229-m1',
        title: 'Supervised Learning & Linear Regression',
        description: 'Linear regression, normal equations, gradient descent convergence, and probabilistic interpretations.',
        skillsLearned: ['Linear Regression', 'Batch Gradient Descent'],
        lectures: [
          {
            lectureId: 'cs229-l1',
            title: 'Lecture 1: Introduction and Course Logistics',
            youtubeVideoId: 'jGwO_UgTS7I',
            youtubeUrl: 'https://www.youtube.com/watch?v=jGwO_UgTS7I',
            durationSeconds: 4620,
            summary: 'Supervised vs. unsupervised paradigms and linear model formulation.'
          },
          {
            lectureId: 'cs229-l2',
            title: 'Lecture 2: Linear Regression and Gradient Descent',
            youtubeVideoId: '4b4MUYve_U8',
            youtubeUrl: 'https://www.youtube.com/watch?v=4b4MUYve_U8',
            durationSeconds: 4810,
            summary: 'Mathematical derivation of MSE minimization and stochastic updates.'
          }
        ]
      },
      {
        moduleId: 'cs229-m2',
        title: 'Support Vector Machines & Kernel Methods',
        description: 'Functional and geometric margins, Lagrange duality, Karush-Kuhn-Tucker conditions, and kernel tricks.',
        skillsLearned: ['Support Vector Machines', 'Kernel Trick', 'Optimization'],
        lectures: [
          {
            lectureId: 'cs229-l3',
            title: 'Lecture 6: Support Vector Machines & Duality',
            youtubeVideoId: 'lDwow4aOrtg',
            youtubeUrl: 'https://www.youtube.com/watch?v=lDwow4aOrtg',
            durationSeconds: 4750,
            summary: 'Maximum margin hyperplanes and dual optimization formulations.'
          }
        ]
      }
    ]
  },
  {
    title: 'CS231N: Deep Learning for Computer Vision',
    code: 'CS231N',
    university: 'Stanford Online',
    instructor: 'Prof. Fei-Fei Li & Justin Johnson',
    description: 'Image classification, convolutional architectures (AlexNet, VGG, ResNet), object detection, and generative vision models.',
    category: 'Computer Vision',
    difficulty: 'Advanced',
    durationHours: 38,
    rating: 4.88,
    enrolledCount: 1650,
    skillsCovered: ['Computer Vision', 'Convolutional Networks', 'ResNet', 'Object Detection', 'PyTorch'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'cs231n-m1',
        title: 'Image Classification Pipeline & ConvNets',
        description: 'From k-nearest neighbors and linear classifiers to convolutional layers, pooling, and spatial receptive fields.',
        skillsLearned: ['CNNs', 'Convolution Filters', 'Pooling'],
        lectures: [
          {
            lectureId: 'cs231n-l1',
            title: 'Lecture 1: Introduction to Computer Vision',
            youtubeVideoId: 'vT1JzLTH4G4',
            youtubeUrl: 'https://www.youtube.com/watch?v=vT1JzLTH4G4',
            durationSeconds: 4200,
            summary: 'Historical overview of visual recognition from block worlds to deep learning.'
          },
          {
            lectureId: 'cs231n-l2',
            title: 'Lecture 5: Convolutional Neural Networks',
            youtubeVideoId: 'bNb2fEVKeEo',
            youtubeUrl: 'https://www.youtube.com/watch?v=bNb2fEVKeEo',
            durationSeconds: 4680,
            summary: 'Kernel convolutions, stride, padding, and feature map dimensions.'
          }
        ]
      },
      {
        moduleId: 'cs231n-m2',
        title: 'Training Networks & Deep Recognition',
        description: 'Residual connections (ResNet), Batch Normalization, Adam optimizer, and object detection.',
        skillsLearned: ['ResNet', 'Object Detection', 'Batch Norm'],
        lectures: [
          {
            lectureId: 'cs231n-l3',
            title: 'Lecture 7: Training Neural Networks II',
            youtubeVideoId: 'u6aEYuemt0M',
            youtubeUrl: 'https://www.youtube.com/watch?v=u6aEYuemt0M',
            durationSeconds: 4800,
            summary: 'Weight initialization, learning rate annealing, and hyperparameter search.'
          },
          {
            lectureId: 'cs231n-l4',
            title: 'Lecture 9: Spatial Detection and Region Proposals',
            youtubeVideoId: 'd14Q7f04N3o',
            youtubeUrl: 'https://www.youtube.com/watch?v=d14Q7f04N3o',
            durationSeconds: 5100,
            summary: 'Faster R-CNN, anchor bounding boxes, and Feature Pyramid Networks.'
          }
        ]
      }
    ]
  },
  {
    title: 'CS234: Reinforcement Learning',
    code: 'CS234',
    university: 'Stanford Online',
    instructor: 'Prof. Emma Brunskill',
    description: 'Markov decision processes, value iteration, policy gradients, deep Q-networks (DQN), and actor-critic methods.',
    category: 'Reinforcement Learning',
    difficulty: 'Advanced',
    durationHours: 35,
    rating: 4.82,
    enrolledCount: 920,
    skillsCovered: ['Reinforcement Learning', 'Markov Decision Processes', 'Q-Learning', 'Policy Gradients'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'cs234-m1',
        title: 'MDPs & Dynamic Programming',
        description: 'Bellman equations, policy evaluation, and value iteration algorithms.',
        skillsLearned: ['Bellman Equation', 'Policy Iteration'],
        lectures: [
          {
            lectureId: 'cs234-l1',
            title: 'Lecture 1: Introduction to Reinforcement Learning',
            youtubeVideoId: 'FgzM3zpZ55o',
            youtubeUrl: 'https://www.youtube.com/watch?v=FgzM3zpZ55o',
            durationSeconds: 4320,
            summary: 'Exploration vs. exploitation, agent-environment loop, and reward hypotheses.'
          },
          {
            lectureId: 'cs234-l2',
            title: 'Lecture 2: Given an MDP, What Can We Do?',
            youtubeVideoId: '9g32v7vzk24',
            youtubeUrl: 'https://www.youtube.com/watch?v=9g32v7vzk24',
            durationSeconds: 4500,
            summary: 'Exact dynamic programming methods, contraction mapping theorem, and value convergence.'
          }
        ]
      },
      {
        moduleId: 'cs234-m2',
        title: 'Model-Free Control & Deep Q-Learning',
        description: 'Temporal difference learning, SARSA, Q-learning, replay buffers, and target networks.',
        skillsLearned: ['Q-Learning', 'DQN', 'Policy Gradients'],
        lectures: [
          {
            lectureId: 'cs234-l3',
            title: 'Lecture 4: Model-Free Control & Temporal Difference',
            youtubeVideoId: '_n8d5GZ4t1w',
            youtubeUrl: 'https://www.youtube.com/watch?v=_n8d5GZ4t1w',
            durationSeconds: 4620,
            summary: 'TD(0), on-policy vs off-policy algorithms, and epsilon-greedy exploration bounds.'
          }
        ]
      }
    ]
  },
  {
    title: 'CS25: Transformers United',
    code: 'CS25',
    university: 'Stanford Online',
    instructor: 'Stanford AI Lab Guest Seminars',
    description: 'In-depth seminar series examining modern applications of Transformers across language, vision, robotics, biology, and multimodal AI.',
    category: 'Artificial Intelligence',
    difficulty: 'Advanced',
    durationHours: 28,
    rating: 4.93,
    enrolledCount: 1410,
    skillsCovered: ['Transformers', 'LLM Architectures', 'Diffusion Models', 'Multimodal AI'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'cs25-m1',
        title: 'Modern Transformer Breakthroughs',
        description: 'Architectural innovations, self-attention scalability, and mixture of experts (MoE).',
        skillsLearned: ['FlashAttention', 'Mixture of Experts'],
        lectures: [
          {
            lectureId: 'cs25-l1',
            title: 'CS25 Lecture 1: Attention is All You Need',
            youtubeVideoId: 'XfpMkf4rD6E',
            youtubeUrl: 'https://www.youtube.com/watch?v=XfpMkf4rD6E',
            durationSeconds: 4500,
            summary: 'Dissecting self-attention mechanics and cross-domain scalability.'
          },
          {
            lectureId: 'cs25-l2',
            title: 'CS25 Lecture 2: Vision Transformers (ViT) & Multimodal AI',
            youtubeVideoId: 'g2brErS20U8',
            youtubeUrl: 'https://www.youtube.com/watch?v=g2brErS20U8',
            durationSeconds: 4800,
            summary: 'Patch tokenization, linear projection, and cross-attention architectures.'
          }
        ]
      },
      {
        moduleId: 'cs25-m2',
        title: 'Scaling Laws & Code Generation Models',
        description: 'Chinchilla scaling, inference optimization, speculative decoding, and code synthesis LLMs.',
        skillsLearned: ['Scaling Laws', 'Inference Optimization'],
        lectures: [
          {
            lectureId: 'cs25-l3',
            title: 'CS25 Lecture 3: Transformers for Code and Logic',
            youtubeVideoId: 'Zv3pC71_K2M',
            youtubeUrl: 'https://www.youtube.com/watch?v=Zv3pC71_K2M',
            durationSeconds: 4700,
            summary: 'Abstract syntax tree parsing with transformer attention mechanisms.'
          }
        ]
      }
    ]
  },
  {
    title: '6.006: Introduction to Algorithms',
    code: '6.006',
    university: 'MIT OpenCourseWare',
    instructor: 'Prof. Erik Demaine & Prof. Srini Devadas',
    description: 'Mathematical algorithmic analysis, sorting (Merge, Heap), binary search trees, AVL trees, hashing, graph search (BFS, DFS, Dijkstra), and dynamic programming.',
    category: 'Computer Science Core',
    difficulty: 'Intermediate',
    durationHours: 45,
    rating: 4.96,
    enrolledCount: 4200,
    skillsCovered: ['Data Structures', 'Algorithms', 'Dynamic Programming', 'Graph Theory', 'Asymptotic Analysis', 'Python'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1516116211227-bbc04f141446?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'mit-6006-m1',
        title: 'Algorithmic Thinking & Peak Finding',
        description: 'Asymptotic notation, recurrence relations, and 1D/2D peak finding algorithms.',
        skillsLearned: ['Asymptotic Analysis', 'Divide and Conquer'],
        lectures: [
          {
            lectureId: 'mit-6006-l1',
            title: 'Lecture 1: Algorithmic Thinking, Peak Finding',
            youtubeVideoId: 'HtSuA80QTyo',
            youtubeUrl: 'https://www.youtube.com/watch?v=HtSuA80QTyo',
            durationSeconds: 3180,
            summary: 'Comparing O(n) linear scan vs. O(log n) divide-and-conquer on 2D arrays.'
          },
          {
            lectureId: 'mit-6006-l2',
            title: 'Lecture 2: Models of Computation, Document Distance',
            youtubeVideoId: 'Zc54gFhdpLA',
            youtubeUrl: 'https://www.youtube.com/watch?v=Zc54gFhdpLA',
            durationSeconds: 3000,
            summary: 'Word frequency histograms and dot product distance in Python.'
          }
        ]
      },
      {
        moduleId: 'mit-6006-m2',
        title: 'Graph Traversal & Shortest Paths',
        description: 'Breadth-first search, depth-first search, DAG topological sorting, and Dijkstra shortest paths.',
        skillsLearned: ['BFS', 'DFS', 'Dijkstra', 'Topological Sort'],
        lectures: [
          {
            lectureId: 'mit-6006-l3',
            title: 'Lecture 13: Breadth-First Search (BFS)',
            youtubeVideoId: 's-CYnVz-uh4',
            youtubeUrl: 'https://www.youtube.com/watch?v=s-CYnVz-uh4',
            durationSeconds: 3120,
            summary: 'Queue-based shortest path search on unweighted graphs.'
          },
          {
            lectureId: 'mit-6006-l4',
            title: 'Lecture 16: Dijkstra',
            youtubeVideoId: '2E7MmKv0Y24',
            youtubeUrl: 'https://www.youtube.com/watch?v=2E7MmKv0Y24',
            durationSeconds: 3240,
            summary: 'Priority queues and relaxation steps on positive edge-weighted graphs.'
          }
        ]
      },
      {
        moduleId: 'mit-6006-m3',
        title: 'Dynamic Programming Foundations',
        description: 'Memoization, bottom-up subproblem DAGs, Fibonacci, shortest paths, and knapsack problem.',
        skillsLearned: ['Dynamic Programming', 'Memoization', 'Knapsack'],
        lectures: [
          {
            lectureId: 'mit-6006-l5',
            title: 'Lecture 19: Dynamic Programming I: Fibonacci, Shortest Paths',
            youtubeVideoId: 'OQ5jsbhAv_M',
            youtubeUrl: 'https://www.youtube.com/watch?v=OQ5jsbhAv_M',
            durationSeconds: 3180,
            summary: 'Decomposing optimal substructure into memoized subproblem DAGs.'
          }
        ]
      }
    ]
  },
  {
    title: '6.S191: Introduction to Deep Learning',
    code: '6.S191',
    university: 'MIT',
    instructor: 'Alexander Amini & Ava Soleimany',
    description: 'MIT premier official introductory course on deep learning methods and applications in NLP, vision, biology, robotics, and generative AI.',
    category: 'Deep Learning',
    difficulty: 'Beginner-Intermediate',
    durationHours: 24,
    rating: 4.97,
    enrolledCount: 3800,
    skillsCovered: ['Deep Learning', 'Neural Networks', 'TensorFlow', 'PyTorch', 'Generative AI'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'mit-6s191-m1',
        title: 'Deep Learning Foundations & Perceptrons',
        description: 'Biological inspiration, activation functions, loss surfaces, and backpropagation mechanics.',
        skillsLearned: ['Perceptrons', 'Backpropagation', 'Loss Functions'],
        lectures: [
          {
            lectureId: 'mit-6s191-l1',
            title: 'Lecture 1: Intro to Deep Learning (2024)',
            youtubeVideoId: '7sB052Pz0s8',
            youtubeUrl: 'https://www.youtube.com/watch?v=7sB052Pz0s8',
            durationSeconds: 3000,
            summary: 'Foundations of artificial neural networks and optimization landscapes.'
          },
          {
            lectureId: 'mit-6s191-l2',
            title: 'Lecture 2: Recurrent Neural Networks, Transformers & Attention',
            youtubeVideoId: 'ySEx_Bqxvpg',
            youtubeUrl: 'https://www.youtube.com/watch?v=ySEx_Bqxvpg',
            durationSeconds: 2900,
            summary: 'Sequential memory processing and the transition to self-attention.'
          }
        ]
      }
    ]
  },
  {
    title: '18.06: Linear Algebra with Gilbert Strang',
    code: '18.06',
    university: 'MIT OpenCourseWare',
    instructor: 'Prof. Gilbert Strang',
    description: 'The legendary linear algebra lecture series. Matrix arithmetic, vector spaces, nullspace, eigenvalues, eigenvectors, and singular value decomposition (SVD).',
    category: 'Mathematics & Theory',
    difficulty: 'Intermediate',
    durationHours: 35,
    rating: 4.99,
    enrolledCount: 5200,
    skillsCovered: ['Linear Algebra', 'Eigenvalues', 'Singular Value Decomposition', 'Matrix Factorization'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'mit-1806-m1',
        title: 'The Geometry of Linear Equations & Four Subspaces',
        description: 'Row and column pictures, elimination with matrices, column space, and nullspace.',
        skillsLearned: ['Vector Spaces', 'Nullspace', 'Matrix Elimination'],
        lectures: [
          {
            lectureId: 'mit-1806-l1',
            title: 'Lecture 1: The Geometry of Linear Equations',
            youtubeVideoId: '7UJ4CFRGd-U',
            youtubeUrl: 'https://www.youtube.com/watch?v=7UJ4CFRGd-U',
            durationSeconds: 2400,
            summary: 'Row versus column representation of linear systems of equations.'
          },
          {
            lectureId: 'mit-1806-l2',
            title: 'Lecture 29: Singular Value Decomposition (SVD)',
            youtubeVideoId: 'Nx0lRdfU1_A',
            youtubeUrl: 'https://www.youtube.com/watch?v=Nx0lRdfU1_A',
            durationSeconds: 2700,
            summary: 'Factorization A = U Sigma V^T and its geometric transformation.'
          }
        ]
      }
    ]
  },
  {
    title: '6.0001: Introduction to Computer Science and Programming in Python',
    code: '6.0001',
    university: 'MIT OpenCourseWare',
    instructor: 'Prof. Eric Grimson & Dr. Ana Bell',
    description: 'Foundations of computational thinking, Python semantics, branching, iteration, functions, recursion, OOP, and computational complexity.',
    category: 'Computer Science Core',
    difficulty: 'Beginner',
    durationHours: 25,
    rating: 4.89,
    enrolledCount: 3950,
    skillsCovered: ['Python', 'Computational Thinking', 'Object-Oriented Programming', 'Recursion'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'mit-60001-m1',
        title: 'Computation & Branching in Python',
        description: 'Variables, data types, booleans, loops, and approximate solutions.',
        skillsLearned: ['Python Basics', 'Control Flow'],
        lectures: [
          {
            lectureId: 'mit-60001-l1',
            title: 'Lecture 1: What is Computation?',
            youtubeVideoId: 'nykOeWgQcHM',
            youtubeUrl: 'https://www.youtube.com/watch?v=nykOeWgQcHM',
            durationSeconds: 3100,
            summary: 'Von Neumann architectures, declarative vs imperative knowledge, Python syntax.'
          }
        ]
      }
    ]
  },
  {
    title: '6.046J: Design and Analysis of Algorithms',
    code: '6.046J',
    university: 'MIT OpenCourseWare',
    instructor: 'Prof. Erik Demaine & Prof. Srini Devadas',
    description: 'Advanced algorithm techniques: randomized algorithms, amortization, divide and conquer recurrences, min-cut, and NP-completeness.',
    category: 'Computer Science Core',
    difficulty: 'Advanced',
    durationHours: 40,
    rating: 4.91,
    enrolledCount: 1540,
    skillsCovered: ['Advanced Algorithms', 'Randomized Algorithms', 'Amortized Analysis', 'NP-Completeness'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'mit-6046-m1',
        title: 'Divide and Conquer & Strassen Matrix Multiplication',
        description: 'Analyzing recurrences via Master Theorem and sub-cubic matrix products.',
        skillsLearned: ['Divide and Conquer', 'Master Theorem'],
        lectures: [
          {
            lectureId: 'mit-6046-l1',
            title: 'Lecture 1: Course Overview, Interval Scheduling',
            youtubeVideoId: '2rkq991o7hE',
            youtubeUrl: 'https://www.youtube.com/watch?v=2rkq991o7hE',
            durationSeconds: 3200,
            summary: 'Greedy algorithms, exchange arguments, and optimal scheduling.'
          }
        ]
      }
    ]
  },
  {
    title: '6.004: Computation Structures',
    code: '6.004',
    university: 'MIT OpenCourseWare',
    instructor: 'Prof. Chris Terman',
    description: 'Digital logic, gate-level architecture, RISC instruction sets, pipelining, cache memory hierarchies, and virtual memory.',
    category: 'Computer Systems',
    difficulty: 'Intermediate',
    durationHours: 36,
    rating: 4.86,
    enrolledCount: 1120,
    skillsCovered: ['Computer Architecture', 'RISC-V', 'Pipelining', 'Memory Hierarchy', 'Caches'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'mit-6004-m1',
        title: 'Digital Circuits & ALU Design',
        description: 'Logic gates, truth tables, adders, and arithmetic logic units.',
        skillsLearned: ['Digital Logic', 'ALU Design'],
        lectures: [
          {
            lectureId: 'mit-6004-l1',
            title: 'Lecture 1: The Digital Abstraction',
            youtubeVideoId: '1iT_Z_O3eQc',
            youtubeUrl: 'https://www.youtube.com/watch?v=1iT_Z_O3eQc',
            durationSeconds: 3000,
            summary: 'Voltage thresholds, noise margins, and Boolean algebra foundations.'
          }
        ]
      }
    ]
  },

  // 3. Harvard University (CS50)
  {
    title: 'CS50x: Introduction to Computer Science',
    code: 'CS50x',
    university: 'Harvard University',
    instructor: 'Prof. David J. Malan',
    description: 'The world-renowned introduction to computer science and programming using C, Python, SQL, and Web.',
    category: 'Computer Science Core',
    difficulty: 'Beginner',
    durationHours: 50,
    rating: 4.98,
    enrolledCount: 6500,
    skillsCovered: ['C', 'Memory Management', 'Pointers', 'Data Structures', 'Python', 'SQL', 'Algorithms'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'cs50-m1',
        title: 'Computational Thinking & C Language',
        description: 'Binary, ASCII, algorithms, conditional branching, loops, and compilation pipelines.',
        skillsLearned: ['C', 'Compilation', 'Logic'],
        lectures: [
          {
            lectureId: 'cs50-l1',
            title: 'CS50 2024 - Lecture 0: Computational Thinking & Scratch',
            youtubeVideoId: '4AopTj3vT0c',
            youtubeUrl: 'https://www.youtube.com/watch?v=4AopTj3vT0c',
            durationSeconds: 5200,
            summary: 'Binary, algorithms, pseudocode, and problem decomposition.'
          },
          {
            lectureId: 'cs50-l2',
            title: 'CS50 2024 - Lecture 1: C Programming Language',
            youtubeVideoId: 'F9-yqOOqbyE',
            youtubeUrl: 'https://www.youtube.com/watch?v=F9-yqOOqbyE',
            durationSeconds: 5100,
            summary: 'Data types, format specifiers, operators, and functions in C.'
          }
        ]
      },
      {
        moduleId: 'cs50-m2',
        title: 'Memory, Pointers & Data Structures',
        description: 'Pointer arithmetic, heap allocation, call stack, linked lists, hash tables, and trie trees.',
        skillsLearned: ['Pointers', 'Dynamic Memory', 'Hash Tables'],
        lectures: [
          {
            lectureId: 'cs50-l3',
            title: 'CS50 2024 - Lecture 4: Memory and Pointers',
            youtubeVideoId: 'F9-yqOOqbyE',
            youtubeUrl: 'https://www.youtube.com/watch?v=F9-yqOOqbyE',
            durationSeconds: 5400,
            summary: 'Hexadecimal, memory layout, addresses, malloc, free, and valgrind.'
          },
          {
            lectureId: 'cs50-l4',
            title: 'CS50 2024 - Lecture 5: Data Structures in C',
            youtubeVideoId: 'YoXxevCrbNw',
            youtubeUrl: 'https://www.youtube.com/watch?v=YoXxevCrbNw',
            durationSeconds: 5300,
            summary: 'Custom structs, self-referential pointers, linked list traversal, and BST insertion.'
          }
        ]
      }
    ]
  },
  {
    title: 'CS50W: Web Programming with Python and JavaScript',
    code: 'CS50W',
    university: 'Harvard University',
    instructor: 'Brian Yu & Prof. David J. Malan',
    description: 'Full-stack application engineering using Django, JavaScript, REST APIs, Git, database schemas, responsive UI, and CI/CD pipelines.',
    category: 'Full Stack Development',
    difficulty: 'Intermediate',
    durationHours: 38,
    rating: 4.92,
    enrolledCount: 3200,
    skillsCovered: ['Django', 'Python', 'JavaScript', 'REST APIs', 'SQL', 'Git', 'HTML5 & CSS3'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'cs50w-m1',
        title: 'Django, Models, and Migrations',
        description: 'Building server-rendered applications, relational schemas, ORM queries, and user authentication.',
        skillsLearned: ['Django', 'Database Migrations', 'User Auth'],
        lectures: [
          {
            lectureId: 'cs50w-l1',
            title: 'CS50W - Lecture 3: Django & Web Architecture',
            youtubeVideoId: 'w8q0C-C1js4',
            youtubeUrl: 'https://www.youtube.com/watch?v=w8q0C-C1js4',
            durationSeconds: 4900,
            summary: 'Routes, views, templates, and model-view-controller patterns in Python.'
          }
        ]
      }
    ]
  },
  {
    title: 'CS50AI: Introduction to Artificial Intelligence with Python',
    code: 'CS50AI',
    university: 'Harvard University',
    instructor: 'Brian Yu & Prof. David J. Malan',
    description: 'Graph search algorithms, minimax, constraint satisfaction, propositional logic, Bayesian networks, Markov models, and deep learning.',
    category: 'Artificial Intelligence',
    difficulty: 'Intermediate',
    durationHours: 32,
    rating: 4.9,
    enrolledCount: 2800,
    skillsCovered: ['Artificial Intelligence', 'Minimax', 'Knowledge Graphs', 'Probabilistic Reasoning', 'Python'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'cs50ai-m1',
        title: 'Search Algorithms & Adversarial Games',
        description: 'Depth-first search, breadth-first search, A* heuristic search, and Alpha-Beta minimax pruning.',
        skillsLearned: ['A* Search', 'Minimax', 'Heuristics'],
        lectures: [
          {
            lectureId: 'cs50ai-l1',
            title: 'CS50 AI - Lecture 0: Search',
            youtubeVideoId: 'WbzNPA3dUv8',
            youtubeUrl: 'https://www.youtube.com/watch?v=WbzNPA3dUv8',
            durationSeconds: 4800,
            summary: 'State space representation, frontiers, and optimal heuristic cost estimation.'
          }
        ]
      }
    ]
  },

  // 4. UC Berkeley
  {
    title: 'CS 61A: Structure and Interpretation of Computer Programs',
    code: 'CS61A',
    university: 'UC Berkeley',
    instructor: 'Prof. John DeNero',
    description: 'Functional programming, higher-order functions, recursion, lambda expressions, interpreters, streams, and software architecture.',
    category: 'Computer Science Core',
    difficulty: 'Intermediate',
    durationHours: 42,
    rating: 4.94,
    enrolledCount: 2900,
    skillsCovered: ['Functional Programming', 'Python', 'Scheme', 'Recursion', 'Interpreters'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'ucb-61a-m1',
        title: 'Functions & Higher-Order Abstractions',
        description: 'First-class functions, closures, environment diagrams, and recursion trees.',
        skillsLearned: ['Higher Order Functions', 'Closures'],
        lectures: [
          {
            lectureId: 'ucb-61a-l1',
            title: 'CS 61A: Welcome & Higher Order Functions',
            youtubeVideoId: 'Sg48y9h6WpI',
            youtubeUrl: 'https://www.youtube.com/watch?v=Sg48y9h6WpI',
            durationSeconds: 3000,
            summary: 'Functions as arguments and return values in clean computational models.'
          }
        ]
      }
    ]
  },
  {
    title: 'CS 61B: Data Structures & Algorithms',
    code: 'CS61B',
    university: 'UC Berkeley',
    instructor: 'Prof. Josh Hug',
    description: 'Object-oriented programming in Java, abstract data types, balanced search trees (Red-Black / 2-3 Trees), heaps, graphs, and sorting.',
    category: 'Data Structures',
    difficulty: 'Intermediate',
    durationHours: 44,
    rating: 4.96,
    enrolledCount: 3400,
    skillsCovered: ['Java', 'Data Structures', 'Red-Black Trees', 'Graph Algorithms', 'Asymptotic Complexity'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'ucb-61b-m1',
        title: 'Lists, Trees & Balanced Data Structures',
        description: 'Linked lists, array resizing, binary search trees, and self-balancing Red-Black trees.',
        skillsLearned: ['Java', 'Red-Black Trees', 'Hash Tables'],
        lectures: [
          {
            lectureId: 'ucb-61b-l1',
            title: 'CS 61B: Introduction to Java and Data Structures',
            youtubeVideoId: 'B31LgI4Y4DQ',
            youtubeUrl: 'https://www.youtube.com/watch?v=B31LgI4Y4DQ',
            durationSeconds: 3100,
            summary: 'Java typing system, pointers, and memory layout.'
          }
        ]
      }
    ]
  },
  {
    title: 'CS 61C: Great Ideas in Computer Architecture',
    code: 'CS61C',
    university: 'UC Berkeley',
    instructor: 'Prof. Dan Garcia & Prof. Borivoje Nikolic',
    description: 'C programming, RISC-V assembly, parallelism, caching, memory-mapped I/O, pipelining, and datacenter scale computing.',
    category: 'Computer Systems',
    difficulty: 'Advanced',
    durationHours: 40,
    rating: 4.88,
    enrolledCount: 1800,
    skillsCovered: ['C', 'RISC-V', 'Assembly', 'Parallelism', 'OpenMP', 'Computer Architecture'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'ucb-61c-m1',
        title: 'C, Pointers & Memory Management',
        description: 'Hardware abstractions, pointers in C, and dynamic heap allocators.',
        skillsLearned: ['C', 'Memory Safety', 'RISC-V'],
        lectures: [
          {
            lectureId: 'ucb-61c-l1',
            title: 'CS 61C: Introduction to Computer Architecture',
            youtubeVideoId: '3U824Wc2tX0',
            youtubeUrl: 'https://www.youtube.com/watch?v=3U824Wc2tX0',
            durationSeconds: 3200,
            summary: 'The 6 great ideas in computer architecture and Moore Law dynamics.'
          }
        ]
      }
    ]
  },

  // 5. Stanford & Top Institutions Continued
  {
    title: 'CS106B: Programming Abstractions in C++',
    code: 'CS106B',
    university: 'Stanford Online',
    instructor: 'Prof. Julie Zelenski',
    description: 'Advanced data structures, recursive backtracking, object-oriented design, Big-O complexity, and memory management in modern C++.',
    category: 'Software Engineering',
    difficulty: 'Intermediate',
    durationHours: 36,
    rating: 4.89,
    enrolledCount: 2200,
    skillsCovered: ['C++', 'Recursive Backtracking', 'Pointers', 'Data Structures', 'OOP'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'cs106b-m1',
        title: 'C++ Collections & Recursion',
        description: 'Vectors, Grids, Sets, Maps, recursive generation, and fractal drawing.',
        skillsLearned: ['C++', 'Recursion'],
        lectures: [
          {
            lectureId: 'cs106b-l1',
            title: 'CS106B: Lecture 1 - Programming Abstractions in C++',
            youtubeVideoId: 'uX2sP9VkvG8',
            youtubeUrl: 'https://www.youtube.com/watch?v=uX2sP9VkvG8',
            durationSeconds: 3000,
            summary: 'Transitioning to systems-level C++ paradigms.'
          }
        ]
      }
    ]
  },
  {
    title: 'CS149: Parallel Computing',
    code: 'CS149',
    university: 'Stanford Online',
    instructor: 'Prof. Kayvon Fatahalian',
    description: 'Hardware multi-threading, SIMD execution, GPU programming with CUDA, cache coherence, and parallel algorithmic patterns.',
    category: 'High Performance Computing',
    difficulty: 'Advanced',
    durationHours: 34,
    rating: 4.95,
    enrolledCount: 1350,
    skillsCovered: ['CUDA', 'Parallel Computing', 'GPU Programming', 'C++', 'Multithreading'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'cs149-m1',
        title: 'Multi-Core Architectures & CUDA Programming',
        description: 'Thread blocks, warp divergence, shared memory, and GPU kernel optimization.',
        skillsLearned: ['CUDA', 'SIMD', 'GPU Acceleration'],
        lectures: [
          {
            lectureId: 'cs149-l1',
            title: 'CS149: Lecture 1 - Why Parallelism Matters',
            youtubeVideoId: 'u4r7p33hK-4',
            youtubeUrl: 'https://www.youtube.com/watch?v=u4r7p33hK-4',
            durationSeconds: 3200,
            summary: 'Power wall, multi-core scaling, and modern GPU architectures.'
          }
        ]
      }
    ]
  },
  {
    title: 'CS221: Artificial Intelligence: Principles and Techniques',
    code: 'CS221',
    university: 'Stanford Online',
    instructor: 'Prof. Percy Liang',
    description: 'Search algorithms, constraint satisfaction, Markov networks, Bayesian inference, reinforcement learning, and logic reasoning systems.',
    category: 'Artificial Intelligence',
    difficulty: 'Intermediate-Advanced',
    durationHours: 38,
    rating: 4.9,
    enrolledCount: 1980,
    skillsCovered: ['Artificial Intelligence', 'Bayesian Networks', 'Reinforcement Learning', 'Logic', 'Search'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'cs221-m1',
        title: 'Search & Constraint Satisfaction',
        description: 'Tree search, dynamic programming on graphs, and backtracking search with heuristics.',
        skillsLearned: ['Graph Search', 'Constraint Satisfaction'],
        lectures: [
          {
            lectureId: 'cs221-l1',
            title: 'CS221: Overview of AI Systems',
            youtubeVideoId: 'yv_c3F-VzYc',
            youtubeUrl: 'https://www.youtube.com/watch?v=yv_c3F-VzYc',
            durationSeconds: 3300,
            summary: 'Reflex models, state-based models, and variable-based models.'
          }
        ]
      }
    ]
  },
  {
    title: 'CS193P: Developing Applications for iOS with SwiftUI',
    code: 'CS193P',
    university: 'Stanford Online',
    instructor: 'Paul Hegarty',
    description: 'Native mobile app development using Apple Swift and SwiftUI. Declarative UI, MVVM architecture, animation, gestures, and Core Data.',
    category: 'Mobile Development',
    difficulty: 'Intermediate',
    durationHours: 30,
    rating: 4.94,
    enrolledCount: 2400,
    skillsCovered: ['Swift', 'SwiftUI', 'iOS Development', 'MVVM', 'Mobile UX'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'cs193p-m1',
        title: 'SwiftUI Views, Combine & MVVM',
        description: 'Declarative UI paradigm, ViewBuilder syntax, ObservableObject, and State management.',
        skillsLearned: ['SwiftUI', 'MVVM Architecture'],
        lectures: [
          {
            lectureId: 'cs193p-l1',
            title: 'CS193p: Lecture 1 - Getting Started with SwiftUI',
            youtubeVideoId: 'bqu6BquVi2M',
            youtubeUrl: 'https://www.youtube.com/watch?v=bqu6BquVi2M',
            durationSeconds: 3400,
            summary: 'Xcode setup, View hierarchy, body properties, and modifier chaining.'
          }
        ]
      }
    ]
  },
  {
    title: 'Full Stack Open: Deep Dive Into Modern Web Development',
    code: 'FSO-2024',
    university: 'University of Helsinki',
    instructor: 'Matti Luukkainen',
    description: 'World-renowned production curriculum for React, Redux, Node.js, Express, MongoDB, GraphQL, TypeScript, and Docker containerization.',
    category: 'Full Stack Development',
    difficulty: 'Intermediate-Advanced',
    durationHours: 60,
    rating: 4.97,
    enrolledCount: 5800,
    skillsCovered: ['React', 'Node.js', 'Express', 'MongoDB', 'GraphQL', 'TypeScript', 'Docker', 'REST APIs'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'fso-m1',
        title: 'React Fundamentals & Component Architecture',
        description: 'Component state, props, hooks, event handlers, and unidirectional data flow.',
        skillsLearned: ['React', 'JavaScript (ES6+)', 'DOM'],
        lectures: [
          {
            lectureId: 'fso-l1',
            title: 'Full Stack Open: Introduction to React and State',
            youtubeVideoId: 'SqcY0GlETPk',
            youtubeUrl: 'https://www.youtube.com/watch?v=SqcY0GlETPk',
            durationSeconds: 3600,
            summary: 'Functional components, useState, immutable state updates, and rendering.'
          },
          {
            lectureId: 'fso-l2',
            title: 'Full Stack Open: Communicating with Server & REST',
            youtubeVideoId: 's1Gtw_7j2b8',
            youtubeUrl: 'https://www.youtube.com/watch?v=s1Gtw_7j2b8',
            durationSeconds: 3700,
            summary: 'Axios, useEffect hook lifecycle, asynchronous promises, and JSON-server.'
          }
        ]
      },
      {
        moduleId: 'fso-m2',
        title: 'Node.js Backend & MongoDB Persistence',
        description: 'Express routing, REST endpoints, Mongoose schema modeling, and JWT authentication.',
        skillsLearned: ['Node.js', 'Express', 'MongoDB', 'JWT'],
        lectures: [
          {
            lectureId: 'fso-l3',
            title: 'Full Stack Open: Backend Express & MongoDB',
            youtubeVideoId: '8SF_h3xF3cE',
            youtubeUrl: 'https://www.youtube.com/watch?v=8SF_h3xF3cE',
            durationSeconds: 3800,
            summary: 'Middleware pipelines, async/await error handlers, and schema design.'
          },
          {
            lectureId: 'fso-l4',
            title: 'Full Stack Open: User Administration & Token Auth',
            youtubeVideoId: '26QPDBe-NB8',
            youtubeUrl: 'https://www.youtube.com/watch?v=26QPDBe-NB8',
            durationSeconds: 3900,
            summary: 'Bcrypt hashing, JSON Web Tokens, Bearer headers, and route protection.'
          }
        ]
      }
    ]
  },
  {
    title: 'Practical Deep Learning for Coders',
    code: 'FASTAI-v5',
    university: 'fast.ai / Univ of San Francisco',
    instructor: 'Jeremy Howard',
    description: 'Top-down pragmatic deep learning. Building state-of-the-art computer vision, NLP, and tabular models with PyTorch and fastai.',
    category: 'Deep Learning',
    difficulty: 'Intermediate',
    durationHours: 32,
    rating: 4.93,
    enrolledCount: 3600,
    skillsCovered: ['PyTorch', 'fastai', 'Deep Learning', 'Computer Vision', 'Fine-Tuning'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'fastai-m1',
        title: 'Getting Started with Deep Learning',
        description: 'Fine-tuning pre-trained image classifiers, learning rate finder, and data augmentations.',
        skillsLearned: ['Transfer Learning', 'PyTorch'],
        lectures: [
          {
            lectureId: 'fastai-l1',
            title: 'Lesson 1: Deep Learning for Coders (2022)',
            youtubeVideoId: '8SF_h3xF3cE',
            youtubeUrl: 'https://www.youtube.com/watch?v=8SF_h3xF3cE',
            durationSeconds: 4900,
            summary: 'Training computer vision models from scratch with 5 lines of code.'
          }
        ]
      }
    ]
  },
  {
    title: 'Introduction to Operating Systems (Specialization)',
    code: 'CS6200',
    university: 'Georgia Tech',
    instructor: 'Prof. Ada Gavrilovska',
    description: 'Process management, POSIX pthreads, synchronization primitives, virtual memory management, IPC, and distributed file systems.',
    category: 'Operating Systems',
    difficulty: 'Intermediate',
    durationHours: 36,
    rating: 4.87,
    enrolledCount: 1720,
    skillsCovered: ['Operating Systems', 'C', 'Pthreads', 'Mutex & Semaphores', 'Virtual Memory', 'IPC'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'gt-cs6200-m1',
        title: 'Processes, Threads & Synchronization',
        description: 'Kernel vs user space, context switching, condition variables, and reader-writer locks.',
        skillsLearned: ['Concurrency', 'Synchronization'],
        lectures: [
          {
            lectureId: 'gt-cs6200-l1',
            title: 'CS6200: Intro to Operating Systems & Processes',
            youtubeVideoId: '26QPDBe-NB8',
            youtubeUrl: 'https://www.youtube.com/watch?v=26QPDBe-NB8',
            durationSeconds: 3100,
            summary: 'Process control blocks, address space abstractions, and kernel traps.'
          }
        ]
      }
    ]
  },
  {
    title: 'Database Systems: Architecture & Query Optimization',
    code: '15-445/645',
    university: 'Carnegie Mellon University (CMU)',
    instructor: 'Prof. Andy Pavlo',
    description: 'Design and implementation of database management system internals: buffer pools, B+ trees, concurrency control (2PL, MVCC), and query engines.',
    category: 'Database Systems',
    difficulty: 'Advanced',
    durationHours: 44,
    rating: 4.98,
    enrolledCount: 2600,
    skillsCovered: ['Database Internals', 'C++', 'B+ Trees', 'Concurreny Control (MVCC)', 'Query Execution', 'Storage Engines'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=80',
    modules: [
      {
        moduleId: 'cmu-15445-m1',
        title: 'Buffer Pool Management & Storage Engines',
        description: 'Slotted pages, disk-oriented architectures, LRU replacement policies, and page eviction.',
        skillsLearned: ['Buffer Pool', 'Storage Engines', 'Disk I/O'],
        lectures: [
          {
            lectureId: 'cmu-15445-l1',
            title: 'Lecture 1: Course Introduction & Relational Model',
            youtubeVideoId: 'oeYBdqh42RM',
            youtubeUrl: 'https://www.youtube.com/watch?v=oeYBdqh42RM',
            durationSeconds: 4500,
            summary: 'Relational algebra, physical data independence, and DBMS architectures.'
          },
          {
            lectureId: 'cmu-15445-l2',
            title: 'Lecture 5: Buffer Pools & Memory Management',
            youtubeVideoId: '1D_9kg3z8pQ',
            youtubeUrl: 'https://www.youtube.com/watch?v=1D_9kg3z8pQ',
            durationSeconds: 4600,
            summary: 'Buffer pool manager implementation, dirty frames, and page table locks.'
          }
        ]
      },
      {
        moduleId: 'cmu-15445-m2',
        title: 'Tree Indexes & Concurrency Control',
        description: 'B+ Tree split algorithms, latch crabbing, and multi-version concurrency control.',
        skillsLearned: ['B+ Trees', 'MVCC', 'Locking & Latches'],
        lectures: [
          {
            lectureId: 'cmu-15445-l3',
            title: 'Lecture 7: Tree Indexes & B+ Trees',
            youtubeVideoId: '7UJ4CFRGd-U',
            youtubeUrl: 'https://www.youtube.com/watch?v=7UJ4CFRGd-U',
            durationSeconds: 4700,
            summary: 'Node split algorithms, parent pointer propagation, and duplicate key handling.'
          },
          {
            lectureId: 'cmu-15445-l4',
            title: 'Lecture 16: Concurrency Control Theory & 2PL',
            youtubeVideoId: 'Nx0lRdfU1_A',
            youtubeUrl: 'https://www.youtube.com/watch?v=Nx0lRdfU1_A',
            durationSeconds: 4800,
            summary: 'Conflict serializability, view serializability, and rigorous two-phase locking.'
          }
        ]
      }
    ]
  }
];

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27019/skillbridge';
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB at', mongoUri);

    // Clear existing collections
    await User.deleteMany();
    await Course.deleteMany();
    await Enrollment.deleteMany();
    await Assessment.deleteMany();
    await AssessmentResult.deleteMany();
    await Placement.deleteMany();
    await PlacementApplication.deleteMany();
    await Message.deleteMany();
    await Job.deleteMany();
    await Mentor.deleteMany();

    console.log('[Seed] Cleared collections.');

    // 1. Insert 25 University Courses
    const createdCourses = await Course.insertMany(COURSES_CATALOG);
    console.log(`[Seed] Seeded ${createdCourses.length} major university open courses.`);

    const cs224nCourse = createdCourses.find(c => c.code === 'CS224N');
    const mit6006Course = createdCourses.find(c => c.code === '6.006');
    const fsoCourse = createdCourses.find(c => c.code === 'FSO-2024');

    // 2. Create Target Student (Aditya - IT 3rd Year)
    const adityaHeatmap = generateYearlyActivity();
    const student = await User.create({
      name: 'Aditya Sharma',
      email: 'aditya@example.com',
      password: 'password123',
      role: 'student',
      headline: 'Information Technology 3rd Year | Aspiring Machine Learning & Systems Engineer',
      bio: 'Enthusiastic 3rd year engineering undergraduate specializing in NLP architectures, distributed databases, and high-performance full-stack applications.',
      targetRole: 'AI / ML Engineer',
      skills: [
        { name: 'Python', level: 'Advanced', verified: true },
        { name: 'React', level: 'Intermediate', verified: true },
        { name: 'PyTorch', level: 'Intermediate', verified: true },
        { name: 'Data Structures', level: 'Advanced', verified: true },
        { name: 'MongoDB', level: 'Intermediate', verified: false },
        { name: 'Transformers', level: 'Intermediate', verified: false },
        { name: 'C++', level: 'Intermediate', verified: false }
      ],
      academicProfile: {
        department: 'Information Technology',
        year: 3,
        section: 'A',
        rollNumber: '22IT1042',
        cgpa: 8.92
      },
      activityLog: adityaHeatmap,
      education: [
        {
          degree: 'B.Tech in Information Technology',
          institution: 'National Institute of Technology',
          year: '2023 - 2027',
          grade: '8.92 CGPA'
        }
      ],
      resume: {
        title: 'Aditya_Sharma_IT_Resume.pdf',
        summary: 'Undergraduate student with verified competencies in PyTorch, React, and Algorithms. Published benchmark implementations on Stanford CS224N assignments.'
      }
    });

    console.log('[Seed] Created default student Aditya with 365-day heatmap.');

    // 3. Create Faculty Mentors with Academic Disciplines
    const mentorDefs = [
      {
        name: 'Dr. Aris Thorne',
        email: 'thorne@faculty.edu',
        password: 'password123',
        role: 'faculty',
        headline: 'Professor & Chair of Computer Science & Intelligent Systems',
        bio: 'Senior researcher in Distributed Deep Learning, Transformer optimization, and Large Language Models. Former visiting scientist at Stanford AI Lab.',
        skills: [{ name: 'Deep Learning', level: 'Expert', verified: true }, { name: 'Distributed Systems', level: 'Expert', verified: true }, { name: 'PyTorch', level: 'Expert', verified: true }],
        staffProfile: {
          department: 'Information Technology',
          designation: 'Professor & Head of Department',
          disciplines: ['Natural Language Processing', 'Distributed AI', 'Computer Architecture', 'Transformer Optimization'],
          officeHours: 'Tue/Thu 2:00 PM - 5:00 PM',
          contactEmail: 'thorne@faculty.edu'
        }
      },
      {
        name: 'Prof. Elena Rostova',
        email: 'elena@faculty.edu',
        password: 'password123',
        role: 'faculty',
        headline: 'Associate Professor of Software Engineering & Systems',
        bio: 'Industry veteran with 12 years in distributed backend architectures, microservices, and database engine concurrency control.',
        skills: [{ name: 'Database Systems', level: 'Expert', verified: true }, { name: 'Microservices', level: 'Expert', verified: true }, { name: 'Go', level: 'Advanced', verified: true }],
        staffProfile: {
          department: 'Information Technology',
          designation: 'Associate Professor',
          disciplines: ['Cloud Architecture', 'Database Internals', 'DevOps & SRE', 'Distributed Systems'],
          officeHours: 'Mon/Wed 10:00 AM - 1:00 PM',
          contactEmail: 'elena@faculty.edu'
        }
      },
      {
        name: 'Dr. Kaelen Vance',
        email: 'vance@faculty.edu',
        password: 'password123',
        role: 'admin',
        headline: 'Dean of Academic Careers & Placement Director',
        bio: 'Oversees campus placement drives, industry recruitment partnerships, and institutional skills alignment.',
        skills: [{ name: 'Talent Acquisition', level: 'Expert', verified: true }, { name: 'Competitive Coding', level: 'Advanced', verified: true }],
        staffProfile: {
          department: 'Placement Cell',
          designation: 'Director of Placements & Training',
          disciplines: ['Campus Recruitment', 'Employability Training', 'Competitive Coding', 'Career Strategy'],
          officeHours: 'Mon-Fri 3:00 PM - 6:00 PM',
          contactEmail: 'placements@faculty.edu'
        }
      },
      {
        name: 'Dr. Marcus Sterling',
        email: 'sterling@faculty.edu',
        password: 'password123',
        role: 'faculty',
        headline: 'Distinguished Professor of Algorithms & Theoretical Computer Science',
        bio: 'Author of ACM reference papers on randomized approximation algorithms, graph partitioning, and streaming graph analytics.',
        skills: [{ name: 'Algorithms', level: 'Expert', verified: true }, { name: 'Data Structures', level: 'Expert', verified: true }, { name: 'C++', level: 'Expert', verified: true }],
        staffProfile: {
          department: 'Computer Science',
          designation: 'Distinguished Professor',
          disciplines: ['Advanced Algorithms', 'Graph Theory', 'Computational Complexity', 'Competitive Programming'],
          officeHours: 'Tue/Fri 11:00 AM - 2:00 PM',
          contactEmail: 'sterling@faculty.edu'
        }
      },
      {
        name: 'Prof. Ananya Sen',
        email: 'ananya@faculty.edu',
        password: 'password123',
        role: 'faculty',
        headline: 'Lead Faculty - Web Platforms & Mobile Systems Engineering',
        bio: 'Specialist in full-stack reactive applications, TypeScript compiler mechanics, WebAssembly, and modern browser rendering engines.',
        skills: [{ name: 'React', level: 'Expert', verified: true }, { name: 'TypeScript', level: 'Expert', verified: true }, { name: 'Node.js', level: 'Expert', verified: true }],
        staffProfile: {
          department: 'Information Technology',
          designation: 'Associate Professor & Full Stack Lab Director',
          disciplines: ['Full Stack Web Architecture', 'React & Next.js Ecosystem', 'WebAssembly & High Performance Frontend', 'Mobile Engineering'],
          officeHours: 'Mon/Thu 1:00 PM - 4:00 PM',
          contactEmail: 'ananya@faculty.edu'
        }
      },
      {
        name: 'Dr. Devraj Mukherjee',
        email: 'devraj@faculty.edu',
        password: 'password123',
        role: 'faculty',
        headline: 'Director of Machine Intelligence & Computer Vision Lab',
        bio: 'Pioneered multimodal generative diffusion models and 3D visual perception for autonomous systems. Advisor to leading AI research labs.',
        skills: [{ name: 'Computer Vision', level: 'Expert', verified: true }, { name: 'Diffusion Models', level: 'Expert', verified: true }, { name: 'PyTorch', level: 'Expert', verified: true }],
        staffProfile: {
          department: 'Computer Science & AI',
          designation: 'Professor & AI Lab Director',
          disciplines: ['Computer Vision', 'Generative Diffusion Models', 'Medical Image Computing', 'Multimodal Deep Learning'],
          officeHours: 'Wed/Fri 2:00 PM - 5:00 PM',
          contactEmail: 'devraj@faculty.edu'
        }
      },
      {
        name: 'Prof. Sarah Jenkins',
        email: 'jenkins@faculty.edu',
        password: 'password123',
        role: 'faculty',
        headline: 'Senior Fellow - Systems Architecture & Cybersecurity',
        bio: '20+ years investigating kernel vulnerability mitigations, cryptographic protocol verification, and hardware root of trust.',
        skills: [{ name: 'Cybersecurity', level: 'Expert', verified: true }, { name: 'Operating Systems', level: 'Expert', verified: true }, { name: 'C', level: 'Expert', verified: true }],
        staffProfile: {
          department: 'Information Technology',
          designation: 'Chair of Security & Networking',
          disciplines: ['Cybersecurity & Cryptography', 'Operating Systems Internals', 'Network Architecture', 'Secure Software Engineering'],
          officeHours: 'Tue/Thu 10:00 AM - 1:00 PM',
          contactEmail: 'jenkins@faculty.edu'
        }
      },
      {
        name: 'Dr. Vikramaditya Rao',
        email: 'rao@faculty.edu',
        password: 'password123',
        role: 'faculty',
        headline: 'Principal Investigator - High Performance & Cloud Infrastructure',
        bio: 'Expert in Kubernetes orchestration, microservice telemetry, distributed consensus (Raft, Paxos), and multi-cloud elasticity.',
        skills: [{ name: 'Cloud Infrastructure', level: 'Expert', verified: true }, { name: 'Kubernetes', level: 'Expert', verified: true }, { name: 'Distributed Systems', level: 'Expert', verified: true }],
        staffProfile: {
          department: 'Information Technology',
          designation: 'Associate Professor',
          disciplines: ['Cloud Native Systems', 'Kubernetes & Docker Internals', 'Site Reliability Engineering', 'Distributed Consensus'],
          officeHours: 'Mon/Wed 3:00 PM - 6:00 PM',
          contactEmail: 'rao@faculty.edu'
        }
      }
  ];

    const mentors = [];
    for (const mDef of mentorDefs) {
      const createdMentor = await User.create(mDef);
      mentors.push(createdMentor);
    }
    console.log(`[Seed] Seeded ${mentors.length} faculty mentors and admins with hashed passwords.`);

    // 4. Enroll Aditya into CS224N and MIT 6.006 with Realistic Progress & Notes
    if (cs224nCourse) {
      await Enrollment.create({
        user: student._id,
        course: cs224nCourse._id,
        status: 'in-progress',
        progress: 60,
        completedLectures: ['cs224n-l1', 'cs224n-l2', 'cs224n-l3'],
        lectureProgress: [
          { lectureId: 'cs224n-l1', playedSeconds: 4800, durationSeconds: 4800, percentage: 100, completed: true },
          { lectureId: 'cs224n-l2', playedSeconds: 4920, durationSeconds: 4920, percentage: 100, completed: true },
          { lectureId: 'cs224n-l3', playedSeconds: 4700, durationSeconds: 4700, percentage: 100, completed: true },
          { lectureId: 'cs224n-l4', playedSeconds: 1200, durationSeconds: 5100, percentage: 24, completed: false }
        ],
        notes: [
          {
            moduleId: 'cs224n-m1',
            moduleTitle: 'Word Vectors & Word2Vec',
            content: '### Lecture 1 Notes on Distributional Semantics\n- Word2Vec operates by predicting context words given center word $P(w_{t+j} | w_t)$.\n- Softmax denominator is computationally intractable over $V \\approx 10^6$; negative sampling transforms this into binary logistic regression.'
          }
        ],
        projectArtifacts: [
          {
            title: 'Word2Vec PyTorch Skip-Gram Implementation with Negative Sampling',
            repoUrl: 'https://github.com/aditya/cs224n-word2vec-pytorch',
            demoUrl: 'https://word2vec-visualizer-demo.edu',
            description: 'Custom PyTorch SkipGram model trained on Text8 corpus with cosine nearest neighbor embeddings.'
          }
        ]
      });
    }

    if (mit6006Course) {
      await Enrollment.create({
        user: student._id,
        course: mit6006Course._id,
        status: 'in-progress',
        progress: 40,
        completedLectures: ['mit-6006-l1', 'mit-6006-l2'],
        lectureProgress: [
          { lectureId: 'mit-6006-l1', playedSeconds: 3180, durationSeconds: 3180, percentage: 100, completed: true },
          { lectureId: 'mit-6006-l2', playedSeconds: 3000, durationSeconds: 3000, percentage: 100, completed: true }
        ],
        notes: [
          {
            moduleId: 'mit-6006-m1',
            moduleTitle: 'Algorithmic Thinking & Peak Finding',
            content: '2D Peak finding can be solved in $O(n \\log m)$ using divide and conquer on middle columns.'
          }
        ]
      });
    }

    // 5. Seed Cohort-Targeted Assessments (targeted at IT 3rd Year)
    const it3rdYearCohortAssessment = await Assessment.create({
      title: 'IT 3rd Year Mid-Term Benchmark: Algorithms & Machine Learning',
      description: 'Mandatory technical pre-placement evaluation for 3rd Year Information Technology students covering Dynamic Programming, Graph Traversal, and Transformer Architecture fundamentals.',
      skill: 'Algorithms & AI Systems',
      category: 'cohort-drive',
      targetClass: {
        department: 'Information Technology',
        year: 3,
        section: 'All'
      },
      timeLimitMinutes: 30,
      passingScore: 70,
      createdBy: mentors[0]._id,
      questions: [
        {
          type: 'mcq',
          question: 'What is the primary reason self-attention in Transformers scales quadratically with sequence length N?',
          options: [
            'Every query token computes a dot-product with every key token in the sequence (N x N matrix)',
            'The feed-forward network expands hidden dimensions by 4x',
            'Layer normalization requires computing global sequence variance',
            'Positional encodings require computing complex sinuses'
          ],
          correctAnswer: 0,
          explanation: 'The attention matrix QK^T computes pairwise affinity for all N tokens against all N tokens, yielding O(N^2) space and compute complexity.',
          points: 25
        },
        {
          type: 'mcq',
          question: 'In Dijkstra algorithm on a graph with V vertices and E non-negative edges using a binary min-heap, what is the asymptotic time complexity?',
          options: [
            'O((V + E) log V)',
            'O(V^2)',
            'O(E log E + V)',
            'O(V log E)'
          ],
          correctAnswer: 0,
          explanation: 'Each vertex is extracted once (V log V) and each edge may trigger a heap decrease-key (E log V), resulting in O((V + E) log V).',
          points: 25
        },
        {
          type: 'conceptual',
          question: 'Explain the difference between Softmax Self-Attention and FlashAttention. How does FlashAttention reduce GPU memory overhead without modifying mathematical output?',
          sampleSolution: 'Standard attention writes the large N x N intermediate matrix to GPU High Bandwidth Memory (HBM). FlashAttention tiles the Q, K, V matrices into SRAM blocks using online softmax normalization, fusing operations to avoid memory bandwidth roundtrips while computing exact attention.',
          points: 25
        },
        {
          type: 'coding',
          question: 'Implement a function `max_subarray_sum(nums)` using Kadane algorithm that returns the maximum continuous subarray sum in O(n) time and O(1) space.',
          starterCode: 'def max_subarray_sum(nums: list[int]) -> int:\n    # Implement Kadane algorithm\n    pass',
          sampleSolution: 'def max_subarray_sum(nums):\n    max_so_far = nums[0]\n    current_max = nums[0]\n    for x in nums[1:]:\n        current_max = max(x, current_max + x)\n        max_so_far = max(max_so_far, current_max)\n    return max_so_far',
          points: 25
        }
      ]
    });

    console.log('[Seed] Created IT 3rd Year cohort assessment.');

    // 6. Seed Campus Placement Drives & Applications
    const placementDrives = await Placement.insertMany([
      {
        companyName: 'Google',
        roleTitle: 'Software Engineer - AI / Machine Learning (Early Career)',
        logoUrl: 'https://www.google.com/favicon.ico',
        driveType: 'On-Campus',
        status: 'Registration Open',
        ctcPackage: '34.5 LPA',
        location: 'Bangalore / Hyderabad',
        description: 'Join the Google DeepMind & Core Search teams developing cutting-edge AI architectures, vector retrieval pipelines, and scalable distributed infrastructure.',
        eligibleDepartments: ['Information Technology', 'Computer Science'],
        eligibleGraduationYears: [2026, 2027],
        minCgpa: 8.0,
        requiredSkills: ['Python', 'PyTorch', 'Data Structures', 'Algorithms', 'Transformers'],
        preferredSkills: ['C++', 'Distributed Systems', 'CUDA'],
        driveDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        selectionProcess: ['Online Coding Round', 'Technical Interview 1 (Algorithms)', 'Technical Interview 2 (System Design)', 'Googleyness & Leadership']
      },
      {
        companyName: 'Microsoft',
        roleTitle: 'Software Development Engineer (Full Stack & Cloud)',
        logoUrl: 'https://www.microsoft.com/favicon.ico',
        driveType: 'On-Campus',
        status: 'Registration Open',
        ctcPackage: '28.0 LPA',
        location: 'Hyderabad / Bengaluru',
        description: 'Build enterprise-grade cloud microservices and scalable web applications for Azure and Microsoft 365 engineering units.',
        eligibleDepartments: ['Information Technology', 'Computer Science', 'Electronics'],
        eligibleGraduationYears: [2026, 2027],
        minCgpa: 7.5,
        requiredSkills: ['React', 'JavaScript', 'Data Structures', 'Node.js', 'Algorithms'],
        preferredSkills: ['TypeScript', 'Azure', 'Docker', 'MongoDB'],
        driveDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        selectionProcess: ['Online Assessment', 'Technical Round 1', 'Technical Round 2', 'AA Discussion']
      },
      {
        companyName: 'NVIDIA',
        roleTitle: 'Deep Learning Systems Software Engineer',
        logoUrl: 'https://www.nvidia.com/favicon.ico',
        driveType: 'On-Campus',
        status: 'Upcoming',
        ctcPackage: '32.0 LPA',
        location: 'Bangalore',
        description: 'Accelerate the world next-generation AI models on NVIDIA GPUs. Work on TensorRT, Megatron-LM, and high-performance computing clusters.',
        eligibleDepartments: ['Information Technology', 'Computer Science'],
        eligibleGraduationYears: [2026, 2027],
        minCgpa: 8.2,
        requiredSkills: ['C++', 'PyTorch', 'Python', 'Computer Architecture'],
        preferredSkills: ['CUDA', 'Parallel Computing', 'Triton'],
        driveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        selectionProcess: ['HackerRank Systems Test', 'Core Systems Interview', 'Deep Learning Algorithms Round']
      },
      {
        companyName: 'TCS Digital',
        roleTitle: 'Digital Technology Specialist',
        logoUrl: 'https://www.tcs.com/favicon.ico',
        driveType: 'On-Campus',
        status: 'Registration Open',
        ctcPackage: '9.0 LPA',
        location: 'Pan-India',
        description: 'Elite technical tier hiring across modern full-stack web, cloud migration, and enterprise AI transformation initiatives.',
        eligibleDepartments: ['Information Technology', 'Computer Science', 'Electronics', 'Mechanical'],
        eligibleGraduationYears: [2026, 2027],
        minCgpa: 6.5,
        requiredSkills: ['Python', 'Data Structures', 'React'],
        preferredSkills: ['SQL', 'Git', 'Java'],
        driveDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        selectionProcess: ['TCS National Qualifier Test', 'Technical Interview', 'Managerial Interview']
      }
    ]);

    console.log(`[Seed] Seeded ${placementDrives.length} campus placement drives.`);

    // 7. Seed Existing Application for Aditya in Google Drive with Ticket Number
    const googleDrive = placementDrives[0];
    await PlacementApplication.create({
      ticketNumber: 'TKT-2026-IT-1042',
      placement: googleDrive._id,
      student: student._id,
      academicSnapshot: {
        department: 'Information Technology',
        year: 3,
        rollNumber: '22IT1042',
        cgpa: 8.92
      },
      skillMatchSnapshot: {
        score: 85,
        matchedSkills: ['Python', 'PyTorch', 'Data Structures', 'Algorithms'],
        missingSkills: ['Transformers']
      },
      resumeUrl: 'Aditya_Sharma_IT_Resume.pdf',
      portfolioUrl: 'https://skillbridge.edu/portfolio/aditya',
      currentStage: 'Shortlisted',
      stageHistory: [
        {
          stage: 'Registered',
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          notes: 'Candidate registered through 1-Click Placement Portal.'
        },
        {
          stage: 'Shortlisted',
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          notes: 'Shortlisted by Placement Cell based on verified PyTorch & Data Structures credentials.'
        }
      ]
    });

    // 8. Seed Initial Chat Messages Between Aditya & Dr. Thorne
    // Messages cleared: start fresh without preset conversations
    console.log("[Seed] Fresh chat threads without pre-existing conversations.");

    console.log('[Seed] Seeded student-mentor messages.');
    console.log('\n========================================');
    console.log('✅ SkillBridge 2.0 Database Seeded Successfully!');
    console.log('Student Account: aditya@example.com / password123');
    console.log('Faculty Account: thorne@faculty.edu / password123');
    console.log('Admin Account:   vance@faculty.edu / password123');
    console.log('Total Courses:   25 University Courses on YouTube');
    console.log('========================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seed();
