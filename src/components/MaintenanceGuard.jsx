import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useMaintenanceStatus } from '../hooks/useMaintenanceStatus'
import { isMaintenanceOwner } from '../lib/maintenanceConfig'
import Navbar from './Navbar'
import Footer from './Footer'
import PageLoader from './PageLoader'
import Home from '../pages/Home'
import MaintenancePage from '../pages/MaintenancePage'

const About = lazy(() => import('../pages/About'))
const Stories = lazy(() => import('../pages/Stories'))
const StoryDetail = lazy(() => import('../pages/StoryDetail'))
const News = lazy(() => import('../pages/News'))
const NewsDetail = lazy(() => import('../pages/NewsDetail'))
const Events = lazy(() => import('../pages/Events'))
const EventDetail = lazy(() => import('../pages/EventDetail'))
const Gallery = lazy(() => import('../pages/Gallery'))
const Partners = lazy(() => import('../pages/Partners'))
const Programs = lazy(() => import('../pages/Programs'))
const Volunteer = lazy(() => import('../pages/Volunteer'))
const Partnerships = lazy(() => import('../pages/Partnerships'))
const Donate = lazy(() => import('../pages/Donate'))
const Contact = lazy(() => import('../pages/Contact'))
const Login = lazy(() => import('../pages/Login'))
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'))
const VerifyMember = lazy(() => import('../pages/VerifyMember'))

const MaintenanceGuard = () => {
  const { user, loading: authLoading } = useAuth()
  const { enabled: maintenanceEnabled, message: maintenanceMessage, loading: maintenanceLoading } = useMaintenanceStatus()

  if (authLoading || maintenanceLoading) {
    return <PageLoader />
  }

  const blocked = maintenanceEnabled && !isMaintenanceOwner(user?.email)

  if (blocked) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* /login must stay reachable even when blocked — otherwise the
              maintenance owner has no way to authenticate on a fresh
              session (cleared cookies, new browser, private window) once
              maintenance mode is already on. Anyone else who logs in here
              still gets routed straight back to the maintenance page for
              every other route, so this isn't a bypass — just a door the
              owner needs. */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify/:token" element={<VerifyMember />} />
          <Route path="*" element={<MaintenancePage message={maintenanceMessage} />} />
        </Routes>
      </Suspense>
    )
  }

  return (
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
            <Route path="/verify/:token" element={<VerifyMember />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default MaintenanceGuard
