import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { subscribeToNewsletter } from '../services/supabaseService'
import toast from 'react-hot-toast'

const Footer = () => {
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email) return
    
    setSubscribing(true)
    try {
      await subscribeToNewsletter(email)
      toast.success('Successfully subscribed to our newsletter')
      setEmail('')
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setSubscribing(false)
    }
  }
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src="/images/logo.png" alt="Desk Diary Logo" className="h-12 w-auto" />
              <h3 className="font-anton text-2xl text-gold">DESK DIARY</h3>
            </div>
            <p className="font-serif italic text-gray-400 text-sm leading-relaxed">
              "Your Desk. Your Story. Your Voice."<br />
              Where every student story matters.
            </p>
          </div>

          <div>
            <h4 className="dateline text-gold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-gold transition-colors">About Us</Link></li>
              <li><Link to="/stories" className="hover:text-gold transition-colors">Student Stories</Link></li>
              <li><Link to="/news" className="hover:text-gold transition-colors">News & Articles</Link></li>
              <li><Link to="/events" className="hover:text-gold transition-colors">Events</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="dateline text-gold mb-4">Get Involved</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/volunteer" className="hover:text-gold transition-colors">Volunteer</Link></li>
              <li><Link to="/partnerships" className="hover:text-gold transition-colors">Partnerships</Link></li>
              <li><Link to="/donate" className="hover:text-gold transition-colors">Donate</Link></li>
              <li><Link to="/programs" className="hover:text-gold transition-colors">Programs</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="dateline text-gold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center space-x-2">
                <Phone size={16} className="text-gold/80" />
                <span>+231 770 755 152</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone size={16} className="text-gold/80" />
                <span>+231 880 986 088 (WhatsApp)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={16} className="text-gold/80" />
                <span>deskdiary401@gmail.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin size={16} className="mt-1 text-gold/80" />
                <span>Behind Moses Blah Compound, Soul Clinic Community, Paynesville City-Liberia</span>
              </li>
            </ul>

            <div className="flex space-x-4 mt-4">
              <a href="https://web.facebook.com/deskdiaryded401" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold transition-colors">
                <Facebook size={22} />
              </a>
              <a href="https://www.instagram.com/deskdiaryded401/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold transition-colors">
                <Instagram size={22} />
              </a>
              <a href="https://www.youtube.com/@deskdiaryded401" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold transition-colors">
                <Youtube size={22} />
              </a>
              <a href="https://www.tiktok.com/@deskdiaryded401/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold transition-colors text-sm self-center">
                TikTok
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Desk Diary. All rights reserved.</p>
          <p className="mt-2">Developed by: <span className="text-gold font-semibold">MUSARA TECHNOLOGIES</span></p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
