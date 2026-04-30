import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './LoginPage'
import { BottomNav } from './BottomNav'
import { IdeaListPage } from './InnovationIdeas/IdeaListPage'
import { IdeaDetailPage } from './InnovationIdeas/IdeaDetailPage'
import { IdeaFormPage } from './InnovationIdeas/IdeaFormPage'
import { ClassroomPage } from './InnovationClassroom/ClassroomPage'
import { ProjectListPage } from './IncubatorProjects/ProjectListPage'
import { ProjectDetailPage } from './IncubatorProjects/ProjectDetailPage'
import { AdminIdeasPage } from './Admin/AdminIdeasPage'
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
                <Route path="ideas"         element={<IdeaListPage />} />
                <Route path="ideas/new"      element={<IdeaFormPage />} />
                <Route path="ideas/:id"     element={<IdeaDetailPage />} />
                <Route path="ideas/:id/edit" element={<IdeaFormPage />} />
                <Route path="classroom"     element={<ClassroomPage />} />
                <Route path="projects"      element={<ProjectListPage />} />
                <Route path="projects/:id"  element={<ProjectDetailPage />} />
                <Route path="admin"         element={<AdminIdeasPage />} />
              </Routes>
            </Layout>
          </AuthGuard>
        }
      />
    </Routes>
  )
}
