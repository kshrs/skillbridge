// Comprehensive Stanford CS224N Course Curriculum Dataset
// Stanford University: CS224N - Natural Language Processing with Deep Learning
// Instructors: Prof. Christopher Manning, Prof. Diyi Yang, Prof. Yejin Choi
// Structured into 5 core phases:
// Phase 1: Word Representations & Embeddings
// Phase 2: Neural Networks, Backprop & Dependency Parsing
// Phase 3: Recurrence, Seq2Seq & Self-Attention
// Phase 4: The Transformer Revolution & Large Language Models
// Phase 5: Modern Frontier: PEFT, Alignment (RLHF), RAG & Agentic Systems

export const CS224N_COURSE = {
  id: 'cs224n',
  code: 'CS224N / LING 284',
  institution: 'Stanford University',
  title: 'Natural Language Processing with Deep Learning',
  instructors: ['Prof. Christopher Manning', 'Prof. Diyi Yang'],
  term: 'Stanford Online Academic Edition',
  rating: 4.98,
  totalHours: '32 hours of video lectures',
  totalLectures: 15,
  difficulty: 'Intermediate to Advanced',
  description: 'The definitive deep learning course for Natural Language Processing. Explore fundamental representations from Word2Vec and vector geometries to modern autoregressive Transformers, FlashAttention, PEFT (LoRA), RLHF alignment, and autonomous agent architectures.',
  prerequisites: ['Linear Algebra & Matrix Calculus', 'Probability & Statistics', 'Proficiency in Python & PyTorch'],
  learningOutcomes: [
    'Derive and optimize word vector representations (Skip-Gram, CBOW, GloVe)',
    'Implement neural dependency parsing and transition systems in PyTorch',
    'Build recurrent sequence models (LSTMs, GRUs) and analyze vanishing gradients',
    'Code the Transformer architecture from scratch (Multi-Head Attention, Softmax normalization, Positional encodings)',
    'Fine-tune state-of-the-art LLMs using Parameter-Efficient Fine-Tuning (LoRA, QLoRA)',
    'Understand Post-Training Alignment with Reinforcement Learning from Human Feedback (RLHF) and DPO',
    'Architect production Retrieval-Augmented Generation (RAG) and Tool-use Agents'
  ],
  modules: [
    {
      id: 'mod-1',
      number: 'Module 01',
      title: 'Word Representations, Word2Vec & GloVe',
      shortTitle: 'Word Vectors & GloVe',
      duration: '4 lectures • 5 hours',
      overview: 'How neural networks represent discrete human words as dense continuous geometric vectors capturing distributional semantics.',
      lectures: [
        {
          id: 'cs224n-lec-01',
          lectureNum: 1,
          title: 'Introduction and Word Vectors',
          instructor: 'Christopher Manning',
          duration: '1 hr 18 min',
          videoId: 'DzpHeXVSC5I',
          youtubeUrl: 'https://www.youtube.com/watch?v=DzpHeXVSC5I',
          summary: 'The foundational lecture establishing why discrete language requires continuous vector spaces. Mathematical derivation of the Skip-gram objective function, softmax conditional probabilities, and gradient descent updates.',
          topics: ['Human Language & Word Meaning', 'Word2Vec Skip-Gram & CBOW', 'Objective Functions & Gradients', 'Distributional Semantics'],
          assignments: ['Pset 1: Math Derivations of Word2Vec Loss', 'Coding: Naive Softmax & Negative Sampling'],
          readings: ['Word2Vec Explained (Goldberg & Levy, 2014)', 'Distributed Representations of Words (Mikolov et al., 2013)']
        },
        {
          id: 'cs224n-lec-02',
          lectureNum: 2,
          title: 'Word Vectors II & Global Matrix Factorization (GloVe)',
          instructor: 'Christopher Manning',
          duration: '1 hr 15 min',
          videoId: 'rmx0cExJnp0',
          youtubeUrl: 'https://www.youtube.com/watch?v=rmx0cExJnp0',
          summary: 'Global co-occurrence matrix factorization vs local context window methods. Mathematical formulation of GloVe (Global Vectors) and intrinsic vs extrinsic evaluation metrics for word embeddings.',
          topics: ['GloVe Objective Function', 'Co-occurrence Matrix Statistics', 'Word Vector Analogies (King - Man + Woman = Queen)', 'Intrinsic vs Extrinsic Evaluation'],
          assignments: ['PyTorch Lab: Exploring GloVe Word Analogies and PCA Projections'],
          readings: ['GloVe: Global Vectors for Word Representation (Pennington, Socher, Manning, 2014)']
        },
        {
          id: 'cs224n-lec-03',
          lectureNum: 3,
          title: 'Subword Models, Byte-Pair Encoding (BPE) & Morphology',
          instructor: 'Christopher Manning',
          duration: '1 hr 18 min',
          videoId: '9oTHFx0Gg3Q',
          youtubeUrl: 'https://www.youtube.com/watch?v=9oTHFx0Gg3Q',
          summary: 'Why pure word-level vocabularies fail with out-of-vocabulary (OOV) tokens and rich morphological languages. Deep dive into Byte-Pair Encoding (BPE), WordPiece, and SentencePiece tokenization.',
          topics: ['Byte-Pair Encoding Algorithm', 'Vocabulary Compression', 'SentencePiece & Unigram LM', 'Morphological Generalization'],
          assignments: ['Coding: Build a BPE Tokenizer from Scratch'],
          readings: ['Neural Machine Translation of Rare Words with Subword Units (Sennrich et al., 2016)']
        }
      ]
    },
    {
      id: 'mod-2',
      number: 'Module 02',
      title: 'Neural Networks, Backprop & Syntactic Parsing',
      shortTitle: 'Neural Networks & Parsing',
      duration: '3 lectures • 4 hours',
      overview: 'Transitioning from linear models to deep neural computation graphs, matrix-vector backpropagation, and syntactic dependency parsing.',
      lectures: [
        {
          id: 'cs224n-lec-04',
          lectureNum: 4,
          title: 'Neural Network Architectures & Matrix Backpropagation',
          instructor: 'Christopher Manning',
          duration: '1 hr 14 min',
          videoId: '8rXD5-xhemo',
          youtubeUrl: 'https://www.youtube.com/watch?v=8rXD5-xhemo',
          summary: 'Computational graphs, Jacobian matrices, chain rule for tensor operations, cross-entropy classification, and backpropagation mechanics in deep NLP models.',
          topics: ['Computational Graphs', 'Matrix-Vector Calculus', 'Non-linear Activations (ReLU, GELU)', 'Gradient Checking'],
          assignments: ['Pset 2: Two-Layer Neural Net & Softmax Backprop'],
          readings: ['Calculus on Computational Graphs (Olah, 2015)']
        },
        {
          id: 'cs224n-lec-05',
          lectureNum: 5,
          title: 'Syntactic Dependency Parsing',
          instructor: 'Christopher Manning',
          duration: '1 hr 12 min',
          videoId: 'nC9_RfqB-0U',
          youtubeUrl: 'https://www.youtube.com/watch?v=nC9_RfqB-0U',
          summary: 'Linguistic dependency structure vs constituency grammars. Transition-based dependency parsers, shift-reduce algorithms, and Chen & Manning\'s milestone neural dependency parser.',
          topics: ['Dependency Grammar Formalisms', 'Transition-based Shift-Reduce Parsing', 'Neural Dependency Parsing', 'Projectivity'],
          assignments: ['PyTorch Assignment: Implementing a Neural Dependency Parser'],
          readings: ['A Fast and Accurate Dependency Parser using Neural Networks (Chen & Manning, 2014)']
        }
      ]
    },
    {
      id: 'mod-3',
      number: 'Module 03',
      title: 'Recurrence, Language Modeling & Sequence-to-Sequence',
      shortTitle: 'RNNs, Seq2Seq & NMT',
      duration: '3 lectures • 4 hours',
      overview: 'Language modeling over sequences, recurrent architectures (RNNs, LSTMs, GRUs), and neural machine translation with encoder-decoder frameworks.',
      lectures: [
        {
          id: 'cs224n-lec-06',
          lectureNum: 6,
          title: 'Recurrent Neural Networks (RNNs) & Language Models',
          instructor: 'Christopher Manning',
          duration: '1 hr 16 min',
          videoId: 'PLryWeHPcBs',
          youtubeUrl: 'https://www.youtube.com/watch?v=PLryWeHPcBs',
          summary: 'The definition of Language Modeling (P(w_1, ..., w_T)). Recurrent hidden state transitions, teacher forcing, perplexity evaluation, and the fatal vanishing/exploding gradient barrier in standard RNNs.',
          topics: ['Language Modeling Probability Chains', 'RNN Hidden State Recurrence', 'Perplexity Metric', 'Vanishing & Exploding Gradients'],
          assignments: ['PyTorch Lab: Character-level Language Model with RNN'],
          readings: ['The Unreasonable Effectiveness of Recurrent Neural Networks (Karpathy, 2015)']
        },
        {
          id: 'cs224n-lec-07',
          lectureNum: 7,
          title: 'Gated Architectures (LSTMs & GRUs) and Vanishing Gradients',
          instructor: 'Christopher Manning',
          duration: '1 hr 15 min',
          videoId: 'ySEx_Bqxvvo',
          youtubeUrl: 'https://www.youtube.com/watch?v=ySEx_Bqxvvo',
          summary: 'Overcoming the vanishing gradient barrier with gating mechanisms. Cell state memory highways in LSTMs (forget, input, and output gates) and GRU approximations.',
          topics: ['LSTM Memory Cell & Additive Updates', 'Forget, Input, and Output Gates', 'Gated Recurrent Units (GRU)', 'Gradient Clipping'],
          assignments: ['PyTorch Implementation: Bidirectional LSTM Encoder'],
          readings: ['Long Short-Term Memory (Hochreiter & Schmidhuber, 1997)']
        },
        {
          id: 'cs224n-lec-08',
          lectureNum: 8,
          title: 'Sequence-to-Sequence, Machine Translation & Attention',
          instructor: 'Christopher Manning',
          duration: '1 hr 20 min',
          videoId: 'LWMzyfvuehA',
          youtubeUrl: 'https://www.youtube.com/watch?v=LWMzyfvuehA',
          summary: 'Neural Machine Translation (NMT) via Encoder-Decoder networks. The information bottleneck of fixed-size context vectors and Bahdanau attention as an alignment mechanism.',
          topics: ['Encoder-Decoder Architecture', 'Information Bottleneck Problem', 'Bahdanau Additive Attention', 'Luong Multiplicative Attention'],
          assignments: ['PyTorch Assignment: Neural Machine Translation with Attention'],
          readings: ['Neural Machine Translation by Jointly Learning to Align and Translate (Bahdanau et al., 2014)']
        }
      ]
    },
    {
      id: 'mod-4',
      number: 'Module 04',
      title: 'The Transformer Architecture & Self-Attention',
      shortTitle: 'Transformers & Pre-training',
      duration: '4 lectures • 5 hours',
      overview: 'Discarding recurrence completely for scaled dot-product self-attention, Multi-Head Attention, RoPE, BERT, and GPT architectures.',
      lectures: [
        {
          id: 'cs224n-lec-09',
          lectureNum: 9,
          title: 'Self-Attention and the Transformer Architecture',
          instructor: 'Christopher Manning',
          duration: '1 hr 22 min',
          videoId: 'LWMzyfvuehA',
          youtubeUrl: 'https://www.youtube.com/watch?v=LWMzyfvuehA',
          summary: 'Step-by-step deconstruction of the original Transformer: Queries, Keys, Values, Scaled Dot-Product, Multi-Head Attention, LayerNorm, Residual Highways, and Position Encodings.',
          topics: ['Queries, Keys, and Values', 'Scaled Dot-Product Attention', 'Multi-Head Attention Projections', 'Encoder vs Decoder Blocks'],
          assignments: ['Milestone Assignment: Building a Transformer from Scratch in PyTorch'],
          readings: ['Attention Is All You Need (Vaswani et al., 2017)']
        },
        {
          id: 'cs224n-lec-10',
          lectureNum: 10,
          title: 'Pre-training, Masked Language Models (BERT) & Autoregressive GPT',
          instructor: 'Christopher Manning',
          duration: '1 hr 18 min',
          videoId: 'duBLxHjaecQ',
          youtubeUrl: 'https://www.youtube.com/watch?v=duBLxHjaecQ',
          summary: 'The self-supervised pre-training revolution. Bidirectional contextual encoders (BERT, RoBERTa) using Masked Language Modeling vs Autoregressive causal decoders (GPT series).',
          topics: ['Masked Language Modeling (MLM)', 'Causal Autoregressive Language Modeling', 'BERT vs GPT Design Paradigms', 'Scaling Laws & Emergent Abilities'],
          assignments: ['PyTorch Lab: Fine-tuning BERT on GLUE Sentiment Classification'],
          readings: ['BERT: Pre-training of Deep Bidirectional Transformers (Devlin et al., 2018)', 'Language Models are Few-Shot Learners (Brown et al., 2020)']
        }
      ]
    },
    {
      id: 'mod-5',
      number: 'Module 05',
      title: 'Modern LLM Frontiers: PEFT, Alignment, RAG & Agents',
      shortTitle: 'Modern LLMs, Alignment & RAG',
      duration: '5 lectures • 6.5 hours',
      overview: 'Cutting-edge production NLP: In-Context Learning, LoRA Parameter-Efficient Fine-Tuning, RLHF alignment, and Agentic RAG workflows.',
      lectures: [
        {
          id: 'cs224n-lec-11',
          lectureNum: 11,
          title: 'Prompt Engineering & In-Context Learning',
          instructor: 'Diyi Yang',
          duration: '1 hr 15 min',
          videoId: '9oTHFx0Gg3Q',
          youtubeUrl: 'https://www.youtube.com/watch?v=9oTHFx0Gg3Q',
          summary: 'How large-scale Transformers act as algorithmic reasoners in context. Zero-shot, Few-shot demonstration design, Chain-of-Thought (CoT), Self-Consistency, and calibration.',
          topics: ['Zero-Shot vs Few-Shot Prompting', 'Chain-of-Thought (CoT) Reasoning', 'Least-to-Most Prompting', 'Context Window Dynamics'],
          assignments: ['Prompt Engineering Benchmark Suite on Complex Reasoning'],
          readings: ['Chain-of-Thought Prompting Elicits Reasoning in LLMs (Wei et al., 2022)']
        },
        {
          id: 'cs224n-lec-12',
          lectureNum: 12,
          title: 'Parameter-Efficient Fine-Tuning (PEFT) & LoRA',
          instructor: 'Diyi Yang',
          duration: '1 hr 20 min',
          videoId: 'DzpHeXVSC5I',
          youtubeUrl: 'https://www.youtube.com/watch?v=DzpHeXVSC5I',
          summary: 'Why full fine-tuning of 70B models is infeasible. Low-Rank Adaptation (LoRA), matrix intrinsic rank hypothesis, adapters, QLoRA 4-bit NormalFloat quantization, and prefix-tuning.',
          topics: ['Low-Rank Decomposition (W + B*A)', 'Intrinsic Dimensionality of Parameter Updates', 'QLoRA & 4-Bit Quantization', 'Inference Adapter Merging'],
          assignments: ['PyTorch + Hugging Face: Fine-tuning a 7B LLM with LoRA on Single GPU'],
          readings: ['LoRA: Low-Rank Adaptation of Large Language Models (Hu et al., 2021)', 'QLoRA: Efficient Finetuning of Quantized LLMs (Dettmers et al., 2023)']
        },
        {
          id: 'cs224n-lec-13',
          lectureNum: 13,
          title: 'Post-Training Alignment: Instruction Tuning, RLHF & DPO',
          instructor: 'Yejin Choi',
          duration: '1 hr 25 min',
          videoId: 'ySEx_Bqxvvo',
          youtubeUrl: 'https://www.youtube.com/watch?v=ySEx_Bqxvvo',
          summary: 'Bridging raw token completion to helpful, harmless assistants. Supervised Fine-Tuning (SFT), Reward Modeling, PPO policy optimization (RLHF), Direct Preference Optimization (DPO), and safety red-teaming.',
          topics: ['Supervised Instruction Tuning', 'Reward Model Training from Pairwise Preferences', 'PPO Optimization with KL Penalty', 'Direct Preference Optimization (DPO)'],
          assignments: ['PyTorch Assignment: Preference Alignment with DPO Loss'],
          readings: ['Training language models to follow instructions with human feedback (Ouyang et al., 2022)', 'Direct Preference Optimization (Rafailov et al., 2023)']
        },
        {
          id: 'cs224n-lec-14',
          lectureNum: 14,
          title: 'Retrieval-Augmented Generation (RAG) & Vector Stores',
          instructor: 'Diyi Yang',
          duration: '1 hr 18 min',
          videoId: 'duBLxHjaecQ',
          youtubeUrl: 'https://www.youtube.com/watch?v=duBLxHjaecQ',
          summary: 'Grounding LLMs with external truth to eliminate hallucinations. Dense passage retrieval, vector similarity indexing (HNSW, IVFFlat), hybrid BM25 search, cross-encoder re-ranking, and context compression.',
          topics: ['Dense Passage Retrieval (DPR)', 'Bi-Encoder vs Cross-Encoder Re-rankers', 'Vector Indexing (HNSW / FAISS)', 'Lost in the Middle Mitigation'],
          assignments: ['Build an Enterprise RAG Pipeline with Hybrid Search & Re-ranking'],
          readings: ['Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks (Lewis et al., 2020)']
        },
        {
          id: 'cs224n-lec-15',
          lectureNum: 15,
          title: 'Autonomous LLM Agents, Function Calling & Tool Use',
          instructor: 'Christopher Manning',
          duration: '1 hr 20 min',
          videoId: 'LWMzyfvuehA',
          youtubeUrl: 'https://www.youtube.com/watch?v=LWMzyfvuehA',
          summary: 'From passive text generators to autonomous execution engines. ReAct loops (Reasoning + Acting), function calling, tool use, environment grounding, memory architectures, and multi-agent coordination.',
          topics: ['ReAct Prompting Paradigm', 'JSON Function Calling & Tool Execution', 'Working Memory & Episodic Reflection', 'Multi-Agent Collaboration'],
          assignments: ['Final Capstone Project: Autonomous Research Agent with Tool Use'],
          readings: ['ReAct: Synergizing Reasoning and Acting in Language Models (Yao et al., 2022)', 'Toolformer: Language Models Can Teach Themselves to Use Tools (Schick et al., 2023)']
        }
      ]
    }
  ]
};
