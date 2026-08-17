import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, ArrowLeft, Share2, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { getEvents, createEventRegistration } from '../services/supabaseService'
import AnimatedCard from '../components/AnimatedCard'
import toast from 'react-hot-toast'

const EventDetail = () => {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRegistration, setShowRegistration] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [registrationForm, setRegistrationForm] = useState({ name: '', email: '', phone: '', school: '', notes: '' })

  useEffect(() => {
    loadEvent()
  }, [id])

  const loadEvent = async () => {
    try {
      const events = await getEvents()
      const found = events.find(e => e.id === id)
      setEvent(found)
    } catch (error) {
      console.error('Error loading event:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading event...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Event not found</p>
          <Link to="/events" className="text-primary hover:text-gold font-semibold">
            Back to Events
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/events" className="inline-flex items-center text-gold hover:text-white mb-6">
            <ArrowLeft size={20} className="mr-2" />
            Back to Events
          </Link>
          <h1 className="font-anton text-4xl md:text-5xl mb-4">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gold">
            <div className="flex items-center space-x-2">
              <Calendar size={18} />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            {event.location && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-2">
                  <MapPin size={18} />
                  <span>{event.location}</span>
                </div>
              </>
            )}
            {event.time && (
              <>
                <span>•</span>
                <div className="flex items-center space-x-2">
                  <Clock size={18} />
                  <span>{event.time}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Event Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {event.image_url && (
            <AnimatedCard className="mb-8">
              <img src={event.image_url} alt={event.title} className="w-full h-96 object-cover rounded-lg" loading="lazy" decoding="async" />
            </AnimatedCard>
          )}

          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {event.description}
            </div>
          </div>

          {event.status === 'upcoming' && (
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="font-anton text-2xl text-primary mb-4">Register for this Event</h3>
              <p className="text-gray-600 mb-4">
                Join us for this exciting event! Click below to register.
              </p>
              <button
                onClick={() => setShowRegistration(true)}
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Register Now
              </button>
            </div>
          )}

          <div className="mt-8 flex justify-between items-center">
            <Link to="/events" className="text-primary hover:text-gold font-semibold">
              ← Back to Events
            </Link>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: event.title, url: window.location.href }).catch(() => {})
                } else {
                  navigator.clipboard.writeText(window.location.href)
                  toast.success('Event link copied to clipboard')
                }
              }}
              className="flex items-center space-x-2 text-gray-600 hover:text-primary"
            >
              <Share2 size={20} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </section>

      {/* Event Registration Modal */}
      {showRegistration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRegistration(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="font-anton text-2xl text-primary">Register for Event</h2>
                  <p className="text-gray-600 text-sm mt-1">{event.title}</p>
                </div>
                <button onClick={() => setShowRegistration(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setRegistering(true)
                  try {
                    await createEventRegistration({
                      event_id: event.id,
                      event_title: event.title,
                      name: registrationForm.name,
                      email: registrationForm.email,
                      phone: registrationForm.phone,
                      school: registrationForm.school,
                      notes: registrationForm.notes,
                      status: 'pending'
                    })
                    setShowRegistration(false)
                    toast.success('Registration successful! We\'ll contact you with more details.')
                    setRegistrationForm({ name: '', email: '', phone: '', school: '', notes: '' })
                  } catch (error) {
                    console.error('Registration error:', error)
                    toast.error('Failed to register. Please try again.')
                  } finally {
                    setRegistering(false)
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={registrationForm.name}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={registrationForm.email}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={registrationForm.phone}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">School/Organization</label>
                  <input
                    type="text"
                    value={registrationForm.school}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, school: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter your school or organization"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                  <textarea
                    rows="3"
                    value={registrationForm.notes}
                    onChange={(e) => setRegistrationForm({ ...registrationForm, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Any additional information..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={registering}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {registering ? 'Registering...' : 'Complete Registration'}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default EventDetail
