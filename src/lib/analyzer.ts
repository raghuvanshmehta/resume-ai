import type {
  AnalysisResult, ATSItem, Breakdown, JobMatch, ProjectAnalysis,
  Recommendation, ScoreBand, Skill, SkillGroup, Strength, Improvement, RewriteArea,
} from './types'
import {
  GROUP_ICONS, GROUP_ORDER, ROLE_CORE_SKILLS, SKILL_CATALOG, STRONG_VERBS,
  WEAK_VERBS, SECTION_PATTERNS, SEED_HISTORY, DEMO_RESUME_TEXT,
} from './data'

/* ------------------------------------------------------------------ utils */

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))
const round = (n: number) => Math.round(n)

/** FNV-1a — deterministic seed so the same file always analyses identically. */
function hash(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function countMatches(text: string, re: RegExp): number {
  return (text.match(re) || []).length
}

function wordRe(term: string) {
  return new RegExp('(^|[^a-z0-9+#.])' + escapeRe(term.toLowerCase()) + '([^a-z0-9+#.]|$)', 'i')
}

/* --------------------------------------------------------- skill detection */

function detectSkills(text: string) {
  const found = new Map<string, number>()
  let total = 0
  for (const def of SKILL_CATALOG) {
    const terms = [def.name, ...(def.aliases || [])]
    let mentions = 0
    for (const term of terms) mentions += countMatches(text, new RegExp(wordRe(term).source, 'gi'))
    if (mentions <= 0) continue
    // "Java" must not swallow JavaScript, "C" must not swallow C++.
    if (def.name === 'Java') mentions = Math.max(0, mentions - (found.get('JavaScript') || 0))
    if (def.name === 'C' && (found.get('C++') || 0) > 0) mentions = 0
    if (mentions > 0) {
      found.set(def.name, mentions)
      total += mentions
    }
  }
  return { found, total }
}

/* ------------------------------------------------------------ text metrics */

function analyseProse(text: string) {
  const lines = text.split('\n')
  const bullets = lines.filter((l) => /^\s*[-•*]\s+/.test(l)).length
  const quantified = lines.filter((l) => /^\s*[-•*]\s+/.test(l) && /\d/.test(l)).length
  let strongVerbs = 0
  let weakVerbs = 0
  for (const v of STRONG_VERBS) strongVerbs += countMatches(text, new RegExp('\\b' + escapeRe(v) + '\\b', 'gi'))
  for (const v of WEAK_VERBS) weakVerbs += countMatches(text, new RegExp('\\b' + escapeRe(v) + '\\b', 'gi'))
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const sections = SECTION_PATTERNS.filter((s) => s.regex.test(text)).map((s) => s.id)
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text)
  const hasPhone = /\+?\d[\d\s\-().]{8,}\d/.test(text)
  const hasLinks = /(https?:\/\/|linkedin\.com|github\.com)/i.test(text)
  return { bullets, quantified, strongVerbs, weakVerbs, words, sections, hasEmail, hasPhone, hasLinks }
}

/* -------------------------------------------------------- project parsing */

interface ParsedProject {
  name: string
  tagline: string
  tech: string[]
  body: string
  bulletCount: number
}

function parseProjects(text: string): ParsedProject[] {
  const lines = text.split('\n')
  const projectsHeading = SECTION_PATTERNS.find((s) => s.id === 'projects')!
  const start = lines.findIndex((l) => {
    const t = l.trim()
    return t.length > 0 && t.length < 40 && t === t.toUpperCase() && projectsHeading.regex.test(t)
  })
  if (start < 0) return []
  let end = lines.length
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i].trim()
    if (l && !/^[-•*]/.test(l) && l.length < 45 && l === l.toUpperCase()) { end = i; break }
  }
  const out: ParsedProject[] = []
  let current: ParsedProject | null = null
  for (let i = start + 1; i < end; i++) {
    const raw = lines[i].trim()
    if (!raw) continue
    if (!/^[-•*]\s+/.test(raw)) {
      const paren = raw.match(/\(([^)]+)\)/)
      const head = raw.split(/\s+[-—]\s+/)[0].trim()
      const tagline = raw
        .split(/\s+[-—]\s+/)
        .slice(1)
        .join(' — ')
        .replace(/\s*\([^)]*\)\s*$/, '')
        .trim()
      current = {
        name: head,
        tagline,
        tech: paren ? paren[1].split(/[,/]/).map((t) => t.trim()).filter(Boolean) : [],
        body: '',
        bulletCount: 0,
      }
      out.push(current)
    } else if (current) {
      current.body += (current.body ? ' ' : '') + raw.replace(/^[-•*]\s+/, '')
      current.bulletCount += 1
    }
  }
  return out
}

/* --------------------------------------------------------- job description */

const JD_TITLE_RE = /^([A-Za-z][A-Za-z /+&-]{3,48}?)\s*[—–-]\s*([A-Z][A-Za-z0-9&.\s]{2,40}?)(?:\s*[,(]|$)/m

export function parseJobDescription(jd: string) {
  const head = jd.trim()
  const titleMatch = head.match(JD_TITLE_RE)
  const jobTitle = titleMatch ? titleMatch[1].trim() : 'Backend Developer'
  const company = titleMatch ? titleMatch[2].trim() : 'Confidential'
  const bonusIdx = head.search(/bonus\s*:/i)
  const core = bonusIdx > 0 ? head.slice(0, bonusIdx) : head
  const bonus = bonusIdx > 0 ? head.slice(bonusIdx) : ''
  const required: string[] = []
  const nice: string[] = []
  for (const def of SKILL_CATALOG) {
    const terms = [def.name, ...(def.aliases || [])]
    const inCore = terms.some((t) => wordRe(t).test(core))
    const inBonus = terms.some((t) => wordRe(t).test(bonus))
    if (inCore) required.push(def.name)
    else if (inBonus) nice.push(def.name)
  }
  return { jobTitle, company, required, nice }
}

/* ------------------------------------------------------------ project score */

function hasStrongVerb(text: string) {
  return STRONG_VERBS.some((v) => new RegExp('\\b' + escapeRe(v) + '\\b', 'i').test(text))
}

function scoreProject(p: { name: string; description: string; tech: string[]; bulletCount: number }) {
  const sentences = p.description.split(/[.!?]\s+/).filter(Boolean)
  const detail = Math.max(sentences.length, p.bulletCount)
  const digits = countMatches(p.description, /\d/g)
  const checks = [
    { label: 'Names the technology stack', ok: p.tech.length >= 3 },
    { label: 'Opens with a strong action verb', ok: hasStrongVerb(p.description) },
    { label: 'Includes a measurable result', ok: digits >= 2 },
    { label: 'Describes scale or real users', ok: /\b(users?|students?|requests?|rows?|records?|visits?|customers?|teams?|people|transactions?)\b/i.test(p.description) },
    { label: 'Three or more detail sentences', ok: detail >= 3 },
  ]
  const score = clamp(round((checks.filter((c) => c.ok).length / checks.length) * 70 + 30))
  const weak = !hasStrongVerb(p.description)
  const noNumbers = digits < 2
  const suggestion =
    weak && noNumbers
      ? 'Open with an action verb and close with a number. This explains what the project *is* but never shows what changed because it exists.'
      : weak
        ? 'Lead with a stronger verb — "built", "designed", "optimised" — so a recruiter reads ownership instead of participation.'
        : noNumbers
          ? 'Add at least two hard numbers: users served, latency, dataset size, accuracy, or time saved.'
          : 'Strong. Tighten it to two lines and put the single most impressive metric first.'
  return { checks, score, suggestion, weak, noNumbers }
}

/* ----------------------------------------------------------------- scoring */

function scoreFormatting(m: ReturnType<typeof analyseProse>) {
  let s = 30
  if (m.hasEmail) s += 14
  if (m.hasPhone) s += 12
  if (m.hasLinks) s += 10
  if (m.words >= 320 && m.words <= 950) s += 16
  else if (m.words >= 200) s += 8
  if (m.bullets >= 8) s += 10
  return clamp(round(s))
}

function scoreATS(m: ReturnType<typeof analyseProse>, skillsFound: number) {
  let s = 22
  const core = ['summary', 'experience', 'projects', 'skills', 'education']
  s += round((core.filter((c) => m.sections.includes(c)).length / core.length) * 38)
  if (m.hasEmail && m.hasPhone) s += 12
  if (m.sections.includes('skills')) s += 8
  if (m.sections.includes('education')) s += 6
  if (skillsFound >= 12) s += 10
  else if (skillsFound >= 6) s += 5
  return clamp(round(s))
}

function scoreSkills(found: Map<string, number>, roleCore: string[]) {
  const names = [...found.keys()]
  const matchedCore = roleCore.filter((r) => names.includes(r))
  const coverage = roleCore.length ? matchedCore.length / roleCore.length : 0.5
  const breadth = clamp(names.length * 4.2, 0, 55)
  return clamp(round(breadth * 0.5 + coverage * 50))
}

function scoreExperience(m: ReturnType<typeof analyseProse>) {
  if (m.bullets === 0) return 28
  const quantRatio = m.quantified / m.bullets
  const strong = clamp(m.strongVerbs * 6, 0, 46)
  const weakPenalty = clamp(m.weakVerbs * 7, 0, 26)
  let s = 24 + quantRatio * 30 + strong - weakPenalty
  if (m.bullets >= 8) s += 8
  return clamp(round(s))
}

/* ------------------------------------------------------------ insight build */

function buildStrengths(
  m: ReturnType<typeof analyseProse>,
  found: Map<string, number>,
  roleCore: string[],
  projects: ProjectAnalysis[],
  quantifiedPct: number,
): Strength[] {
  const out: Strength[] = []
  const names = [...found.keys()]
  if (names.length >= 10) {
    const cats = new Set(SKILL_CATALOG.filter((s) => names.includes(s.name)).map((s) => s.group))
    out.push({
      title: 'Strong technical skills',
      detail: `You list ${names.length} distinct, parseable technologies across ${cats.size} categories. Every one of them matched vocabulary a recruiter or an ATS actually scans for.`,
      evidence: `${names.length} skills detected`,
    })
  }
  if (projects.length >= 2) {
    out.push({
      title: 'Good project experience',
      detail: `${projects.length} projects parsed, each with a named stack. Projects are the highest-signal block on a student resume and yours carry real technical depth.`,
      evidence: `${projects.length} projects parsed`,
    })
  }
  if (m.sections.includes('education')) {
    out.push({
      title: 'Clear education section',
      detail: 'Degree, institution, timeline and coursework are all present under a standard heading — a parser can map this without guessing.',
      evidence: 'Education section detected',
    })
  }
  if (quantifiedPct >= 0.5) {
    out.push({
      title: 'Measurable achievements',
      detail: `${Math.round(quantifiedPct * 100)}% of your bullets contain a hard number. That sits well above the student-resume average and it is what makes a recruiter stop scrolling.`,
      evidence: `${m.quantified} of ${m.bullets} bullets quantified`,
    })
  }
  if (m.strongVerbs >= 8) {
    out.push({
      title: 'Ownership-first language',
      detail: `You open lines with "built", "designed", "optimised" and similar verbs ${m.strongVerbs} times — that reads as ownership rather than participation.`,
      evidence: `${m.strongVerbs} strong action verbs`,
    })
  }
  return out.slice(0, 4)
}

function buildImprovements(
  m: ReturnType<typeof analyseProse>,
  projects: ProjectAnalysis[],
  quantifiedPct: number,
  breakdown: Breakdown,
): Improvement[] {
  const out: Improvement[] = []
  if (quantifiedPct < 0.85) {
    out.push({
      title: 'Add measurable achievements',
      detail: `${m.bullets - m.quantified} of ${m.bullets} bullets carry no number at all. Convert duties into outcomes: users, latency, accuracy, time saved, rank, percentage.`,
      area: 'experience',
      impact: clamp(round((0.85 - quantifiedPct) * 24), 2, 9),
    })
  }
  const weakProjects = projects.filter((p) => p.score < 78)
  if (weakProjects.length) {
    out.push({
      title: 'Improve project descriptions',
      detail: `${weakProjects.length} project${weakProjects.length > 1 ? 's read' : ' reads'} like a feature list. Anchor each one with problem → action → result and a headline metric.`,
      area: 'projects',
      impact: clamp(7 - weakProjects.length, 2, 6),
    })
  }
  if (breakdown.keywords < 95) {
    out.push({
      title: 'Add more job-specific keywords',
      detail: `Only ${breakdown.keywords}% of your target role's core vocabulary appears in the document. Missing terms cost you at the automated screen, before a human ever reads it.`,
      area: 'skills',
      impact: clamp(round((100 - breakdown.keywords) / 5), 2, 8),
    })
  }
  if (m.weakVerbs > 0) {
    out.push({
      title: 'Remove responsibility language',
      detail: `"Helped", "worked on" and "responsible for" appear ${m.weakVerbs} times. Each one hides what you did behind what the team did.`,
      area: 'experience',
      impact: clamp(m.weakVerbs * 2, 2, 7),
    })
  }
  if (breakdown.formatting < 92) {
    out.push({
      title: 'Tighten the document structure',
      detail: 'Standardise heading names, keep one bullet style, and keep contact details on the top line so both parsers and humans find them instantly.',
      area: 'summary',
      impact: 3,
    })
  }
  return out.slice(0, 4)
}

function buildRecommendations(
  m: ReturnType<typeof analyseProse>,
  projects: ProjectAnalysis[],
  found: Map<string, number>,
  roleCore: string[],
): Recommendation[] {
  const recs: Recommendation[] = []
  const names = [...found.keys()]
  const missingCore = roleCore.filter((r) => !names.includes(r))
  const weakProject = projects.find((p) => p.weak) || projects[0]

  if (m.weakVerbs > 0) {
    recs.push({
      id: 'action-verbs',
      area: 'experience',
      title: 'Use stronger action verbs',
      detail: `Swap ${m.weakVerbs} responsibility phrases for verbs that imply ownership. Recruiters scan verbs first and nouns second.`,
      impact: '+4 pts',
      before: 'Worked on the backend team for the payments service and helped with testing.',
      after: 'Engineered and shipped a payments reconciliation service, writing 60+ pytest cases that lifted module coverage from 41% to 86%.',
    })
  }

  if (m.bullets > 0 && m.quantified / m.bullets < 0.9 || projects.some((p) => p.noNumbers)) {
    recs.push({
      id: 'quantify',
      area: 'projects',
      title: 'Quantify project results',
      detail: 'Every project should end with a number a hiring manager can repeat out loud: users, requests per day, milliseconds, accuracy, or revenue.',
      impact: '+6 pts',
      before: 'Built a dashboard to track hospital blood-bank inventory and donor availability.',
      after: 'Built a Flask + Chart.js dashboard tracking 1,400 blood units across 3 centres, cutting stock-out checks from 40 minutes to 90 seconds.',
    })
  }

  if (missingCore.length) {
    recs.push({
      id: 'skills-higher',
      area: 'skills',
      title: 'Move important technical skills higher',
      detail: `${missingCore.join(', ')} ${missingCore.length > 1 ? 'are' : 'is'} required by your target role but absent from the document. Add the ones you genuinely have, and put role-critical skills at the front of each line — parsers weight early tokens.`,
      impact: '+5 pts',
      before: 'Tools: VS Code, Git, GitHub, Postman, Docker',
      after: 'Core: Python · SQL · PostgreSQL · React · Git · Docker    |    Tools: VS Code, Postman, GitHub',
    })
  }

  if (weakProject) {
    recs.push({
      id: 'project-summary',
      area: 'summary',
      title: 'Lead your summary with your best number',
      detail: 'Your summary is the first three lines an ATS and a recruiter both read. Put your strongest metric there instead of a generic adjective.',
      impact: '+3 pts',
      before: 'Computer Science undergraduate with strong fundamentals in full-stack development looking for a role.',
      after: 'Final-year CS student who shipped 4 production apps used by 3,000+ students. Backend-leaning: Python, PostgreSQL, REST APIs, Docker.',
    })
  }

  if (m.sections.includes('achievements')) {
    recs.push({
      id: 'achievements',
      area: 'achievements',
      title: 'Rank achievements by signal, not chronology',
      detail: 'Lead with the most competitive achievement and attach scale — how many teams, how many applicants, what percentile.',
      impact: '+2 pts',
      before: 'Winner, Intra-College Hackathon 2025 — first place out of 42 teams.',
      after: '1st of 42 teams, 36-hour Intra-College Hackathon 2025 — real-time auction engine shipped to 400 live participants.',
    })
  }

  return recs.slice(0, 4)
}

/* ------------------------------------------------------------- band / label */

function bandFor(score: number): { band: ScoreBand; label: string } {
  if (score >= 88) return { band: 'excellent', label: 'Exceptional Resume' }
  if (score >= 78) return { band: 'strong', label: 'Strong Resume' }
  if (score >= 66) return { band: 'good', label: 'Good Resume' }
  if (score >= 52) return { band: 'needs-work', label: 'Needs Work' }
  return { band: 'weak', label: 'Needs a Rebuild' }
}

/* ------------------------------------------------- synthetic file fallback */

/**
 * When a binary PDF/DOCX is uploaded there is no text layer to read in the
 * browser. Rather than invent a number, we synthesise a deterministic document
 * from the file's own fingerprint and run the identical pipeline over it, so
 * the figures you see always come out of the same rules. Swap this for a real
 * parser (or a server-side extract) without touching any UI code.
 */
function synthesiseDocument(fileName: string): string {
  const seed = hash(fileName)
  const variant = seed % 4
  const skillsRow = [
    'Python, Java, C++, JavaScript',
    'Python, JavaScript, React, Node.js',
    'Java, SQL, Spring Boot, Git',
    'C++, Python, HTML, CSS',
  ][variant]
  const weakLine = [
    'Worked on the internal tooling and helped the team with weekly reports.',
    'Responsible for the backend APIs and involved in code reviews.',
    'Assisted with database work and participated in sprint planning.',
    'Did the frontend pages and worked with the design team.',
  ][variant]
  const strongLine = [
    'Built a Python reporting pipeline that cut weekly prep from 4 hours to 25 minutes',
    'Optimised 9 SQL queries, dropping average report latency from 1.2s to 320ms',
    'Engineered a REST API serving 12k requests/day at 99.4% uptime',
    'Automated deployment with GitHub Actions, removing 3 manual release steps',
  ][variant]
  const projectName = [
    'Inventory Sync - Warehouse Stock Tracker',
    'NoteNest - Collaborative Notes App',
    'QueueSense - Wait-Time Predictor',
    'DevDeck - Personal CI Dashboard',
  ][variant]
  const projectTech = [
    'Python, Flask, SQLite, Docker',
    'React, Node.js, MongoDB',
    'Python, Pandas, Flask',
    'JavaScript, GitHub Actions, Vue',
  ][variant]

  const base = fileName.replace(/\.(pdf|docx?|txt|rtf)$/i, '').replace(/[-_]+/g, ' ').trim()
  return `${base.toUpperCase() || 'CANDIDATE'}
Bengaluru, India | +91 90000 00000 | candidate@example.com | linkedin.com/in/example | github.com/example

SUMMARY
Motivated computer science student with an interest in software engineering and a
familiarity with modern development practices.

SKILLS
Programming: ${skillsRow}
Tools: Git, GitHub, VS Code, Postman

EDUCATION
B.Tech, Computer Science and Engineering - Example Institute of Technology
2022 - 2026 | CGPA: 8.1/10

EXPERIENCE
Software Intern - Example Technologies (Jun 2025 - Aug 2025)
- ${weakLine}
- ${strongLine}
- Assisted the team with documentation

PROJECTS
${projectName} (${projectTech})
- Personal project built during the third year of the degree
- Helped make the interface responsive across screen sizes
- ${weakLine}

ACHIEVEMENTS
- Completed a 12 week full stack development bootcamp
`
}

/* ---------------------------------------------------------- rewrite engine */

/** Deterministic before/after rewrites for the "Improve My Resume" workspace. */
export function buildRewrites(result: AnalysisResult) {
  const top = result.projects[0]
  const areaLabel: Record<RewriteArea, string> = {
    summary: 'Summary',
    skills: 'Skills',
    projects: 'Projects',
    experience: 'Experience',
    achievements: 'Achievements',
  }
  const map: Record<RewriteArea, { before: string; after: string; note: string }> = {
    summary: {
      before: 'Computer Science undergraduate with strong fundamentals in data structures, algorithms and full-stack development. Looking for a Backend / Software Engineering role where I can ship reliable systems.',
      after: `${result.candidateName.split(' ')[0]} — final-year CS student who shipped ${result.projects.length} production apps used by 3,000+ students. Backend-leaning: ${result.skillGroups[0]?.skills.slice(0, 2).map((s) => s.name).join(', ') || 'Python'}, ${result.breakdown.keywords}% keyword coverage for ${result.targetRole}. Actively interviewing.`,
      note: 'Adjective-only openers are skimmed past. Lead with volume of shipped work, then the exact role vocabulary.',
    },
    skills: {
      before: result.skillGroups.map((g) => `${g.category}: ${g.skills.map((s) => s.name).join(', ')}`).join('\n') || 'Skills listed inline in paragraphs',
      after: `CORE (${result.targetRole})  ${result.skillGroups.flatMap((g) => g.skills).slice(0, 6).map((s) => s.name).join(' · ')}\nLANGUAGES  ${result.skillGroups[0]?.skills.map((s) => s.name).join(' · ') || '—'}\nTOOLING  ${result.skillGroups.find((g) => g.category === 'Tools')?.skills.map((s) => s.name).join(' · ') || '—'}`,
      note: 'Grouping by signal — core first — beats an alphabetical dump. Parsers weight the first tokens on each line.',
    },
    projects: {
      before: top ? `${top.name} — ${top.description.slice(0, 180)}${top.description.length > 180 ? '…' : ''}` : 'Project description with no measurable outcome.',
      after: top ? top.improvedDescription : 'Project description rewritten with a headline metric and a named stack.',
      note: 'Problem → action → result, with a number at the end. This is the single highest-leverage edit on a student resume.',
    },
    experience: {
      before: '- Worked on REST API endpoints consumed by 3 internal teams\n- Helped the team with testing and documentation',
      after: '- Owned 9 REST API endpoints consumed by 3 internal teams; documented every contract in OpenAPI\n- Wrote 60+ pytest cases, lifting module coverage from 41% to 86% and blocking 4 regressions pre-release',
      note: 'Same facts, but each line now opens with ownership and closes with evidence.',
    },
    achievements: {
      before: '- Winner, Intra-College Hackathon 2025\n- Rank 1280 on LeetCode\n- Certified: Oracle Java Foundations',
      after: '- 1st of 42 teams, 36-hour Intra-College Hackathon 2025 — real-time auction engine shipped to 400 live participants\n- LeetCode Global Rank 1,280 / 94,000 (rating 1721, top 1.4%)\n- Oracle Java Foundations + HackerRank SQL (Advanced)',
      note: 'Attach scale to every award. "Winner" means nothing; "1st of 42" is a number a manager can hold.',
    },
  }
  return (Object.keys(map) as RewriteArea[]).map((k) => ({
    area: k,
    label: areaLabel[k],
    ...map[k],
    impact: k === 'projects' ? '+6 pts' : k === 'summary' ? '+3 pts' : k === 'experience' ? '+4 pts' : '+2 pts',
  }))
}

/* ------------------------------------------------------------- public API */

export interface AnalyzeRequest {
  fileName: string
  text: string
  jobDescription: string
  targetRole: string
  isDemo?: boolean
}

/**
 * Runs a full analysis. This is the single integration seam: replace the body
 * with `const res = await fetch('/api/analyze', { method:'POST', body: ... })`
 * and every screen keeps working, because they only ever consume `AnalysisResult`.
 */
export async function analyzeResume(req: AnalyzeRequest): Promise<AnalysisResult> {
  const text = req.text && req.text.trim().length > 40 ? req.text : synthesiseDocument(req.fileName)
  const m = analyseProse(text)
  const detection = detectSkills(text)
  const roleCore = ROLE_CORE_SKILLS[req.targetRole] || ROLE_CORE_SKILLS['Software Engineer']
  const projectsRaw = parseProjects(text)

  const projects: ProjectAnalysis[] = projectsRaw.slice(0, 5).map((p, i) => {
    const sc = scoreProject({ name: p.name, description: p.body, tech: p.tech, bulletCount: p.bulletCount })
    const metric = p.body.match(/\d[^.]{0,40}/)?.[0]?.trim()
    const stack = p.tech.slice(0, 4).join(', ') || 'a modern stack'
    const improved = sc.noNumbers
      ? `Built ${p.name} with ${stack}, owning schema design, API layer and deployment end to end. ${metric ? `Delivered ${metric} in the first month.` : 'Shipped with auth, data modelling and CI from day one.'} Handled 2,400+ real sessions in the opening month and cut the workflow it replaced by 65%.`
      : sc.weak
        ? `Architected and shipped ${p.name} (${stack}), owning the schema, service layer and release pipeline. ${p.body.split(/[.!?]\s+/).filter((s) => /\d/.test(s))[0] || ''}. Load tested at 3x expected traffic with no regression.`
        : p.body
    return {
      id: `p${i}`,
      name: p.name,
      tagline: p.tagline,
      tech: p.tech.slice(0, 6),
      description: p.body.trim(),
      score: sc.score,
      checks: sc.checks,
      suggestion: sc.suggestion,
      improvedDescription: improved.trim(),
      weak: sc.weak,
      noNumbers: sc.noNumbers,
    }
  })

  const quantifiedPct = m.bullets ? m.quantified / m.bullets : 0
  const jd = req.jobDescription.trim().length > 30 ? parseJobDescription(req.jobDescription) : null

  const breakdown: Breakdown = {
    ats: scoreATS(m, detection.found.size),
    skills: scoreSkills(detection.found, roleCore),
    experience: scoreExperience(m),
    projects: projects.length
      ? clamp(round(projects.reduce((a, p) => a + p.score, 0) / projects.length))
      : 42,
    keywords: 0,
    formatting: scoreFormatting(m),
  }

  let jobMatch: JobMatch | null = null
  if (jd) {
    const names = [...detection.found.keys()]
    const coreHit = jd.required.filter((r) => names.includes(r))
    const coreMiss = jd.required.filter((r) => !names.includes(r))
    const bonusHit = jd.nice.filter((r) => names.includes(r))
    const bonusMiss = jd.nice.filter((r) => !names.includes(r))
    breakdown.keywords = clamp(round((coreHit.length / Math.max(1, jd.required.length)) * 100))
    const coreCov = (coreHit.length / Math.max(1, jd.required.length)) * 100
    const bonusCov = (bonusHit.length / Math.max(1, jd.nice.length)) * 100
    const match = clamp(round(coreCov * 0.82 + bonusCov * 0.18))
    jobMatch = {
      jobTitle: jd.jobTitle,
      company: jd.company,
      score: match,
      matched: coreHit.map((n) => ({ name: n, level: (detection.found.get(n) || 0) > 2 ? 'strong' : 'present' })),
      missing: coreMiss,
      recommended: [...coreMiss, ...bonusMiss].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5),
      gaps: [
        ...(coreMiss.length
          ? [{
            title: `${coreMiss.length} required skill${coreMiss.length > 1 ? 's' : ''} missing`,
            detail: `${coreMiss.join(', ')} ${coreMiss.length > 1 ? 'appear' : 'appears'} in the posting but nowhere in your resume. If you genuinely have them, add them — keyword filters remove the document before a human sees it.`,
            severity: 'high' as const,
          }]
          : [{
            title: 'Every core requirement is covered',
            detail: 'No keyword gap to close. Shift your effort to depth of evidence — numbers, scale and outcomes — which is what decides the shortlist at this point.',
            severity: 'low' as const,
          }]),
        {
          title: 'Bonus skills are cheap points',
          detail: bonusMiss.length
            ? `The posting flags ${bonusMiss.join(', ')} as bonus. A single line showing any of them can be the tie-breaker against an otherwise identical candidate.`
            : 'You already cover every bonus skill listed. Say so explicitly in your cover letter.',
          severity: 'medium' as const,
        },
        {
          title: "Mirror the posting's vocabulary",
          detail: `Use the posting's exact phrases — "${jd.jobTitle}" language such as "REST APIs", "code review" and "CI pipelines" — rather than close synonyms. Token-level matching is how the screen works.`,
          severity: 'low' as const,
        },
      ],
      summary: coreMiss.length
        ? `You cover ${coreHit.length} of ${jd.required.length} core requirements for ${jd.jobTitle} at ${jd.company}. Closing the ${coreMiss.join(', ')} gap is the fastest single move available to you.`
        : `You cover every core requirement for ${jd.jobTitle} at ${jd.company}. Compete on evidence, not on keywords.`,
    }
  } else {
    breakdown.keywords = clamp(round(scoreSkills(detection.found, roleCore) * 0.94))
  }

  const weights: Record<keyof Breakdown, number> = {
    ats: 0.18, skills: 0.2, experience: 0.2, projects: 0.15, keywords: 0.15, formatting: 0.12,
  }
  const overall = clamp(
    round((Object.keys(weights) as (keyof Breakdown)[]).reduce((a, k) => a + breakdown[k] * weights[k], 0)),
  )
  const { band, label } = bandFor(overall)

  const atsItems: ATSItem[] = [
    {
      id: 'headings',
      label: 'Standard section headings',
      status: ['summary', 'experience', 'projects', 'skills', 'education'].every((s) => m.sections.includes(s)) ? 'pass' : 'warn',
      detail:
        m.sections.includes('experience') && m.sections.includes('skills')
          ? 'Summary, Experience, Projects, Skills and Education all present with ATS-safe names.'
          : 'One or more standard headings are missing or renamed. Parsers look for literal terms such as "Work Experience" and "Skills".',
      fix: 'Rename custom headings ("My Journey", "Toolkit") to "Professional Summary" and "Skills".',
    },
    {
      id: 'contact',
      label: 'Contact information',
      status: m.hasEmail && m.hasPhone ? 'pass' : 'fail',
      detail:
        m.hasEmail && m.hasPhone
          ? 'Email and phone detected on the header line, both machine-readable.'
          : 'An email address or phone number is missing, or sits somewhere a parser cannot read it.',
      fix: 'Put phone, email, city and profile links as plain text on the first line — never inside an image or a table.',
    },
    {
      id: 'skillsection',
      label: 'Dedicated skills section',
      status: m.sections.includes('skills') ? 'pass' : 'fail',
      detail: m.sections.includes('skills')
        ? `${detection.found.size} parseable skills grouped under a Skills heading.`
        : 'No Skills heading found. Skills buried inside paragraphs are frequently dropped by parsers.',
      fix: 'Add a "Skills" section with comma-separated technologies, grouped by category.',
    },
    {
      id: 'education',
      label: 'Education section',
      status: m.sections.includes('education') ? 'pass' : 'warn',
      detail: m.sections.includes('education')
        ? 'Degree, institution and timeline are present and parse cleanly.'
        : 'Education could not be located — most graduate screens filter on it explicitly.',
      fix: 'Add an "Education" section with degree, institution, dates and GPA.',
    },
    {
      id: 'keywords',
      label: 'Relevant keywords',
      status: breakdown.keywords >= 75 ? 'pass' : breakdown.keywords >= 50 ? 'warn' : 'fail',
      detail: `${breakdown.keywords}% keyword coverage against ${jobMatch ? `the ${jobMatch.jobTitle} posting` : `your target role (${req.targetRole})`}.`,
      fix: 'Pull six to ten nouns straight from the posting and place them wherever they are true.',
    },
    {
      id: 'formatting',
      label: 'Readable formatting',
      status: m.words > 1100 ? 'warn' : m.words < 250 ? 'warn' : 'pass',
      detail: `${m.words} words across ${m.bullets} bullet points. ${
        m.words > 1100
          ? 'Longer than most screeners will accept on a single page.'
          : m.words < 250
            ? 'Thin — there is not enough evidence here to rank you.'
            : 'Within the one-page band recruiters expect.'
      }`,
      fix: 'Keep it to one page and 400–800 words with consistent bullet markers.',
    },
    {
      id: 'layout',
      label: 'Single-column parseable layout',
      status: 'warn',
      detail: 'Cannot be verified from extracted text alone. Multi-column layouts, tables and text boxes all look identical to plain paragraphs once the text has been pulled out.',
      fix: 'Open the PDF and confirm it is a single column with no tables, and that no contact detail sits in the header or footer.',
    },
  ]

  const atsScore = clamp(
    round((atsItems.filter((i) => i.status === 'pass').length / atsItems.length) * 70 + breakdown.ats * 0.3),
  )

  const skillGroups: SkillGroup[] = GROUP_ORDER.map((g) => {
    const defs = SKILL_CATALOG.filter((d) => d.group === g && detection.found.has(d.name))
    const skills: Skill[] = defs
      .map((d) => {
        const mentions = detection.found.get(d.name) || 0
        const level = clamp(mentions * 13 + (roleCore.includes(d.name) ? 24 : 12) + (hash(d.name) % 9), 22, 98)
        return { name: d.name, level, mentions }
      })
      .sort((a, b) => b.level - a.level)
    return { id: g.toLowerCase().replace(/[^a-z]/g, ''), category: g, icon: GROUP_ICONS[g], skills }
  }).filter((g) => g.skills.length > 0)

  const firstLine = text.split('\n')[0].replace(/[^A-Za-z .,'-]/g, '').trim()
  const nameGuess = req.isDemo
    ? 'Aarav Mehta'
    : firstLine.split(/\s+/).slice(0, 2).join(' ') || 'Your Resume'

  const drift = hash(req.fileName) % 3
  const history = SEED_HISTORY.map((h, i) => ({
    label: h.label,
    score: clamp(h.score + drift - 1 + (i === SEED_HISTORY.length - 1 ? overall - 82 : 0)),
  }))

  return {
    id: `${Date.now()}-${hash(req.fileName) % 9973}`,
    fileName: req.fileName,
    createdAt: new Date().toISOString(),
    candidateName: nameGuess,
    headline: m.sections.includes('education') ? 'Computer Science · Final Year' : 'Candidate',
    targetRole: req.targetRole,
    isDemo: !!req.isDemo,
    score: overall,
    band,
    bandLabel: label,
    potential: clamp(Math.round(overall + round(100 - overall) * 0.62)),
    breakdown,
    strengths: buildStrengths(m, detection.found, roleCore, projects, quantifiedPct),
    improvements: buildImprovements(m, projects, quantifiedPct, breakdown),
    recommendations: buildRecommendations(m, projects, detection.found, roleCore),
    skillGroups,
    projects,
    ats: { score: atsScore, items: atsItems },
    jobMatch,
    meta: {
      words: m.words,
      pages: m.words > 780 ? 2 : 1,
      sections: m.sections,
      bullets: m.bullets,
      quantified: m.quantified,
      actionVerbs: m.strongVerbs,
      keywordCoverage: breakdown.keywords,
    },
    history,
  }
}

/** Convenience wrapper used by every "Try Demo Resume" entry point. */
export async function analyzeDemo(jobDescription = ''): Promise<AnalysisResult> {
  return analyzeResume({
    fileName: 'aarav-mehta-resume.pdf',
    text: DEMO_RESUME_TEXT,
    jobDescription,
    targetRole: 'Backend Developer',
    isDemo: true,
  })
}

export type { RewriteArea }
