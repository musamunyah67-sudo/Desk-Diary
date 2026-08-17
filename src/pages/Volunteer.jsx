import { useState, useEffect } from 'react'
import { Heart, Clock, Users, Award, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { getVolunteerOpportunities, getVolunteerResources, getPlatformSettings, submitVolunteerApplication } from '../services/supabaseService'
import toast from 'react-hot-toast'
import AnimatedStat from '../components/AnimatedStat'

const DEFAULT_VOLUNTEER_STATS = { active_volunteers: '20+', hours_contributed: '2500+', schools_supported: '10+', students_impacted: '600+' }

const Volunteer = () => {
  const [opportunities, setOpportunities] = useState([])
  const [resources, setResources] = useState([])
  const [stats, setStats] = useState(DEFAULT_VOLUNTEER_STATS)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    opportunity_id: '',
    availability: '',
    skills: '',
    motivation: ''
  })

  const benefits = [
    'Make a meaningful impact on students\' lives',
    'Develop professional skills and experience',
    'Network with like-minded individuals',
    'Receive volunteer recognition and certificates',
    'Flexible scheduling options',
    'Opportunity for leadership roles'
  ]

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [opps, res, statsData] = await Promise.all([
        getVolunteerOpportunities(),
        getVolunteerResources(),
        getPlatformSettings('volunteer_stats'),
      ])
      setOpportunities(opps)
      setResources(res)
      if (statsData && Object.keys(statsData).length) setStats(statsData)
    } catch (error) {
      console.error('Error loading volunteer page data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // Match database schema exactly
      const applicationData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        opportunity_id: formData.opportunity_id || null,
        availability: formData.availability,
        skills: formData.skills,
        motivation: formData.motivation
      }
      await submitVolunteerApplication(applicationData)
      toast.success('Application submitted successfully!')
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        opportunity_id: '',
        availability: '',
        skills: '',
        motivation: ''
      })
    } catch (error) {
      console.error(error)
      toast.error('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-anton text-5xl md:text-6xl mb-4">Volunteer</h1>
          <p className="text-xl text-gold">Make a Difference in Students' Lives</p>
        </div>
      </section>

      {/* Why Volunteer */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-anton text-4xl text-primary mb-6">Why Volunteer with Desk Diary?</h2>
              <p className="text-gray-600 mb-6">
                Volunteering with Desk Diary is an opportunity to contribute to Liberia's educational future while developing your own skills and making meaningful connections.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <CheckCircle className="text-gold" size={20} />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-lg p-8 text-white">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <Users className="mx-auto h-12 w-12 mb-2" />
                  <div className="font-anton text-3xl"><AnimatedStat value={stats.active_volunteers} /></div>
                  <p className="text-sm">Active Volunteers</p>
                </div>
                <div>
                  <Clock className="mx-auto h-12 w-12 mb-2" />
                  <div className="font-anton text-3xl"><AnimatedStat value={stats.hours_contributed} /></div>
                  <p className="text-sm">Hours Contributed</p>
                </div>
                <div>
                  <Award className="mx-auto h-12 w-12 mb-2" />
                  <div className="font-anton text-3xl"><AnimatedStat value={stats.schools_supported} /></div>
                  <p className="text-sm">Schools Supported</p>
                </div>
                <div>
                  <Heart className="mx-auto h-12 w-12 mb-2" />
                  <div className="font-anton text-3xl"><AnimatedStat value={stats.students_impacted} /></div>
                  <p className="text-sm">Students Impacted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Volunteer Opportunities */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-anton text-4xl text-primary text-center mb-12">Volunteer Opportunities</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading opportunities...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 gap-8">
                {opportunities.map((opportunity, index) => (
                  <motion.div
                    key={opportunity.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="bg-white rounded-lg p-6 shadow-md hover:shadow-2xl transition-all duration-300"
                  >
                    <h3 className="font-anton text-2xl text-primary mb-3">{opportunity.title}</h3>
                    <p className="text-gray-600 mb-4">{opportunity.description}</p>
                    {opportunity.time_commitment && (
                      <div className="flex items-center space-x-2 text-gray-500 text-sm mb-4">
                        <Clock size={16} />
                        <span>{opportunity.time_commitment}</span>
                      </div>
                    )}
                    {opportunity.skills && opportunity.skills.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-2">Required Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {opportunity.skills.map((skill, i) => (
                            <span key={i} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              {opportunities.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No volunteer opportunities available at this time.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="font-anton text-3xl text-primary mb-6 text-center">Volunteer Application</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Volunteer Opportunity</label>
                <select 
                  name="opportunity_id"
                  value={formData.opportunity_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select an opportunity</option>
                  {opportunities.map((opp) => (
                    <option key={opp.id} value={opp.id}>{opp.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Availability</label>
                <select 
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select availability</option>
                  <option value="weekdays">Weekdays</option>
                  <option value="weekends">Weekends</option>
                  <option value="evenings">Evenings</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Skills & Experience</label>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe your relevant skills and experience..."
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Motivation</label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Why do you want to volunteer with Desk Diary?"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Volunteer Resources */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-anton text-4xl text-primary mb-4">Volunteer Resources</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Access training materials, guidelines, and resources to support your volunteer journey.
          </p>
          {resources.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {resources.map((r) => (
                <div key={r.id} className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="font-semibold text-lg mb-2">{r.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{r.description}</p>
                  {r.file_url ? (
                    <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold text-sm hover:text-gold">
                      {r.link_label || 'View Resource'}
                    </a>
                  ) : (
                    <span className="text-gray-400 text-sm">Coming soon</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No resources uploaded yet. Check back soon, or contact us directly for guidance.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default Volunteer
