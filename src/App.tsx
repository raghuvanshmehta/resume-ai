import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Landing from './components/Landing'
import DashboardShell from './components/DashboardShell'
import Toaster from './components/Toaster'
import DashboardPage from './pages/DashboardPage'
import AnalyzePage from './pages/AnalyzePage'
import ScorePage from './pages/ScorePage'
import SkillsPage from './pages/SkillsPage'
import ATSPage from './pages/ATSPage'
import JobMatchPage from './pages/JobMatchPage'
import SuggestionsPage from './pages/SuggestionsPage'
import ResumesPage from './pages/ResumesPage'
import SettingsPage from './pages/SettingsPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<DashboardShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="analyze" element={<AnalyzePage />} />
          <Route path="score" element={<ScorePage />} />
          <Route path="skills" element={<SkillsPage />} />
          <Route path="ats" element={<ATSPage />} />
          <Route path="job-match" element={<JobMatchPage />} />
          <Route path="suggestions" element={<SuggestionsPage />} />
          <Route path="resumes" element={<ResumesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </>
  )
}
