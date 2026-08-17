import { useState, useEffect } from 'react'
import { Calendar, MapPin, Clock, ArrowRight, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getEvents, createEventRegistration } from '../services/supabaseService'
import AnimatedCard from '../components/AnimatedCard'
import toast from 'react-hot-toast'

const Events = () => {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showRegistration, setShowRegistration] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [registering, setRegistering] = useState(false)
  const [registrationForm, setRegistrationForm] = useState({
    name: '',
    email: '',
    phone: '',
    school: '',
    notes: ''
  })

  useEffect(() => {
    loadEvents()
  }, [activeTab])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const status = activeTab === 'upcoming' ? 'upcoming' : 'past'
      const data = await getEvents(status)
      setEvents(data)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  const upcomingEvents = events.filter(e => e.status === 'upcoming')
  const pastEvents = events.filter(e => e.status === 'past')
  const displayEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-anton text-5xl md:text-6xl mb-4">Events</h1>
          <p className="text-xl text-gold">Upcoming and Past Events Coverage</p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-8 bg-gray-50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                activeTab === 'upcoming'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                activeTab === 'past'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Past Events
            </button>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading events...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayEvents.map((event, index) => (
                  <AnimatedCard key={event.id} delay={index * 0.1} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300">
                    {event.image_url && (
                      <div className="h-48 relative">
                        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center space-x-2 mb-3 text-sm text-gray-500">
                        <Calendar size={16} />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-anton text-xl mb-3">{event.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>
                      {event.location && (
                        <div className="space-y-2 text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-2">
                            <MapPin size={16} />
                            <span>{event.location}</span>
                          </div>
                        </div>
                      )}
                      {activeTab === 'upcoming' && (
                        <button 
                          onClick={() => { setSelectedEvent(event); setShowRegistration(true); }}
                          className="mt-4 w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                          Register Now
                        </button>
                      )}
                      {activeTab === 'past' && (
                        <Link to={`/events/${event.id}`} className="mt-4 w-full border border-primary text-primary py-2 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors inline-block text-center">
                          View Coverage
                        </Link>
                      )}
                    </div>
                  </AnimatedCard>
                ))}
              </div>

              {displayEvents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No events found.</p>
                  <Link to="/contact" className="inline-block mt-4 text-primary hover:text-gold">
                    Contact us to submit an event
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Event Submission CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-anton text-4xl text-primary mb-4">Host an Event with Us</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Partner with Desk Diary to organize events that empower students and strengthen educational communities.
          </p>
          <Link to="/contact" className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Contact Us to Partner
          </Link>
        </div>
      </section>

      {/* Event Registration Modal */}
      {showRegistration && selectedEvent && (
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
                  <p className="text-gray-600 text-sm mt-1">{selectedEvent.title}</p>
                </div>
                <button
                  onClick={() => setShowRegistration(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={async (e) => {
                e.preventDefault()
                setRegistering(true)
                try {
                  await createEventRegistration({
                    event_id: selectedEvent.id,
                    event_title: selectedEvent.title,
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
              }} className="space-y-4">
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

export default Events
