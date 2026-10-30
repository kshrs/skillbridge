// Curated Skill Ontology & Role Baselines
export const ROLE_SKILL_BENCHMARKS = {
  'Full Stack Developer': ['React', 'JavaScript', 'Node.js', 'Express', 'MongoDB', 'Git', 'REST API', 'Docker'],
  'Frontend Developer': ['React', 'JavaScript', 'TypeScript', 'CSS/Tailwind', 'HTML5', 'Next.js', 'Git'],
  'Backend Developer': ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'Docker', 'Redis', 'REST API', 'Python'],
  'AI / ML Engineer': ['Python', 'PyTorch', 'TensorFlow', 'Tokenization', 'Attention Mechanism', 'Embeddings', 'Docker', 'FastAPI'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'CI/CD', 'Linux', 'AWS', 'Terraform', 'Git']
};

export const RELATED_SKILLS_GRAPH = {
  'React': ['Node.js', 'TypeScript', 'Next.js', 'Redux', 'Tailwind CSS'],
  'JavaScript': ['TypeScript', 'Node.js', 'React', 'Express'],
  'MongoDB': ['Express', 'Node.js', 'Redis', 'Mongoose'],
  'Node.js': ['Express', 'Docker', 'Microservices', 'REST API'],
  'Python': ['PyTorch', 'FastAPI', 'Pandas', 'Embeddings'],
  'Docker': ['Kubernetes', 'CI/CD', 'Linux', 'AWS']
};

// Skill-gap analyzer
export function analyzeSkillGap(userSkills = [], targetRole = 'Full Stack Developer', targetJobSkills = []) {
  const normUserSkills = userSkills.map(s => (typeof s === 'string' ? s : s.name).toLowerCase().trim());

  let benchmark = [];
  if (targetJobSkills && targetJobSkills.length > 0) {
    benchmark = targetJobSkills;
  } else if (ROLE_SKILL_BENCHMARKS[targetRole]) {
    benchmark = ROLE_SKILL_BENCHMARKS[targetRole];
  } else {
    benchmark = ROLE_SKILL_BENCHMARKS['Full Stack Developer'];
  }

  const matchedSkills = [];
  const missingSkills = [];

  benchmark.forEach(skill => {
    if (normUserSkills.some(s => s === skill.toLowerCase() || s.includes(skill.toLowerCase()) || skill.toLowerCase().includes(s))) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const readinessScore = benchmark.length > 0
    ? Math.round((matchedSkills.length / benchmark.length) * 100)
    : 0;

  // Recommendations: expand missing skills with complementary technologies
  const recommendedSkills = [...missingSkills];
  normUserSkills.forEach(skill => {
    const matchedKey = Object.keys(RELATED_SKILLS_GRAPH).find(k => k.toLowerCase() === skill);
    if (matchedKey) {
      RELATED_SKILLS_GRAPH[matchedKey].forEach(rel => {
        if (!normUserSkills.includes(rel.toLowerCase()) && !recommendedSkills.includes(rel)) {
          recommendedSkills.push(rel);
        }
      });
    }
  });

  return {
    targetRole,
    readinessScore,
    matchedCount: matchedSkills.length,
    totalRequired: benchmark.length,
    matchedSkills,
    missingSkills,
    recommendedSkills: recommendedSkills.slice(0, 6)
  };
}

// Job-Skill Match Score Calculator
export function calculateJobMatch(userSkills = [], jobRequiredSkills = [], jobPreferredSkills = []) {
  const normUserSkills = userSkills.map(s => (typeof s === 'string' ? s : s.name).toLowerCase().trim());
  
  if (!jobRequiredSkills || jobRequiredSkills.length === 0) {
    return { score: 100, matchedSkills: [], missingSkills: [] };
  }

  const matchedSkills = [];
  const missingSkills = [];

  jobRequiredSkills.forEach(req => {
    if (normUserSkills.some(s => s === req.toLowerCase() || s.includes(req.toLowerCase()) || req.toLowerCase().includes(s))) {
      matchedSkills.push(req);
    } else {
      missingSkills.push(req);
    }
  });

  let matchPct = Math.round((matchedSkills.length / jobRequiredSkills.length) * 100);

  // Bonus for preferred skills
  if (jobPreferredSkills && jobPreferredSkills.length > 0) {
    const prefMatched = jobPreferredSkills.filter(pref =>
      normUserSkills.some(s => s === pref.toLowerCase() || s.includes(pref.toLowerCase()) || pref.toLowerCase().includes(s))
    );
    const bonus = Math.round((prefMatched.length / jobPreferredSkills.length) * 10);
    matchPct = Math.min(100, matchPct + bonus);
  }

  return {
    score: matchPct,
    matchedSkills,
    missingSkills
  };
}

// Resume Extractor & Parser Engine
export function parseAndAnalyzeResume(rawText) {
  const text = rawText || '';
  const commonTech = [
    'React', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'MongoDB',
    'SQL', 'PostgreSQL', 'Python', 'Docker', 'Kubernetes', 'Git', 'AWS',
    'HTML', 'CSS', 'Tailwind', 'Next.js', 'Redux', 'C++', 'Java', 'GraphQL',
    'Tokenization', 'Attention Mechanism', 'Embeddings', 'PyTorch'
  ];

  const detectedSkills = [];
  commonTech.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      detectedSkills.push(skill);
    }
  });

  // Calculate Resume Strength
  const sectionsFound = {
    experience: /(experience|work history|employment)/i.test(text),
    education: /(education|university|college|bachelor|master|degree|b\.tech|gpa)/i.test(text),
    projects: /(projects|portfolio|built)/i.test(text),
    skills: /(skills|technologies|proficiencies)/i.test(text)
  };

  const sectionScore = Object.values(sectionsFound).filter(Boolean).length * 15;
  const skillsScore = Math.min(40, detectedSkills.length * 5);
  const overallStrength = Math.min(100, sectionScore + skillsScore);

  const improvements = [];
  if (!sectionsFound.projects) improvements.push('Add a dedicated Projects section with GitHub links and metrics.');
  if (detectedSkills.length < 5) improvements.push('Highlight more specific technical skills and modern frameworks.');
  if (!/(achieved|improved|scaled|reduced|developed|built)/i.test(text)) {
    improvements.push('Incorporate quantified action verbs (e.g., "Reduced latency by 25%").');
  }
  if (!sectionsFound.education) improvements.push('Include relevant education, graduation year, and degree.');

  return {
    detectedSkills,
    overallStrength,
    sectionsFound,
    improvements,
    targetRoleMatch: analyzeSkillGap(detectedSkills, 'Full Stack Developer')
  };
}
