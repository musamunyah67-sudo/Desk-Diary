import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Stories', path: '/stories' },
    { name: 'News', path: '/news' },
    { name: 'Events', path: '/events' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Partners', path: '/partners' },
    { name: 'Programs', path: '/programs' },
    { name: 'Volunteer', path: '/volunteer' },
    { name: 'Donate', path: '/donate' },
    { name: 'Contact', path: '/contact' },
  ]

  const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/images/logo.png" alt="Desk Diary Logo" className="h-11 w-auto" />
            <span className="font-anton text-2xl md:text-3xl tracking-wider text-primary">DESK DIARY</span>
          </Link>

          <div className="hidden lg:block">
            <div className="flex items-baseline space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                    isActive(link.path) ? 'text-primary' : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute left-3 right-3 -bottom-0.5 h-0.5 bg-gold transition-transform origin-left ${
                      isActive(link.path) ? 'scale-x-100' : 'scale-x-0'
                    }`}
                  />
                </Link>
              ))}
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

      {isOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-semibold ${
                  isActive(link.path) ? 'text-primary bg-gold/10' : 'text-gray-700 hover:bg-gold/10 hover:text-primary'
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
