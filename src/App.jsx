import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './pages/ThemeContext'
import Navbar       from './components/Navbar'
import Footer       from './components/Footer'
import Chatbot      from './components/Chatbot'
import CustomCursor from './components/customcursor'
import PageBackground from './pages/PageBackground'
import Dashboard    from './pages/Dashboard'
import Services     from './pages/Services'
import CaseStudies  from './pages/CaseStudies'
import Testimonials from './pages/Testimonials'
import AboutUs      from './pages/AboutUs'
import Book         from './pages/Book'
import './App.css'

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <PageBackground />
        <CustomCursor />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/"             element={<Dashboard    />} />
              <Route path="/services"     element={<Services     />} />
              <Route path="/case-studies" element={<CaseStudies  />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/about"        element={<AboutUs      />} />
              <Route path="/book"         element={<Book         />} />
            </Routes>
          </div>
          <Footer />
          <Chatbot />
        </div>
      </ThemeProvider>
    </Router>
  )
}
