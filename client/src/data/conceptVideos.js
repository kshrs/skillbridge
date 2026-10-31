// Standard academic video mappings from Stanford Online and MIT OpenCourseWare
export const CONCEPT_VIDEOS = {
  tokenization: {
    title: 'Stanford CS224N: Subword Models, BPE & Tokenization',
    source: 'Stanford Online (CS224N)',
    videoId: '9oTHFx0Gg3Q',
    youtubeUrl: 'https://www.youtube.com/watch?v=9oTHFx0Gg3Q',
    duration: '1 hr 18 min',
    module: 'Module 01 • Topic 1',
    description: 'Comprehensive Stanford lecture detailing how modern NLP pipelines and Transformer models do not read raw strings. It breaks down subword tokenization, Byte-Pair Encoding (BPE), SentencePiece, character-level embeddings, and morphological vocabularies.',
    topics: ['Byte-Pair Encoding (BPE)', 'Vocabulary Sizing', 'Subword Splitting', 'OOV Token Resolution']
  },
  embeddings: {
    title: 'Stanford CS224N: Introduction and Word Vectors',
    source: 'Stanford Online (CS224N)',
    videoId: 'DzpHeXVSC5I',
    youtubeUrl: 'https://www.youtube.com/watch?v=DzpHeXVSC5I',
    duration: '1 hr 20 min',
    module: 'Module 01 • Topic 2',
    description: 'Professor Christopher Manning introduces distributional semantics, Word2Vec, skip-gram architectures, negative sampling, objective functions, and projecting dense continuous vector spaces for natural language understanding.',
    topics: ['Word2Vec', 'Skip-Gram', 'Negative Sampling', 'Vector Space Geometry', 'Cosine Similarity']
  },
  attention: {
    title: 'MIT 6.S191: Recurrent Neural Networks, Transformers & Attention',
    source: 'MIT OpenCourseWare (6.S191)',
    videoId: 'ySEx_Bqxvvo',
    youtubeUrl: 'https://www.youtube.com/watch?v=ySEx_Bqxvvo',
    duration: '52 min',
    module: 'Module 01 • Topic 3',
    description: 'MIT official deep learning foundation lecture explaining how attention mechanisms compute relevance matrices across tokens, replacing recurrence with scaled dot-product attention queries, keys, and values in Transformer architectures.',
    topics: ['Self-Attention Mechanism', 'Queries, Keys & Values', 'Multi-Head Attention', 'Scaled Dot-Product']
  }
};
