import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import { InnovationHubModule } from './modules/innovation_hub'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/innovation/login" replace />} />
        <Route path="/innovation/*" element={<InnovationHubModule />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
