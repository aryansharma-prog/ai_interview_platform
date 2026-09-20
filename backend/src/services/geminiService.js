const aiProvider = require('./aiProvider');
const logger = require('../utils/logger');

const DIFFICULTY_LADDER = ['Easy', 'Medium', 'Hard'];

function nextDifficulty(currentDifficulty, previousScore) {
  const idx = DIFFICULTY_LADDER.indexOf(currentDifficulty);
  if (idx === -1) return 'Medium';
  if (previousScore >= 78) return DIFFICULTY_LADDER[Math.min(idx + 1, DIFFICULTY_LADDER.length - 1)];
  if (previousScore < 50) return DIFFICULTY_LADDER[Math.max(idx - 1, 0)];
  return currentDifficulty;
}

/**
 * 1. Resume Intelligence: Extract skills, categorized technologies, projects, metrics, and claims.
 */
async function extractResumeData(resumeText) {
  const prompt = `
Analyze this candidate's resume and extract deep, structured intelligence.
Identify specific project claims, architecture decisions, numbers/metrics, and categorized skills.

Resume Text:
"""
${resumeText.slice(0, 8000)}
"""

Return ONLY valid JSON matching this schema:
{
  "skills": ["JavaScript", "Node.js", "React", "MongoDB", "Redis", "Docker", "AWS"],
  "categorizedSkills": {
    "languages": ["JavaScript", "TypeScript", "Python"],
    "frameworks": ["React", "Express", "Next.js"],
    "databases": ["MongoDB", "PostgreSQL", "Redis"],
    "tools": ["Git", "Docker", "Webpack"],
    "cloud": ["AWS", "GCP", "Vercel"]
  },
  "projects": [
    {
      "name": "Project Name",
      "description": "Short project summary",
      "technologies": ["Node.js", "Redis"],
      "claims": ["Implemented caching layer with Redis", "Engineered microservices pipeline"],
      "metrics": ["Reduced latency by 40%", "Handled 10k concurrent users"]
    }
  ],
  "workExperience": [
    {
      "company": "Company Name",
      "role": "Software Engineer",
      "duration": "2023 - Present",
      "achievements": ["Built RESTful backend services", "Automated CI/CD pipelines"],
      "technologies": ["Node.js", "MongoDB", "Docker"]
    }
  ],
  "education": ["B.Tech in Computer Science"],
  "certifications": ["AWS Certified Developer"],
  "importantClaims": ["Built scalable caching system with Redis", "Optimized database queries with compound indexing"]
}
`.trim();

  const mock = {
    skills: ['JavaScript', 'TypeScript', 'Node.js', 'React', 'MongoDB', 'Redis', 'Docker', 'REST APIs', 'DSA'],
    categorizedSkills: {
      languages: ['JavaScript', 'TypeScript', 'Python'],
      frameworks: ['React', 'Express', 'Node.js'],
      databases: ['MongoDB', 'Redis', 'PostgreSQL'],
      tools: ['Git', 'Docker', 'Postman'],
      cloud: ['AWS', 'Vercel'],
    },
    projects: [
      {
        name: 'Distributed Task Queue',
        description: 'Scalable background processing worker system',
        technologies: ['Node.js', 'Redis', 'BullMQ', 'MongoDB'],
        claims: ['Architected distributed worker queue handling asynchronous email delivery', 'Implemented Redis pub/sub for real-time socket events'],
        metrics: ['Processed 50,000 tasks/day with 99.9% uptime', 'Reduced job latency by 35%'],
      },
    ],
    workExperience: [
      {
        company: 'Tech Solutions Inc.',
        role: 'Full Stack Developer',
        duration: '2023 - 2024',
        achievements: ['Designed scalable REST APIs in Express & MongoDB', 'Improved page load speed by 45% using code splitting'],
        technologies: ['React', 'Node.js', 'MongoDB'],
      },
    ],
    education: ['B.Tech in Computer Science & Engineering'],
    certifications: ['AWS Certified Solutions Architect Associate'],
    importantClaims: [
      'Engineered Redis caching layer with TTL invalidation for session handling',
      'Optimized MongoDB aggregation pipelines to reduce API response time by 40%',
    ],
  };

  return aiProvider.generateJSON(prompt, mock, { temperature: 0.2 });
}

/**
 * 2. Job Description (JD) Intelligence: Extract required/preferred skills, domain, and expectations.
 */
async function extractJobDescription(jdText) {
  const prompt = `
Analyze this Job Description (JD) and extract structured requirements, core technical stack, and domain expectations.

Job Description:
"""
${jdText.slice(0, 8000)}
"""

Return ONLY valid JSON matching this schema:
{
  "title": "Role Title (e.g. Senior Backend Engineer)",
  "company": "Company Name if mentioned or Tech Corp",
  "experienceLevel": "Entry|Junior|Mid|Senior|Lead|Principal",
  "requiredSkills": ["Node.js", "Redis", "System Design", "AWS", "REST APIs"],
  "preferredSkills": ["Kubernetes", "GraphQL", "Microservices"],
  "responsibilities": ["Design high-throughput APIs", "Maintain 99.99% system availability"],
  "technologies": ["Node.js", "TypeScript", "PostgreSQL", "Redis", "Kafka", "AWS"],
  "domain": "FinTech / SaaS / Cloud Infrastructure",
  "roleExpectations": ["Strong distributed system design", "Performance optimization"]
}
`.trim();

  const mock = {
    title: 'Senior Software Engineer (Backend)',
    company: 'Tech Innovations',
    experienceLevel: 'Senior',
    requiredSkills: ['Node.js', 'Redis', 'System Design', 'PostgreSQL', 'REST APIs', 'DSA'],
    preferredSkills: ['Kafka', 'Docker', 'AWS ECS', 'Microservices Architecture'],
    responsibilities: [
      'Design and scale high-throughput REST APIs and distributed microservices',
      'Optimize database queries and caching layers for sub-100ms response times',
    ],
    technologies: ['Node.js', 'TypeScript', 'Redis', 'PostgreSQL', 'Docker', 'AWS'],
    domain: 'High-Scale SaaS & Distributed Systems',
    roleExpectations: [
      'Deep mastery of caching strategies and cache invalidation',
      'Strong algorithmic problem solving and architectural trade-off reasoning',
    ],
  };

  return aiProvider.generateJSON(prompt, mock, { temperature: 0.2 });
}

/**
 * 3. Candidate-JD Skill Gap Matrix: Match candidate profile against JD requirements.
 */
async function analyzeResumeJDFit(resumeExtracted, jdExtracted) {
  const prompt = `
Perform a high-level candidate skill gap analysis comparing this Candidate's Resume Profile against the target Job Description.

Candidate Resume Profile:
${JSON.stringify(resumeExtracted)}

Job Description Profile:
${JSON.stringify(jdExtracted)}

Return ONLY valid JSON:
{
  "matchScore": 78,
  "matchedSkills": ["Node.js", "Redis", "REST APIs", "Docker"],
  "missingSkills": ["Kafka", "Advanced Distributed System Design", "Kubernetes"],
  "criticalGaps": ["Kafka message queues", "Distributed transactions"],
  "recommendations": [
    "Focus on demonstrating distributed caching trade-offs in the upcoming interview",
    "Prepare to defend Redis invalidation claims from your resume"
  ]
}
`.trim();

  const candidateSkills = new Set((resumeExtracted?.skills || []).map((s) => s.toLowerCase()));
  const jdRequired = jdExtracted?.requiredSkills || ['Node.js', 'System Design', 'Redis'];
  const matched = jdRequired.filter((s) => candidateSkills.has(s.toLowerCase()));
  const missing = jdRequired.filter((s) => !candidateSkills.has(s.toLowerCase()));
  const matchScore = Math.round((matched.length / Math.max(1, jdRequired.length)) * 100);

  const mock = {
    matchScore: Math.min(95, Math.max(45, matchScore)),
    matchedSkills: matched.length ? matched : ['Node.js', 'REST APIs', 'MongoDB'],
    missingSkills: missing.length ? missing : ['Kafka', 'System Design at Scale'],
    criticalGaps: missing.slice(0, 2),
    recommendations: [
      'Deepen knowledge on cache stampede and Redis eviction algorithms',
      'Review scalable system design patterns for distributed message queues',
    ],
  };

  return aiProvider.generateJSON(prompt, mock, { temperature: 0.3 });
}

/**
 * 4. Interview Question Generator: Adaptive, Persona-Aware, Resume/JD-Aware, and Coding-Ready.
 */
async function generateInterviewQuestions({
  category,
  topic,
  difficulty,
  numQuestions,
  company,
  resumeContext,
  jdContext,
  interviewType = 'standard',
  interviewerPersona = 'Professional',
  weakTopics,
}) {
  const isCoding = interviewType === 'coding' || category === 'DSA';

  const personaInstructions = {
    Professional: 'Maintain a formal, structured, clear, and professional tone. Focus on system architecture and standard engineering excellence.',
    Conversational: 'Use an engaging, friendly, collaborative tone with smooth spoken transitions (e.g., "Thanks for that! Let us now explore...").',
    Technical: 'Emphasize deep low-level mechanics, data structure trade-offs, cache invalidation, concurrency, and time/space complexity.',
    Strict: 'Be rigorous, challenge assumptions, focus on subtle edge cases, and push for production-grade resilience with minimal hand-holding.',
    HR: 'Focus on behavioral indicators, leadership principles, conflict resolution, ownership, and the STAR methodology.',
  }[interviewerPersona] || 'Maintain a professional and clear interview tone.';

  const companyStyle = company
    ? `Company-specific focus for ${company}: Align questions with publicly known engineering values, scalability challenges, and interview patterns for ${company}.`
    : 'Benchmark against top tier tech companies (e.g. Google, Amazon, Uber, Stripe).';

  const prompt = `
You are an AI Interviewer with a "${interviewerPersona}" persona conducting a realistic ${category} (${interviewType}) interview.
${personaInstructions}
${companyStyle}

Generate ${numQuestions} structured interview question(s).
Difficulty: ${difficulty}
Specific Topic / Focus: ${topic || category}

${resumeContext ? `Candidate Resume Context & Claims: ${typeof resumeContext === 'string' ? resumeContext : JSON.stringify(resumeContext)}` : ''}
${jdContext ? `Target Job Description Requirements: ${typeof jdContext === 'string' ? jdContext : JSON.stringify(jdContext)}` : ''}
${weakTopics?.length ? `Candidate's Historical Weak Areas to challenge: ${weakTopics.join(', ')}` : ''}

CRITICAL RULES:
1. Include a natural "spokenIntro" (1 short sentence) as the interviewer speaking directly to the candidate aloud (e.g. "Welcome Aryan, let's start with your backend experience.", "Great, let's explore database internals.").
2. When candidate projects/claims are provided, tailor questions directly to their actual architecture decisions.
3. For coding questions (${isCoding ? 'YES' : 'NO'}), include clear problem statement, starter code in JavaScript, and 3-4 visible/hidden test cases.
4. Include "idealAnswerConcepts" (list of 3-4 key technical bullet points a high-scoring answer should cover) and "idealAnswerStructure".

Return ONLY valid JSON matching this exact shape (array of objects):
[
  {
    "spokenIntro": "Spoken transition sentence from interviewer to candidate",
    "text": "Detailed question text or coding problem statement",
    "topic": "${topic || category}",
    "difficulty": "${difficulty}",
    "questionType": "${isCoding ? 'coding' : 'conceptual'}",
    "claimChallenged": "Specific resume claim or target JD skill being tested",
    "hints": ["Consider write-through vs cache-aside", "Think about concurrency lock"],
    "expectedAnswer": "A comprehensive model answer highlighting key trade-offs and edge cases.",
    "idealAnswerConcepts": ["Concept 1", "Concept 2", "Concept 3"],
    "idealAnswerStructure": "Overview -> Architecture Trade-off -> Edge Cases & Failure Mitigation",
    "starterCode": "${isCoding ? 'function solution(args) {\\n  // Write your code here\\n}' : ''}",
    "testCases": [
      { "input": "[2, 7, 11, 15], 9", "expectedOutput": "[0, 1]", "isHidden": false, "explanation": "2 + 7 = 9" },
      { "input": "[3, 2, 4], 6", "expectedOutput": "[1, 2]", "isHidden": false, "explanation": "2 + 4 = 6" }
    ],
    "followUpQuestions": ["How does your design change if the database writes spike by 10x?"]
  }
]
`.trim();

  const mock = Array.from({ length: numQuestions }).map((_, i) => ({
    spokenIntro: i === 0 ? `Hello! Let's kick off with your perspective on ${topic || category}.` : `Moving forward, let's explore ${topic || category}.`,
    text: isCoding
      ? `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`. What is the optimal time and space complexity?`
      : `In your backend architecture, you implemented Redis caching. Can you explain the difference between Cache-Aside and Write-Through caching patterns, and how you would prevent a Cache Stampede under sudden high traffic?`,
    topic: topic || category,
    difficulty,
    questionType: isCoding ? 'coding' : 'conceptual',
    claimChallenged: resumeContext ? 'Redis caching architecture in project' : `${category} core competency`,
    hints: [
      isCoding ? 'Use a Hash Map to store complements in O(n) time' : 'Discuss TTL, mutex locking, and probabilistic early expiration',
    ],
    expectedAnswer: isCoding
      ? 'An O(n) time and O(n) space solution using a Hash Map tracking seen numbers and their indices.'
      : 'Explain cache-aside read/write path, stale data trade-offs, and stampede mitigation using mutex locks (Redlock) or XFetch algorithm.',
    idealAnswerConcepts: [
      'Cache-Aside vs Write-Through write paths',
      'Data consistency & stale cache trade-offs',
      'Cache Stampede / Thundering Herd mitigation strategies (Mutex, Probabilistic TTL)',
    ],
    idealAnswerStructure: '1. Define the two caching patterns -> 2. Contrast consistency vs latency -> 3. Stampede mitigation mechanics.',
    starterCode: isCoding
      ? `function twoSum(nums, target) {\n  // Write your solution here\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`
      : '',
    testCases: isCoding
      ? [
          { input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]', isHidden: false, explanation: '2 + 7 = 9' },
          { input: '[3, 2, 4], 6', expectedOutput: '[1, 2]', isHidden: false, explanation: '2 + 4 = 6' },
          { input: '[3, 3], 6', expectedOutput: '[0, 1]', isHidden: true, explanation: 'Duplicate elements' },
        ]
      : [],
    followUpQuestions: [
      isCoding ? 'Can you solve this with O(1) extra space if the array is pre-sorted?' : 'What happens if the cache cluster fails entirely?',
    ],
  }));

  return aiProvider.generateJSON(prompt, mock, { temperature: 0.4 });
}

/**
 * 5. Adaptive Question Generator for subsequent interview turns.
 */
async function generateNextQuestion({
  category,
  topic,
  difficulty,
  company,
  previousQuestion,
  previousFeedback,
  previousUserAnswer,
  resumeContext,
  jdContext,
  weakTopics,
  interviewType = 'standard',
  interviewerPersona = 'Professional',
}) {
  const isCoding = interviewType === 'coding';

  const prompt = `
You are conducting a live, adaptive ${category} interview with persona "${interviewerPersona}".
Candidate was just evaluated. Now generate ONE next question at difficulty "${difficulty}".

Target Track: ${category}
Difficulty: ${difficulty}
Previous Question: "${previousQuestion}"
Candidate Answer: "${previousUserAnswer || ''}"
Evaluator Feedback: "${previousFeedback || ''}"
${resumeContext ? `Candidate Resume context: ${JSON.stringify(resumeContext)}` : ''}
${weakTopics?.length ? `Reinforce weak areas: ${weakTopics.join(', ')}` : ''}

INSTRUCTIONS:
1. Provide a natural "spokenIntro" transitioning smoothly from their previous answer (e.g., "Good explanation on indexing. Now let's explore database transactions under high concurrency.", "That's a valid approach. Let's see how that scales...").
2. If the candidate struggled, provide a conceptual reinforcement question that tests the underlying foundational mechanics.
3. If the candidate excelled, escalate to architectural trade-offs, scale edge cases, or production failure scenarios.
4. Include "idealAnswerConcepts" (3-4 core concepts) and "idealAnswerStructure".

Return ONLY valid JSON matching this shape (single object):
{
  "spokenIntro": "Spoken transition from interviewer to candidate",
  "text": "Question text",
  "topic": "${topic || category}",
  "difficulty": "${difficulty}",
  "questionType": "${isCoding ? 'coding' : 'conceptual'}",
  "claimChallenged": "Specific skill/claim challenged",
  "hints": ["Hint 1", "Hint 2"],
  "expectedAnswer": "Model answer",
  "idealAnswerConcepts": ["Core concept 1", "Core concept 2", "Core concept 3"],
  "idealAnswerStructure": "Step-by-step structure for a great response",
  "starterCode": "",
  "testCases": [],
  "followUpQuestions": ["Follow up question"]
}
`.trim();

  const mock = {
    spokenIntro: `That's an interesting perspective. Building on that, let's explore how this behaves under concurrency.`,
    text: `Building on your previous answer: how does your architectural approach behave under distributed concurrency where multiple workers attempt to mutate the same resource simultaneously?`,
    topic: topic || category,
    difficulty,
    questionType: 'conceptual',
    claimChallenged: 'Concurrency and distributed state synchronization',
    hints: ['Consider optimistic vs pessimistic locking', 'Think about idempotent transactions'],
    expectedAnswer: 'Detailed discussion of optimistic locking with version checks, Redis distributed locks, or database row-level locking.',
    idealAnswerConcepts: [
      'Optimistic locking with versioning / timestamp checks',
      'Pessimistic locking and row-level locks',
      'Distributed locks (e.g. Redlock) and race condition hazards',
    ],
    idealAnswerStructure: '1. Compare optimistic vs pessimistic concurrency -> 2. Discuss distributed locking -> 3. Highlight deadlock prevention.',
    starterCode: '',
    testCases: [],
    followUpQuestions: ['What are the deadlocking risks with distributed locks?'],
  };

  return aiProvider.generateJSON(prompt, mock, { temperature: 0.4 });
}

/**
 * 6. Intelligent Cross-Questioning: Actively challenges claims, architecture choices, and metrics.
 */
async function generateCrossQuestion({ currentQuestion, candidateAnswer, resumeContext }) {
  const prompt = `
You are an inquisitorial, technically curious senior tech lead.
The candidate just gave this response:
Question: "${currentQuestion}"
Candidate's Response: "${candidateAnswer}"
${resumeContext ? `Candidate Background: ${JSON.stringify(resumeContext)}` : ''}

Analyze the candidate's answer for:
- Technical buzzwords or vague claims ("improved performance", "used microservices", "cached data")
- Unstated assumptions, missing edge cases, or potential bottleneck points
- Concrete metrics or architecture decisions

Generate a sharp, conversational, and direct cross-examination follow-up question (1-2 sentences) challenging their specific claim.

Return ONLY valid JSON:
{
  "detectedClaim": "Claim identified in answer (e.g. used Redis caching for fast lookup)",
  "crossQuestion": "What exact eviction policy (LRU/LFU) did you configure, and how did you prevent cold cache latency spikes?",
  "focusArea": "Caching & Eviction Mechanics"
}
`.trim();

  const mock = {
    detectedClaim: 'Implementation choice in response',
    crossQuestion: 'What happens to this design if network latency between services spikes by 200ms, and how do you handle cascading timeouts?',
    focusArea: 'Fault Tolerance & Timeouts',
  };

  return aiProvider.generateJSON(prompt, mock, { temperature: 0.4 });
}

/**
 * 7. Answer Evaluation: Multi-dimensional assessment across 8 dimensions.
 */
async function evaluateAnswer({ question, expectedAnswer, userAnswer, category, codeLanguage, testResults }) {
  const prompt = `
You are an expert technical evaluator scoring an interview answer for a ${category} interview.

Question: ${question}
Expected Answer / Key Concepts: ${expectedAnswer}
Candidate's Answer / Code: ${userAnswer}
${testResults ? `Code Sandbox Test Results: ${JSON.stringify(testResults)}` : ''}

Score the candidate rigorously across each dimension and provide actionable constructive feedback.
Scoring:
- score: 0-100 overall
- correctnessScore: 0-10
- depthScore: 0-10
- communicationScore: 0-10
- confidence, communication, technicalAccuracy, problemSolving: 0-100

Return ONLY valid JSON:
{
  "score": 82,
  "correctnessScore": 8,
  "depthScore": 8,
  "communicationScore": 9,
  "confidence": 85,
  "communication": 80,
  "technicalAccuracy": 84,
  "problemSolving": 80,
  "dsaScore": 75,
  "codeQualityScore": 82,
  "feedback": "Concise 2-3 sentence assessment highlighting approach, precision, and depth.",
  "strengths": ["Clear explanation of data flow", "Correctly identified time complexity"],
  "weaknesses": ["Did not account for race conditions on concurrent writes"],
  "improvementSuggestions": ["Always articulate trade-offs between memory overhead and CPU speed"]
}
`.trim();

  const wordCount = (userAnswer || '').trim().split(/\s+/).filter(Boolean).length;
  const baseScore = Math.min(92, Math.max(35, 45 + Math.min(40, wordCount * 1.5)));

  const mock = {
    score: baseScore,
    correctnessScore: Math.round(baseScore / 10),
    depthScore: Math.max(4, Math.round((baseScore - 5) / 10)),
    communicationScore: Math.min(10, Math.round((baseScore + 5) / 10)),
    confidence: Math.max(40, baseScore - 5),
    communication: Math.max(40, baseScore + 2),
    technicalAccuracy: baseScore,
    problemSolving: Math.max(40, baseScore - 4),
    dsaScore: Math.max(40, baseScore),
    codeQualityScore: Math.max(40, baseScore + 5),
    feedback: 'Clear explanation with good technical depth. Demonstrates solid grasp of underlying concepts and architectural trade-offs.',
    strengths: ['Structured line of reasoning', 'Good attention to core complexity'],
    weaknesses: ['Could mention edge case handling and fallback resilience in more detail'],
    improvementSuggestions: ['Explicitly discuss scalability limits and failure modes'],
  };

  return aiProvider.generateJSON(prompt, mock, { temperature: 0.3 });
}

/**
 * 8. Code Submission Evaluation & Complexity Analysis
 */
async function evaluateCodeSubmission({ problemStatement, candidateCode, language = 'javascript', testResults }) {
  const prompt = `
You are an expert algorithmic code evaluator and competitive programming judge.
Problem: ${problemStatement}
Language: ${language}
Candidate Code:
"""
${candidateCode}
"""
Test Suite Results: ${JSON.stringify(testResults || {})}

Analyze the solution for:
1. Algorithmic Correctness & Edge Cases
2. Big-O Time Complexity (e.g. O(N), O(N log N), O(N^2))
3. Big-O Space Complexity (e.g. O(1), O(N))
4. Code Cleanliness, Variable Naming, Idiomatic Standards
5. Potential follow-up optimization question

Return ONLY valid JSON:
{
  "score": 88,
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(N)",
  "isOptimal": true,
  "correctness": "Passed all edge cases",
  "codeQuality": "Clean and idiomatic variable naming with clear early exit conditionals",
  "optimizationChallenge": "Can this be solved with O(1) auxiliary space if the input is sorted?",
  "suggestions": ["Consider adding input null-checks for defensive robustness"]
}
`.trim();

  const mock = {
    score: testResults?.passed ? 85 : 60,
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
    isOptimal: true,
    correctness: testResults?.passed ? 'Passed all test cases' : 'Failed 1 edge case test',
    codeQuality: 'Well-structured, readable implementation with clean variable names.',
    optimizationChallenge: 'How would you scale this if the array was larger than available RAM memory (streaming processing)?',
    suggestions: ['Profile memory allocation for very large inputs'],
  };

  return aiProvider.generateJSON(prompt, mock, { temperature: 0.2 });
}

/**
 * 9. Multi-Dimensional Overall Interview Assessment & Skill Gap Detection
 */
async function generateOverallAnalysis({ category, questionsWithEvaluations, resumeContext, jdContext }) {
  const prompt = `
You are the Head of Engineering Evaluator. Aggregate all question answers and candidate performance into a comprehensive, multi-dimensional evaluation report.

Track: ${category}
Questions & Evaluations:
${JSON.stringify(questionsWithEvaluations)}
${resumeContext ? `Candidate Resume: ${JSON.stringify(resumeContext)}` : ''}
${jdContext ? `Job Description: ${JSON.stringify(jdContext)}` : ''}

Generate detailed scores across 8 Category Dimensions (0-100):
1. technicalKnowledge
2. problemSolving
3. communication
4. answerAccuracy
5. depthOfKnowledge
6. confidence
7. behavioralSkills
8. timeManagement

Also provide:
- "keyInsight": { "mainImprovement": "One clear sentence on their single most important area of improvement.", "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"] }
- "topicsToRevise": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"]
- "recommendedQuestions": ["Question 1 to practice next", "Question 2 to practice next"]
- "personalizedPlan": ["Step 1 plan", "Step 2 plan", "Step 3 plan"]
- "interviewSummary": "2-3 sentences summarizing performance."

Return ONLY valid JSON matching this schema:
{
  "overallScore": 82,
  "confidence": 80,
  "communication": 85,
  "technicalAccuracy": 84,
  "problemSolving": 80,
  "dsaScore": 78,
  "codeQualityScore": 82,
  "systemDesignScore": 76,
  "fundamentalsScore": 85,
  "claimDefenseScore": 80,
  "categoryScores": {
    "technicalKnowledge": 86,
    "problemSolving": 84,
    "communication": 78,
    "answerAccuracy": 82,
    "depthOfKnowledge": 76,
    "confidence": 80,
    "behavioralSkills": 85,
    "timeManagement": 88
  },
  "keyInsight": {
    "mainImprovement": "Your technical knowledge is strong, but your answers often lack a structured explanation of trade-offs.",
    "recommendations": [
      "Explicitly state both pros and cons before committing to an architecture choice.",
      "Incorporate concrete scalability metrics (QPS, memory consumption) into your explanations.",
      "Practice the STAR technique when narrating previous project implementations."
    ]
  },
  "topicsToRevise": ["Redis Caching", "Database Indexing", "Load Balancing", "System Design Fundamentals"],
  "recommendedQuestions": [
    "How does Redis handle memory eviction under high write volume?",
    "Explain the trade-offs between B-Tree and LSM-Tree indexes."
  ],
  "personalizedPlan": [
    "Review distributed locking and cache stampede mitigations this week.",
    "Solve 3 medium graph problems on shortest path algorithms.",
    "Conduct a 30-minute targeted mock interview focusing on System Design."
  ],
  "interviewSummary": "Candidate demonstrated solid fundamental concepts with clear communication. Technical depth in distributed architectures and trade-off analysis has room for improvement.",
  "strongAreas": ["REST API Architecture", "Redis Caching", "Algorithmic Logic"],
  "weakAreas": ["Distributed Transactions", "Cache Invalidation under High Write Load"],
  "suggestions": [
    "Practice designing idempotency mechanisms for distributed systems",
    "Deep dive into Redis eviction strategies and multi-region replication"
  ],
  "topicBreakdown": [
    { "topic": "Backend Architecture", "accuracy": 85, "classification": "Strong" },
    { "topic": "Caching & Invalidation", "accuracy": 62, "classification": "Developing" },
    { "topic": "Distributed Concurrency", "accuracy": 45, "classification": "Weak" }
  ],
  "evidenceQuotes": [
    {
      "dimension": "Technical Depth",
      "quote": "I implemented Cache-Aside with Redis and TTL for token verification.",
      "analysis": "Solid grasp of caching patterns, clearly articulated data consistency challenges.",
      "isPositive": true
    },
    {
      "dimension": "System Design",
      "quote": "If the database fails we retry indefinitely until success.",
      "analysis": "Lacks exponential backoff and circuit breaker protection against thundering herds.",
      "isPositive": false
    }
  ],
  "skillGaps": [
    { "skill": "Cache Invalidation & Stampede", "category": "Backend", "currentScore": 54, "priority": "High" },
    { "skill": "Distributed Transactions", "category": "System Design", "currentScore": 48, "priority": "High" }
  ]
}
`.trim();

  const avg = (key) => {
    const vals = questionsWithEvaluations.map((q) => q.evaluation?.[key] || q.evaluation?.score || 0).filter(Boolean);
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 75;
  };

  const score = avg('score');

  const mock = {
    overallScore: score,
    confidence: avg('confidence'),
    communication: avg('communication'),
    technicalAccuracy: avg('technicalAccuracy'),
    problemSolving: avg('problemSolving'),
    dsaScore: avg('dsaScore') || score,
    codeQualityScore: avg('codeQualityScore') || score,
    systemDesignScore: Math.max(45, score - 6),
    fundamentalsScore: Math.min(95, score + 4),
    claimDefenseScore: score,
    categoryScores: {
      technicalKnowledge: avg('technicalAccuracy'),
      problemSolving: avg('problemSolving'),
      communication: avg('communication'),
      answerAccuracy: score,
      depthOfKnowledge: Math.max(50, score - 5),
      confidence: avg('confidence'),
      behavioralSkills: Math.min(90, score + 3),
      timeManagement: 85,
    },
    keyInsight: {
      mainImprovement: 'Your technical knowledge is solid, but answers would benefit from deeper trade-off discussions.',
      recommendations: [
        'Explicitly discuss failure modes and retry strategies when proposing architectures.',
        'Clarify assumptions about traffic patterns before diving into implementation details.',
        'Highlight time and space complexity trade-offs upfront.',
      ],
    },
    topicsToRevise: [category, 'System Scalability', 'Caching & Invalidation', 'Concurrency'],
    recommendedQuestions: [
      `How would you architect a fault-tolerant caching system for ${category}?`,
      `What are the key trade-offs between consistency and availability in this design?`,
    ],
    personalizedPlan: [
      'Focus on reviewing distributed system bottlenecks and recovery mechanisms.',
      'Practice 5 medium-difficulty algorithmic challenges.',
      'Take a scheduled mock interview with a strict technical interviewer persona.',
    ],
    interviewSummary: `Candidate completed a ${category} session with an overall score of ${score}%. Strong fundamentals with actionable areas for deepening system architecture trade-offs.`,
    strongAreas: [category, 'System Scalability', 'Core Fundamentals'],
    weakAreas: ['Edge Case Resilience', 'High Concurrency Invalidation'],
    suggestions: [
      'Structure answers with concrete approach, trade-offs, and failure mitigations.',
      'Practice identifying bottleneck points in distributed pipelines.',
    ],
    topicBreakdown: [
      { topic: category, accuracy: score, classification: score >= 75 ? 'Strong' : 'Developing' },
      { topic: 'System Design', accuracy: Math.max(45, score - 8), classification: 'Developing' },
      { topic: 'Concurrency & Locking', accuracy: Math.max(40, score - 15), classification: 'Weak' },
    ],
    evidenceQuotes: [
      {
        dimension: 'Technical Accuracy',
        quote: questionsWithEvaluations[0]?.userAnswer?.slice(0, 100) || 'Provided structured breakdown of architecture.',
        analysis: 'Demonstrated solid fundamental approach and trade-off awareness.',
        isPositive: true,
      },
    ],
    skillGaps: [
      { skill: `${category} Invalidation & Edge Cases`, category: 'Backend', currentScore: Math.max(42, score - 12), priority: 'High' },
    ],
  };

  return aiProvider.generateJSON(prompt, mock, { temperature: 0.3 });
}

/**
 * 10. Personalized Learning Roadmap Generator for Identified Skill Gaps
 */
async function generateLearningRoadmap({ targetSkill, category, candidatePerformanceSummary }) {
  const prompt = `
You are a Staff Software Engineering Mentor.
Create a high-impact, actionable, personalized 4-module Learning Path for this specific weak skill: "${targetSkill}" (${category}).

Candidate context & gap summary:
${candidatePerformanceSummary || `Struggled with ${targetSkill} in interview.`}

Return ONLY valid JSON:
{
  "summary": "Master ${targetSkill} through progressive conceptual grounding, architectural blueprints, and targeted interview drills.",
  "difficulty": "Intermediate",
  "estimatedHours": 4,
  "modules": [
    {
      "title": "1. Core Fundamentals & Internal Mechanics",
      "description": "Understand the foundational architecture, memory models, and core algorithms of ${targetSkill}.",
      "concepts": ["Basic architecture", "Key data structures", "Memory overhead"],
      "learningObjectives": ["Explain internal mechanics clearly in an interview", "Identify basic anti-patterns"],
      "scenarioQuestions": [
        {
          "question": "What is the primary trade-off when selecting ${targetSkill} over traditional alternatives?",
          "explanation": "Discuss throughput, latency, and consistency guarantees.",
          "keyTakeaway": "Always evaluate read/write ratio before deciding."
        }
      ]
    },
    {
      "title": "2. Production Architecture & Invalidation Strategies",
      "description": "Design resilient multi-node pipelines with TTL, eviction, and consistency.",
      "concepts": ["Eviction algorithms", "Concurrency safety", "Cache stampede mitigations"],
      "learningObjectives": ["Architect zero-downtime invalidation pipelines"],
      "scenarioQuestions": [
        {
          "question": "How do you handle sudden key expiration spikes across thousands of concurrent clients?",
          "explanation": "Use probabilistic early expiration (XFetch) or distributed mutex locks.",
          "keyTakeaway": "Never rely on naive TTL in high-throughput systems."
        }
      ]
    },
    {
      "title": "3. Real-World Scenario & Failure Modes",
      "description": "Troubleshoot production incidents, partition tolerance, and network partition recovery.",
      "concepts": ["Network partitions", "Circuit breakers", "Graceful degradation"],
      "learningObjectives": ["Defend architectural decisions under interviewer pressure"],
      "scenarioQuestions": [
        {
          "question": "What happens if the cluster crashes during a bulk write operation?",
          "explanation": "Implement write-ahead logging and atomic rollbacks.",
          "keyTakeaway": "Design for failure as a first-class requirement."
        }
      ]
    },
    {
      "title": "4. Mock Interview & Defense Re-Evaluation",
      "description": "Execute targeted rapid-fire drills and code challenges to verify mastery.",
      "concepts": ["Complexity analysis", "Trade-off articulation"],
      "learningObjectives": ["Achieve 85%+ score on re-evaluation"],
      "scenarioQuestions": [
        {
          "question": "Summarize your 3 golden rules when architecting ${targetSkill} in high-scale systems.",
          "explanation": "1. Idempotency, 2. Observability, 3. Fault isolation.",
          "keyTakeaway": "Clarity of communication separates senior engineers."
        }
      ]
    }
  ]
}
`.trim();

  const mock = {
    summary: `Master ${targetSkill} through progressive conceptual grounding, architectural blueprints, and targeted interview drills.`,
    difficulty: 'Intermediate',
    estimatedHours: 4,
    modules: [
      {
        title: `1. Fundamentals of ${targetSkill}`,
        description: `Understand the foundational architecture, memory models, and core algorithms of ${targetSkill}.`,
        concepts: ['Internal architecture', 'Key data structures', 'Memory management'],
        learningObjectives: [`Explain internal mechanics of ${targetSkill} clearly in an interview`],
        scenarioQuestions: [
          {
            question: `What is the primary trade-off when selecting ${targetSkill} in high-scale systems?`,
            explanation: 'Focus on throughput vs consistency, memory costs, and operational complexity.',
            keyTakeaway: 'Always weigh read/write ratios and latency budgets.',
          },
        ],
      },
      {
        title: '2. High-Scale Architecture & Invalidation',
        description: 'Design resilient multi-node pipelines with TTL, eviction, and consistency.',
        concepts: ['Eviction policies', 'Concurrency locking', 'Thundering herd mitigation'],
        learningObjectives: ['Architect zero-downtime pipelines'],
        scenarioQuestions: [
          {
            question: 'How do you prevent a Cache Stampede when a high-traffic key expires?',
            explanation: 'Implement distributed locking with Redis mutex or probabilistic early expiration.',
            keyTakeaway: 'Never let uncoordinated client threads slam the database at once.',
          },
        ],
      },
      {
        title: '3. Production Incident Troubleshooting',
        description: 'Troubleshoot production incidents, partition tolerance, and network partition recovery.',
        concepts: ['Circuit breakers', 'Graceful fallback', 'Distributed transactions'],
        learningObjectives: ['Defend system designs under intense interviewer cross-questioning'],
        scenarioQuestions: [
          {
            question: 'What is your fallback strategy when downstream clusters become unreachable?',
            explanation: 'Employ circuit breakers (e.g. Resilience4j) and serve stale or cached fallback responses.',
            keyTakeaway: 'Design systems with graceful degradation.',
          },
        ],
      },
      {
        title: '4. Targeted Mock Practice & Re-Evaluation',
        description: 'Execute targeted rapid-fire drills and code challenges to verify mastery.',
        concepts: ['Trade-off defense', 'Complexity validation'],
        learningObjectives: ['Achieve 85%+ score on re-evaluation'],
        scenarioQuestions: [
          {
            question: 'How would you defend your architecture to a principal engineer?',
            explanation: 'Lead with numbers, constraints, and explicit trade-off justifications.',
            keyTakeaway: 'Great engineers focus on trade-offs rather than perfection.',
          },
        ],
      },
    ],
  };

  return aiProvider.generateJSON(prompt, mock, { temperature: 0.3 });
}

/**
 * 11. Targeted Practice Generator for Skill Drills & Quizzes
 */
async function generatePracticeDrill({ skillName, category, difficulty = 'Medium' }) {
  const prompt = `
Generate 4 targeted practice questions (a mix of multi-choice quiz and scenario drills) to test and improve candidate mastery of "${skillName}" (${category}) at "${difficulty}" level.

Return ONLY valid JSON:
[
  {
    "questionType": "quiz",
    "prompt": "Clear, technically deep question regarding ${skillName}",
    "options": [
      "Option A explanation",
      "Option B explanation",
      "Option C explanation",
      "Option D explanation"
    ],
    "correctOptionIndex": 1,
    "modelExplanation": "Comprehensive technical reasoning why Option B is correct and others are flawed."
  },
  {
    "questionType": "scenario",
    "prompt": "Scenario: Under sudden spike traffic of 50k req/sec, ${skillName} encounters lock contention. How do you resolve it?",
    "options": [
      "Increase thread count indefinitely",
      "Implement sharded locking with consistent hashing",
      "Disable persistence completely",
      "Switch to synchronous disk writes"
    ],
    "correctOptionIndex": 1,
    "modelExplanation": "Sharded locking partitions keyspaces, removing global contention bottlenecks."
  }
]
`.trim();

  const mock = [
    {
      questionType: 'quiz',
      prompt: `Which eviction algorithm in ${skillName} is best suited for workloads with bursty historical access patterns?`,
      options: ['FIFO (First In First Out)', 'LFU (Least Frequently Used)', 'Random Eviction', 'No Eviction (Throw OOM)'],
      correctOptionIndex: 1,
      modelExplanation: 'LFU tracks frequency counters rather than recency, preventing one-time scan operations from polluting the hot cache.',
    },
    {
      questionType: 'scenario',
      prompt: `In a high-scale microservices architecture using ${skillName}, a database write succeeds but cache invalidation fails due to network glitch. How do you guarantee eventual consistency?`,
      options: [
        'Retry in an infinite loop synchronously on the main thread',
        'Use Transactional Outbox pattern with reliable message queue retries and short TTL fallbacks',
        'Ignore the cache failure and let data remain stale forever',
        'Wipe the entire cache database on every error',
      ],
      correctOptionIndex: 1,
      modelExplanation: 'The Transactional Outbox pattern atomically logs the invalidation event with the database commit, and background workers guarantee delivery to the cache.',
    },
    {
      questionType: 'quiz',
      prompt: `What is the time complexity of looking up a key by hash in a standard distributed ${skillName} cluster?`,
      options: ['O(1) average case', 'O(N) linear', 'O(log N) tree search', 'O(N^2)'],
      correctOptionIndex: 0,
      modelExplanation: 'Direct hash slot lookup via CRC16 hash algorithm resolves in O(1) constant time to the target node.',
    },
    {
      questionType: 'scenario',
      prompt: `How do you safeguard against cascading failures when ${skillName} experiences high latency?`,
      options: [
        'Set infinite client timeout',
        'Implement Circuit Breaker with exponential backoff and localized fallback cache',
        'Restart all application servers simultaneously',
        'Double the request rate',
      ],
      correctOptionIndex: 1,
      modelExplanation: 'Circuit breakers prevent exhausted connection pools by tripping open when error thresholds are exceeded, serving cached fallbacks.',
    },
  ];

  return aiProvider.generateJSON(prompt, mock, { temperature: 0.3 });
}

module.exports = {
  extractResumeData,
  extractJobDescription,
  analyzeResumeJDFit,
  generateInterviewQuestions,
  generateNextQuestion,
  generateCrossQuestion,
  evaluateAnswer,
  evaluateCodeSubmission,
  generateOverallAnalysis,
  generateLearningRoadmap,
  generatePracticeDrill,
  nextDifficulty,
};
