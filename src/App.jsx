import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import PageLoader from './components/PageLoader'
import NavigationProgressBar from './components/NavigationProgressBar'

const About = lazy(() => import('./pages/About'))
const Stories = lazy(() => import('./pages/Stories'))
const StoryDetail = lazy(() => import('./pages/StoryDetail'))
const News = lazy(() => import('./pages/News'))
const NewsDetail = lazy(() => import('./pages/NewsDetail'))
const Events = lazy(() => import('./pages/Events'))
const EventDetail = lazy(() => import('./pages/EventDetail'))
const Gallery = lazy(() => import('./pages/Gallery'))
const Partners = lazy(() => import('./pages/Partners'))
const Programs = lazy(() => import('./pages/Programs'))
const Volunteer = lazy(() => import('./pages/Volunteer'))
const Partnerships = lazy(() => import('./pages/Partnerships'))
const Donate = lazy(() => import('./pages/Donate'))
const Contact = lazy(() => import('./pages/Contact'))
const Login = lazy(() => import('./pages/Login'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavigationProgressBar />
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/stories" element={<Stories />} />
                <Route path="/stories/:id" element={<StoryDetail />} />
                <Route path="/news" element={<News />} />
                <Route path="/news/:id" element={<NewsDetail />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetail />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/partners" element={<Partners />} />
                <Route path="/programs" element={<Programs />} />
                <Route path="/volunteer" element={<Volunteer />} />
                <Route path="/partnerships" element={<Partnerships />} />
                <Route path="/donate" element={<Donate />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  )
}

export default App
