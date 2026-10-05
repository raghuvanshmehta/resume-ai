/**
 * Static knowledge base for the ResumeAI analysis engine.
 *
 * Everything here is data, not logic — the engine in `analyzer.ts` walks these
 * tables to score a resume. When a real model API is wired in, this file stays
 * as the deterministic fallback / cold-start path.
 */

export interface SkillDef {
  name: string
  group: string
  aliases?: string[]
  /** How important this skill is for the default target role. */
  weight: number
}

export const SKILL_CATALOG: SkillDef[] = [
  // Programming
  { name: 'Python', group: 'Programming', weight: 10 },
  { name: 'Java', group: 'Programming', aliases: ['Core Java'], weight: 8 },
  { name: 'C++', group: 'Programming', aliases: ['CPP'], weight: 7 },
  { name: 'JavaScript', group: 'Programming', aliases: ['ES6', 'JS'], weight: 9 },
  { name: 'TypeScript', group: 'Programming', aliases: ['TS'], weight: 8 },
  { name: 'Go', group: 'Programming', aliases: ['Golang'], weight: 5 },
  { name: 'Dart', group: 'Programming', weight: 3 },

  // Web
  { name: 'React', group: 'Web', aliases: ['React.js', 'ReactJS'], weight: 10 },
  { name: 'Node.js', group: 'Web', aliases: ['NodeJS'], weight: 9 },
  { name: 'Express', group: 'Web', aliases: ['Express.js'], weight: 6 },
  { name: 'Next.js', group: 'Web', aliases: ['NextJS'], weight: 5 },
  { name: 'HTML', group: 'Web', aliases: ['HTML5'], weight: 5 },
  { name: 'CSS', group: 'Web', aliases: ['CSS3', 'Tailwind', 'Tailwind CSS'], weight: 5 },
  { name: 'Redux', group: 'Web', weight: 4 },
  { name: 'REST API', group: 'Web', aliases: ['RESTful', 'REST APIs', 'REST'], weight: 8 },
  { name: 'GraphQL', group: 'Web', weight: 4 },

  // Database
  { name: 'SQL', group: 'Database', weight: 10 },
  { name: 'PostgreSQL', group: 'Database', aliases: ['Postgres'], weight: 7 },
  { name: 'MySQL', group: 'Database', weight: 5 },
  { name: 'MongoDB', group: 'Database', aliases: ['Mongoose'], weight: 7 },
  { name: 'Redis', group: 'Database', weight: 4 },

  // Tools
  { name: 'Git', group: 'Tools', weight: 8 },
  { name: 'GitHub', group: 'Tools', aliases: ['Github'], weight: 5 },
  { name: 'VS Code', group: 'Tools', aliases: ['VSCode', 'Visual Studio Code'], weight: 3 },
  { name: 'Docker', group: 'Tools', aliases: ['Docker Compose'], weight: 7 },
  { name: 'AWS', group: 'Tools', aliases: ['Amazon Web Services', 'EC2', 'S3'], weight: 7 },
  { name: 'Kubernetes', group: 'Tools', aliases: ['K8s'], weight: 5 },
  { name: 'Linux', group: 'Tools', aliases: ['Ubuntu', 'Bash'], weight: 6 },
  { name: 'CI/CD', group: 'Tools', aliases: ['GitHub Actions', 'Jenkins'], weight: 6 },
  { name: 'Postman', group: 'Tools', weight: 3 },
  { name: 'Figma', group: 'Tools', weight: 3 },

  // Data & AI
  { name: 'Machine Learning', group: 'Data & AI', aliases: ['scikit-learn'], weight: 8 },
  { name: 'Pandas', group: 'Data & AI', aliases: ['NumPy'], weight: 6 },
  { name: 'Data Analysis', group: 'Data & AI', aliases: ['data analysis'], weight: 6 },
  { name: 'TensorFlow', group: 'Data & AI', weight: 5 },

  // CS fundamentals
  { name: 'Data Structures', group: 'CS Fundamentals', aliases: ['DSA', 'Algorithms'], weight: 7 },
  { name: 'OOP', group: 'CS Fundamentals', aliases: ['Object Oriented', 'Object-Oriented'], weight: 6 },
  { name: 'System Design', group: 'CS Fundamentals', weight: 6 },
]

export const GROUP_ORDER = [
  'Programming',
  'Web',
  'Database',
  'Tools',
  'Data & AI',
  'CS Fundamentals',
] as const

export const GROUP_ICONS: Record<string, string> = {
  Programming: 'code',
  Web: 'globe',
  Database: 'database',
  Tools: 'wrench',
  'Data & AI': 'brain',
  'CS Fundamentals': 'layers',
}

/** Weak verbs that read as responsibility dumps rather than results. */
export const WEAK_VERBS = [
  'worked on', 'helped', 'responsible for', 'involved in', 'assisted',
  'participated', 'did', 'made', 'worked with', 'familiar with', 'exposed to',
]

/** Strong, recruiter-scanning action verbs. */
export const STRONG_VERBS = [
  'built', 'wrote', 'designed', 'architected', 'engineered', 'optimized',
  'optimised', 'reduced', 'increased', 'led', 'shipped', 'deployed',
  'automated', 'migrated', 'scaled', 'launched', 'refactored', 'delivered',
  'implemented', 'streamlined', 'benchmarked',
]

export const SECTION_PATTERNS: { id: string; label: string; regex: RegExp }[] = [
  { id: 'summary', label: 'Professional Summary', regex: /\b(summary|profile|objective|about me|career summary)\b/i },
  { id: 'experience', label: 'Experience', regex: /\b(experience|work experience|employment|internships?|professional experience)\b/i },
  { id: 'projects', label: 'Projects', regex: /\b(projects?|academic projects|personal projects|capstone)\b/i },
  { id: 'skills', label: 'Skills', regex: /\b(skills|technical skills|technologies|tech stack|core competencies)\b/i },
  { id: 'education', label: 'Education', regex: /\b(education|academic background|qualifications)\b/i },
  { id: 'achievements', label: 'Achievements', regex: /\b(achievements?|awards?|honou?rs|certifications?|accomplishments)\b/i },
]

/** Role → the skills a hiring screen for that role actually filters on. */
export const ROLE_CORE_SKILLS: Record<string, string[]> = {
  'Software Engineer': ['Python', 'SQL', 'Git', 'React', 'Data Structures', 'REST API'],
  'Backend Developer': ['Python', 'SQL', 'PostgreSQL', 'REST API', 'Git', 'Docker'],
  'Frontend Developer': ['React', 'JavaScript', 'HTML', 'CSS', 'Git', 'TypeScript'],
  'Data Analyst': ['SQL', 'Python', 'Pandas', 'Data Analysis', 'MySQL', 'REST API'],
  'Full Stack Developer': ['React', 'Node.js', 'SQL', 'JavaScript', 'Git', 'REST API'],
  'Data Scientist': ['Python', 'Machine Learning', 'Pandas', 'SQL', 'TensorFlow', 'Data Structures'],
  'DevOps Engineer': ['Docker', 'CI/CD', 'Linux', 'Git', 'AWS', 'Kubernetes'],
}

export const TARGET_ROLES = Object.keys(ROLE_CORE_SKILLS)

export const SAMPLE_JOB_DESCRIPTION = `Backend Developer — Nimbus Labs (Bengaluru, Hybrid)

We are hiring a Backend Developer to build and scale the services that power our
analytics platform. You will own features end to end, from schema design through
to production monitoring.

What you will do
- Design, build and ship REST APIs in Python (FastAPI / Flask)
- Model and query data in PostgreSQL; write efficient SQL for large datasets
- Work with the frontend team on React-based internal tooling
- Containerise services with Docker and keep CI pipelines green on GitHub
- Review code, write tests, and improve reliability and performance

What we look for
- Strong Python and SQL; PostgreSQL experience is a big plus
- Solid grasp of data structures, algorithms and API design
- Production experience with Redis or another in-memory cache
- Comfort with Git, code review and agile delivery
- Bonus: Linux, AWS or Kubernetes experience
- Bonus: system design exposure and a shipped project with real users`

/** A complete, realistic final-year student resume — the engine parses this for real. */
export const DEMO_RESUME_TEXT = `AARAV MEHTA
Bengaluru, India | +91 98765 43210 | aarav.mehta.dev@gmail.com | linkedin.com/in/aaravmehta | github.com/aaravmehta

SUMMARY
Computer Science undergraduate (Batch of 2026) with strong fundamentals in data structures,
algorithms and full-stack development. Built 4 production-grade projects used by 3,000+ students
on campus. Looking for a Backend / Software Engineering role where I can ship reliable systems.

SKILLS
Programming: Python, Java, C++, JavaScript
Web: HTML, CSS, JavaScript, React, Node.js, Express, REST API
Database: SQL, PostgreSQL, MySQL, MongoDB
Tools: Git, GitHub, VS Code, Postman, Docker
Fundamentals: Data Structures, Algorithms, OOP, DBMS, Operating Systems

EDUCATION
B.Tech, Computer Science and Engineering - R.V. College of Engineering, Bengaluru
2022 - 2026 | CGPA: 8.7/10
Relevant coursework: Data Structures and Algorithms, DBMS, Operating Systems, Computer Networks

EXPERIENCE
Software Engineering Intern - Zeta Payments, Bengaluru (May 2025 - Jul 2025)
- Built a Python reconciliation service that matched 1.2M transactions/day and cut manual review time by 70%
- Optimised 14 slow PostgreSQL queries, reducing p95 API latency from 840ms to 210ms
- Wrote 60+ unit tests with pytest, lifting coverage on the payments module from 41% to 86%
- Worked on REST API endpoints consumed by 3 internal teams

Teaching Assistant - Data Structures and Algorithms, R.V. College of Engineering (Aug 2024 - Dec 2024)
- Mentored 120 students across 4 lab batches on trees, graphs, dynamic programming and greedy methods
- Designed 12 practice problems and 4 weekly contests; average batch score improved from 58% to 79%

PROJECTS
CampusHive - Campus Marketplace Platform (React, Node.js, Express, PostgreSQL, Docker)
- Full-stack marketplace where students buy and sell used goods; used by 3,000+ students across 6 hostels
- Designed a PostgreSQL schema with 18 tables and wrote indexed queries that kept listing search under 90ms
- Built JWT auth, image upload and a dispute-resolution flow; handled 1,400+ listings in the first semester
- Containerised the stack with Docker Compose and deployed it on an Ubuntu VPS behind Nginx

MediTrack - Hospital Records Dashboard (Python, Flask, SQLite, Chart.js)
- Helped build a dashboard for a blood-bank workflow to track inventory and donor availability
- Responsible for the frontend pages and some API work
- Used Chart.js to make graphs

AlgoViz - Algorithm Visualiser (Python, Django, JavaScript)
- Interactive visualiser for sorting, graph-traversal and dynamic-programming algorithms
- Wrote a step-by-step animation engine that renders 14 algorithms as replayable sequences
- Deployed for the DSA club; 900+ unique visits during exam season

Sortify - CLI Sorting Benchmark (C++)
- Command-line benchmark comparing 6 sorting algorithms across 10 dataset sizes
- Collected runtime and comparison counts, then published a short analysis with charts
- Published the benchmark notebook to the DSA club; 320 downloads in the first month

ACHIEVEMENTS
- Winner, Intra-College Hackathon 2025 - 36 hour build, team of 4, first place out of 42 teams
- Rank 1280 / 94,000 on LeetCode (contest rating 1721, Top 1.4%)
- Smart India Hackathon 2024 quarter-finalist
- Certified: Oracle Java Foundations, HackerRank SQL (Advanced)
`

export const SEED_HISTORY = [
  { label: 'Jun', score: 54 },
  { label: 'Jul', score: 61 },
  { label: 'Aug', score: 68 },
  { label: 'Sep', score: 74 },
  { label: 'Oct', score: 79 },
  { label: 'Nov', score: 82 },
]

export const TIPS = [
  'Quantified bullets are 2.4x more likely to earn an interview callback.',
  'Recruiters spend 7.4 seconds on a first pass — lead with impact, not duties.',
  'A clear Skills section lifts ATS keyword matching by roughly 31%.',
  'Replace "responsible for" with an action verb and a number.',
  'One page per three years of experience keeps signal-to-noise high.',
]
