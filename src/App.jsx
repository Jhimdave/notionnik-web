import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import BookingPage     from './pages/BookingPage'
import './App.css'

export default function App() {
  const [openChat, setOpenChat] = useState(false)

  return (
    <Router>
      <ThemeProvider>
        <PageBackground />
        <CustomCursor />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/"                      element={<Dashboard    />} />
              <Route path="/services"              element={<Services     />} />
              <Route path="/case-studies"          element={<CaseStudies  />} />
              <Route path="/case-studies/:id"      element={<CaseStudyDetail />} />
              <Route path="/testimonials"          element={<Testimonials />} />
              <Route path="/about"                 element={<AboutUs      />} />
              <Route path="/book"                  element={<Book         />} />
              <Route path="/contact"               element={<Contact      />} />
            </Routes>
          </div>
          <Footer />
          <PeepingRobot onOpenChat={() => setOpenChat(true)} />
          <Chatbot forceOpen={openChat} onOpened={() => setOpenChat(false)} />
        </div>
      </ThemeProvider>
    </Router>
  )
}
