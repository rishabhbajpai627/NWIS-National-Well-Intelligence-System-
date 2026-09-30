import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Dashboard } from './pages/Dashboard'
import { Analytics } from './pages/Analytics'
import { KnowledgeBase } from './pages/KnowledgeBase'

import { ActiveOperationProvider } from './context/ActiveOperationContext'

function App() {
  return (
    <ActiveOperationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="knowledge" element={<KnowledgeBase />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ActiveOperationProvider>
  )
}

export default App
