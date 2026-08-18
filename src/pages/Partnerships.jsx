import { useState, useEffect } from 'react'
import { Handshake, Building, Users, Star, ArrowRight, X } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getSponsors, getSupporters, getPlatformSettings, submitPartnershipInquiry } from '../services/supabaseService'
import AnimatedCard from '../components/AnimatedCard'
import AnimatedStat from '../components/AnimatedStat'

const DEFAULT_PARTNERSHIP_STATS = { corporate_partners: '20+', school_partners: '50+', counties_reached: '15', invested_in_education: '$50K+' }

const Partnerships = () => {
  const [sponsors, setSponsors] = useState([])
  const [supporters, setSupporters] = useState([])
  const [stats, setStats] = useState(DEFAULT_PARTNERSHIP_STATS)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedSponsor, setSelectedSponsor] = useState(null)
  const [formData, setFormData] = useState({
    organization_name: '', contact_person: '', job_title: '', email: '', phone: '', partnership_type: '', website: '', message: ''
  })

  useEffect(() => {
    const load = async () => {
      const [sponsorsData, supportersData, statsData] = await Promise.all([
        getSponsors(),
        getSupporters(),
        getPlatformSettings('partnership_stats'),
      ])
      setSponsors(sponsorsData)
      setSupporters(supportersData)
      if (statsData && Object.keys(statsData).length) setStats(statsData)
      setLoading(false)
    }
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await submitPartnershipInquiry(formData)
      toast.success('Inquiry submitted! We\'ll be in touch soon.')
      setFormData({ organization_name: '', contact_person: '', job_title: '', email: '', phone: '', partnership_type: '', website: '', message: '' })
    } catch (error) {
      console.error(error)
      toast.error('Failed to submit inquiry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const scrollToForm = () => {
    document.getElementById('partnership-inquiry-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-anton text-5xl md:text-6xl mb-4">Partnerships</h1>
          <p className="text-xl text-gold">Build Partnerships, Transform Lives</p>
        </div>
      </section>

      {/* Why Partner */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-anton text-4xl text-primary mb-6">Why Partner with Desk Diary?</h2>
              <p className="text-gray-600 mb-6">
                Partnering with Desk Diary offers organizations and businesses a unique opportunity to contribute to Liberia's educational development while gaining visibility and making a meaningful impact.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <Star className="text-gold mt-1" size={20} fill="currentColor" />
                  <span className="text-gray-700">Direct impact on student education and development</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Star className="text-gold mt-1" size={20} fill="currentColor" />
                  <span className="text-gray-700">Brand visibility across Liberia's educational sector</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Star className="text-gold mt-1" size={20} fill="currentColor" />
                  <span className="text-gray-700">Networking opportunities with schools and communities</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Star className="text-gold mt-1" size={20} fill="currentColor" />
                  <span className="text-gray-700">Corporate social responsibility fulfillment</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Star className="text-gold mt-1" size={20} fill="currentColor" />
                  <span className="text-gray-700">Tax-deductible contributions (for eligible organizations)</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-lg p-8 text-white">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <Building className="mx-auto h-12 w-12 mb-2" />
                  <div className="font-anton text-3xl"><AnimatedStat value={stats.corporate_partners} /></div>
                  <p className="text-sm">Corporate Partners</p>
                </div>
                <div>
                  <Users className="mx-auto h-12 w-12 mb-2" />
                  <div className="font-anton text-3xl"><AnimatedStat value={stats.school_partners} /></div>
                  <p className="text-sm">School Partners</p>
                </div>
                <div>
                  <Handshake className="mx-auto h-12 w-12 mb-2" />
                  <div className="font-anton text-3xl"><AnimatedStat value={stats.counties_reached} /></div>
                  <p className="text-sm">Counties Reached</p>
                </div>
                <div>
                  <Star className="mx-auto h-12 w-12 mb-2" />
                  <div className="font-anton text-3xl"><AnimatedStat value={stats.invested_in_education} /></div>
                  <p className="text-sm">Invested in Education</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Inquiry Form */}
      <section id="partnership-inquiry-form" className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-8 shadow-md">
            <h2 className="font-anton text-3xl text-primary mb-6 text-center">Partnership Inquiry</h2>
            <p className="text-gray-600 mb-8 text-center">
              Interested in partnering with Desk Diary? Fill out the form below and we'll get in touch with you.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Name</label>
                <input
                  type="text"
                  required
                  value={formData.organization_name}
                  onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter organization name"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job Title</label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Job title"
                  />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Phone number"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Partnership Type</label>
                <select
                  value={formData.partnership_type}
                  onChange={(e) => setFormData({ ...formData, partnership_type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select partnership type</option>
                  <option value="sponsorship">Sponsorship</option>
                  <option value="program">Program Partnership</option>
                  <option value="event">Event Partnership</option>
                  <option value="media">Media Partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Organization Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Partnership Interest</label>
                <textarea
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe your partnership interest and how you'd like to collaborate..."
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Sponsors — admin managed */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-anton text-4xl text-primary text-center mb-12">Our Sponsors</h2>
          {loading ? (
            <p className="text-center text-gray-500">Loading sponsors...</p>
          ) : sponsors.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {sponsors.map((sponsor, index) => (
                <AnimatedCard
                  key={sponsor.id}
                  delay={index * 0.1}
                  className="bg-gray-50 rounded-lg p-8 text-center hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedSponsor(sponsor)}
                >
                  <div className="h-24 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center mb-4 overflow-hidden p-3">
                    {sponsor.logo_url ? (
                      <img src={sponsor.logo_url} alt={sponsor.name} className="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />
                    ) : (
                      <Building className="text-white w-12 h-12" />
                    )}
                  </div>
                  {sponsor.tier && <span className="text-gold text-sm font-semibold">{sponsor.tier}</span>}
                  <h3 className="font-anton text-xl mt-2 mb-2">{sponsor.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{sponsor.description}</p>
                </AnimatedCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-3">No sponsors listed yet.</p>
              <button onClick={scrollToForm} className="text-primary hover:text-gold font-semibold inline-flex items-center">
                Be our first sponsor <ArrowRight className="ml-2" size={18} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Supporters — admin managed */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-anton text-4xl text-primary text-center mb-12">Our Supporters</h2>
          {loading ? (
            <p className="text-center text-gray-500">Loading supporters...</p>
          ) : supporters.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {supporters.map((supporter, index) => (
                <AnimatedCard key={supporter.id} delay={index * 0.1} className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-xl transition-all duration-300">
                  <Users className="text-primary mx-auto h-12 w-12 mb-4" />
                  {supporter.count && <div className="font-anton text-4xl text-primary mb-2"><AnimatedStat value={supporter.count} /></div>}
                  <h3 className="font-semibold text-lg mb-2">{supporter.name}</h3>
                  <p className="text-gray-600 text-sm">{supporter.description}</p>
                </AnimatedCard>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No supporters listed yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-anton text-4xl mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our network of partners and supporters who are transforming education in Liberia.
          </p>
          <button onClick={scrollToForm} className="bg-gold text-primary px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors inline-flex items-center">
            Become a Partner <ArrowRight className="ml-2" size={20} />
          </button>
        </div>
      </section>

      {/* Sponsor Detail Modal */}
      {selectedSponsor && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedSponsor(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  {selectedSponsor.tier && (
                    <span className="text-gold text-sm font-semibold">{selectedSponsor.tier}</span>
                  )}
                  <h2 className="font-anton text-3xl text-primary">{selectedSponsor.name}</h2>
                </div>
                <button onClick={() => setSelectedSponsor(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>
              {selectedSponsor.logo_url && (
                <div className="h-40 bg-gradient-to-br from-primary to-blue-600 rounded-lg overflow-hidden mb-6 flex items-center justify-center p-4">
                  <img src={selectedSponsor.logo_url} alt={selectedSponsor.name} className="max-h-full max-w-full object-contain" loading="lazy" decoding="async" />
                </div>
              )}
              <p className="text-gray-600 mb-6">{selectedSponsor.description || 'No further details have been added for this partner yet.'}</p>
              <button
                onClick={() => { setSelectedSponsor(null); scrollToForm() }}
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Contact Us About This Partnership
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Partnerships
