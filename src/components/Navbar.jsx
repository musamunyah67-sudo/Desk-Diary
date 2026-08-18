import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ChevronDown } from 'lucide-react'

const PRIMARY_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Volunteer', path: '/volunteer' },
  { name: 'Donate', path: '/donate' },
  { name: 'Programs', path: '/programs' },
  { name: 'Contact', path: '/contact' },
]

const ABOUT_LINKS = [
  { name: 'About Us', path: '/about' },
  { name: 'Stories', path: '/stories' },
  { name: 'News', path: '/news' },
  { name: 'Events', path: '/events' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Partners', path: '/partners' },
]

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false)
  const location = useLocation()
  const aboutRef = useRef(null)

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  const isAboutActive = ABOUT_LINKS.some((l) => isActive(l.path))

  // Close the desktop "About Us" dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (aboutRef.current && !aboutRef.current.contains(e.target)) {
        setAboutOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close all menus on route change
  useEffect(() => {
    setIsOpen(false)
    setAboutOpen(false)
    setMobileAboutOpen(false)
  }, [location.pathname])

  const linkClasses = (active) =>
    `relative px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
      active ? 'text-primary' : 'text-gray-600 hover:text-primary'
    }`

  const underline = (active) => (
    <span
      className={`absolute left-3 right-3 -bottom-0.5 h-0.5 bg-gold transition-transform origin-left ${
        active ? 'scale-x-100' : 'scale-x-0'
      }`}
    />
  )

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/images/logo.png" alt="Desk Diary Logo" className="h-11 w-auto" />
            <span className="font-anton text-2xl md:text-3xl tracking-wider text-primary">DESK DIARY</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center space-x-1">
            {PRIMARY_LINKS.map((link) => (
              <Link key={link.path} to={link.path} className={linkClasses(isActive(link.path))}>
                {link.name}
                {underline(isActive(link.path))}
              </Link>
            ))}

            {/* About Us dropdown */}
            <div className="relative" ref={aboutRef}>
              <button
                onClick={() => setAboutOpen(!aboutOpen)}
                className={`${linkClasses(isAboutActive)} inline-flex items-center gap-1`}
                aria-expanded={aboutOpen}
              >
                About Us
                <ChevronDown size={14} className={`transition-transform ${aboutOpen ? 'rotate-180' : ''}`} />
                {underline(isAboutActive)}
              </button>
              {aboutOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                  {ABOUT_LINKS.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`block px-4 py-2 text-sm font-medium transition-colors ${
                        isActive(link.path) ? 'text-primary bg-gold/10' : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              className="inline-flex items-center justify-center p-2 rounded-md text-primary hover:bg-gold/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu — same 5 links + an expandable "About Us" section, About Us last */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {PRIMARY_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-semibold ${
                  isActive(link.path) ? 'text-primary bg-gold/10' : 'text-gray-700 hover:bg-gold/10 hover:text-primary'
                }`}
              >
                {link.name}
              </Link>
            ))}

            <button
              onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-semibold ${
                isAboutActive ? 'text-primary bg-gold/10' : 'text-gray-700 hover:bg-gold/10 hover:text-primary'
              }`}
            >
              About Us
              <ChevronDown size={18} className={`transition-transform ${mobileAboutOpen ? 'rotate-180' : ''}`} />
            </button>
            {mobileAboutOpen && (
              <div className="pl-4 space-y-1">
                {ABOUT_LINKS.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      isActive(link.path) ? 'text-primary bg-gold/10' : 'text-gray-600 hover:bg-gold/10 hover:text-primary'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
