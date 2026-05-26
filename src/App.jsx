import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { ThemeProvider } from './pages/ThemeContext'
import Navbar          from './components/Navbar'
import Footer          from './components/Footer'
import Chatbot         from './components/Chatbot'
import CustomCursor    from './components/customcursor'
import PeepingRobot    from './components/PeepingRobot'
import PageBackground  from './pages/PageBackground'
import Dashboard       from './pages/Dashboard'
import Services        from './pages/Services'
import CaseStudies     from './pages/CaseStudies'
import CaseStudyDetail from './pages/CaseStudyDetail'
import Testimonials    from './pages/Testimonials'
import AboutUs         from './pages/AboutUs'
import Book            from './pages/Book'
import Contact         from './pages/Contact'
import './App.css'
import ChatBox from './components/AiAgent'
import Admin from './admin/admin-side'
import AdminDashboard from './admin/admin_dashboard'

const ADMIN_ROUTES = ['/admin/login']

function AppLayout() {
  const [openChat, setOpenChat] = useState(false)
  const { pathname } = useLocation()

  // Covers ALL /admin/* routes automatically:
  const isAdminRoute = pathname.startsWith('/admin')

  return (
    <ThemeProvider>
      <PageBackground />
      <CustomCursor />
      <div className="min-h-screen flex flex-col">
        {!isAdminRoute && <Navbar />}
        <div className="flex-1">
          <Routes>
            <Route path="/"                 element={<Dashboard    />} />
            <Route path="/services"         element={<Services     />} />
            <Route path="/case-studies"     element={<CaseStudies  />} />
            <Route path="/case-studies/:id" element={<CaseStudyDetail />} />
            <Route path="/testimonials"     element={<Testimonials />} />
            <Route path="/about"            element={<AboutUs      />} />
            <Route path="/book"             element={<Book         />} />
            <Route path="/contact"          element={<Contact      />} />
            <Route path="/admin/login"      element={<Admin        />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
        {!isAdminRoute && <Footer />}
        {!isAdminRoute && <PeepingRobot onOpenChat={() => setOpenChat(true)} />}
        {!isAdminRoute && <Chatbot forceOpen={openChat} onOpened={() => setOpenChat(false)} />}
        {!isAdminRoute && <ChatBox forceOpen={openChat} onOpened={() => setOpenChat(false)} />}
      </div>
    </ThemeProvider>
  )
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  )
}