export type ScoreBand = 'excellent' | 'strong' | 'good' | 'needs-work' | 'weak'

export interface Skill {
  name: string
  level: number // 0-100 confidence of proficiency signal in the resume
  mentions: number
}

export interface SkillGroup {
  id: string
  category: string
  icon: string
  skills: Skill[]
}

export type CheckStatus = 'pass' | 'warn' | 'fail'

export interface ATSItem {
  id: string
  label: string
  status: CheckStatus
  detail: string
  fix?: string
}

export interface Strength {
  title: string
  detail: string
  evidence: string
}

export interface Improvement {
  title: string
  detail: string
  area: RewriteArea
  impact: number
}

export type RewriteArea = 'summary' | 'skills' | 'projects' | 'experience' | 'achievements'

export interface Recommendation {
  id: string
  area: RewriteArea
  title: string
  detail: string
  impact: string
  before: string
  after: string
}

export interface ProjectAnalysis {
  id: string
  name: string
  tagline: string
  tech: string[]
  description: string
  score: number
  checks: { label: string; ok: boolean }[]
  suggestion: string
  improvedDescription: string
  weak: boolean
  noNumbers: boolean
}

export interface Breakdown {
  ats: number
  skills: number
  experience: number
  projects: number
  keywords: number
  formatting: number
}

export interface JobMatch {
  jobTitle: string
  company: string
  score: number
  matched: { name: string; level: string }[]
  missing: string[]
  recommended: string[]
  gaps: { title: string; detail: string; severity: 'high' | 'medium' | 'low' }[]
  summary: string
}

export interface ScorePoint {
  label: string
  score: number
  date?: string
}

export interface AnalysisResult {
  id: string
  fileName: string
  createdAt: string
  candidateName: string
  headline: string
  targetRole: string
  isDemo: boolean
  score: number
  band: ScoreBand
  bandLabel: string
  potential: number
  breakdown: Breakdown
  strengths: Strength[]
  improvements: Improvement[]
  recommendations: Recommendation[]
  skillGroups: SkillGroup[]
  projects: ProjectAnalysis[]
  ats: { score: number; items: ATSItem[] }
  jobMatch: JobMatch | null
  meta: {
    words: number
    pages: number
    sections: string[]
    bullets: number
    quantified: number
    actionVerbs: number
    keywordCoverage: number
  }
  history: ScorePoint[]
}

export interface LibraryEntry {
  id: string
  fileName: string
  candidateName: string
  targetRole: string
  score: number
  band: ScoreBand
  createdAt: string
  delta: number
  current: boolean
}

export interface AnalyzeRequest {
  fileName: string
  text: string
  jobDescription: string
  targetRole: string
  isDemo?: boolean
}
