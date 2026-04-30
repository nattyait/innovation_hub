import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './LoginPage'
import { BottomNav } from './BottomNav'
import { IdeaListPage } from './InnovationIdeas/IdeaListPage'
import { IdeaDetailPage } from './InnovationIdeas/IdeaDetailPage'
import { IdeaFormPage } from './InnovationIdeas/IdeaFormPage'
import { CommunityPage } from './Community/CommunityPage'
import { LeaderboardPage } from './Leaderboard/LeaderboardPage'
import { AdminIdeasPage } from './Admin/AdminIdeasPage'
import { ProjectListPage } from './InnovationProjects/ProjectListPage'
import { ProjectDetailPage } from './InnovationProjects/ProjectDetailPage'
import { useAuth } from './shared/hooks/useAuth'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/innovation/login" replace />
  return <>{children}</>
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto pb-20">
      {children}
      <BottomNav />
    </div>
  )
}

export function InnovationHubModule() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route
        path="*"
        element={
          <AuthGuard>
            <Layout>
              <Routes>
                <Route index element={<Navigate to="ideas" replace />} />
                <Route path="ideas"          element={<IdeaListPage />} />
                <Route path="ideas/new"      element={<IdeaFormPage />} />
                <Route path="ideas/:id"      element={<IdeaDetailPage />} />
                <Route path="ideas/:id/edit" element={<IdeaFormPage />} />
                <Route path="community"         element={<CommunityPage />} />
                <Route path="leaderboard"      element={<LeaderboardPage />} />
                <Route path="projects"         element={<ProjectListPage />} />
                <Route path="projects/:id"     element={<ProjectDetailPage />} />
                <Route path="admin"            element={<AdminIdeasPage />} />
              </Routes>
            </Layout>
          </AuthGuard>
        }
      />
    </Routes>
  )
}
