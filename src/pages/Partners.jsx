import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { School, Star, Plus, MapPin, Mail, Phone, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { getPartners, submitSchoolSubmission } from '../services/supabaseService'
import toast from 'react-hot-toast'
import AnimatedCard from '../components/AnimatedCard'

const Partners = () => {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('schools')
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [schoolForm, setSchoolForm] = useState({
    school_name: '', address: '', contact_person: '', contact_email: '',
    phone: '', student_count: '', programs_of_interest: [], additional_info: ''
  })

  const toggleProgram = (program) => {
    setSchoolForm((prev) => ({
      ...prev,
      programs_of_interest: prev.programs_of_interest.includes(program)
        ? prev.programs_of_interest.filter((p) => p !== program)
        : [...prev.programs_of_interest, program]
    }))
  }

  const handleSchoolSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // Match database schema exactly
      const submissionData = {
        school_name: schoolForm.school_name,
        address: schoolForm.address,
        contact_person: schoolForm.contact_person,
        contact_email: schoolForm.contact_email,
        phone: schoolForm.phone,
        student_count: schoolForm.student_count,
        programs_of_interest: schoolForm.programs_of_interest,
        additional_info: schoolForm.additional_info
      }
      await submitSchoolSubmission(submissionData)
      toast.success('Application submitted! We\'ll review it and be in touch.')
      setSchoolForm({ school_name: '', address: '', contact_person: '', contact_email: '', phone: '', student_count: '', programs_of_interest: [], additional_info: '' })
    } catch (error) {
      console.error(error)
      toast.error('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    loadPartners()
  }, [activeTab])

  const loadPartners = async () => {
    setLoading(true)
    try {
      const featured = activeTab === 'featured' ? true : null
      const data = await getPartners(featured)
      setPartners(data)
      // If we were sent here from a homepage/preview click, open that
      // partner's detail modal automatically once the list has loaded.
      const openId = location.state?.openPartnerId
      if (openId) {
        const match = data.find((p) => p.id === openId)
        if (match) setSelectedPartner(match)
      }
    } catch (error) {
      console.error('Error loading partners:', error)
    } finally {
      setLoading(false)
    }
  }

  const partnerSchools = partners

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-anton text-5xl md:text-6xl mb-4">Our Partners</h1>
          <p className="text-xl text-gold">Partner Schools and Educational Institutions</p>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-8 bg-gray-50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setActiveTab('schools')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                activeTab === 'schools'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Partner Schools
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                activeTab === 'featured'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Featured Schools
            </button>
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                activeTab === 'submit'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              School Submission
            </button>
          </div>
        </div>
      </section>

      {/* Schools Grid */}
      {activeTab === 'schools' && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading partners...</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {partnerSchools.map((school, index) => (
                    <AnimatedCard
                      key={school.id}
                      delay={index * 0.1}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedPartner(school)}
                    >
                      {school.image_url && (
                        <div className="h-48 relative bg-gray-50">
                          <img src={school.image_url} alt={school.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </div>
                      )}
                      <div className="p-6">
                        {school.featured && (
                          <div className="flex items-center space-x-1 text-gold mb-2">
                            <Star size={16} fill="currentColor" />
                            <span className="text-sm font-semibold">Featured School</span>
                          </div>
                        )}
                        <h3 className="font-anton text-xl mb-2">{school.name}</h3>
                        <div className="flex items-center space-x-2 text-gray-500 text-sm mb-3">
                          <MapPin size={16} />
                          <span>{school.location}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{school.students} Students</p>
                        <div className="flex flex-wrap gap-2">
                          {school.programs && school.programs.map((program, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                              {program}
                            </span>
                          ))}
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
                {partnerSchools.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <School className="mx-auto text-primary mb-4" size={48} />
                    <p className="text-gray-600 text-lg mb-2">Our partner schools directory is being updated.</p>
                    <p className="text-gray-500 mb-4">In the meantime, we'd love to have your school join the Desk Diary family.</p>
                    <button
                      onClick={() => setActiveTab('submit')}
                      className="text-primary hover:text-gold font-semibold inline-flex items-center"
                    >
                      Apply to become a partner school →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Featured Schools */}
      {activeTab === 'featured' && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading featured partners...</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-8">
                  {partnerSchools.filter(s => s.featured).map((school, index) => (
                    <AnimatedCard
                      key={school.id}
                      delay={index * 0.1}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedPartner(school)}
                    >
                      {school.image_url && (
                        <div className="h-64 relative">
                          <img src={school.image_url} alt={school.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center space-x-1 text-gold mb-2">
                          <Star size={16} fill="currentColor" />
                          <span className="text-sm font-semibold">Featured School</span>
                        </div>
                        <h3 className="font-anton text-2xl mb-2">{school.name}</h3>
                        <div className="flex items-center space-x-2 text-gray-500 text-sm mb-3">
                          <MapPin size={16} />
                          <span>{school.location}</span>
                        </div>
                        <p className="text-gray-600 mb-3">{school.students} Students</p>
                        <p className="text-gray-600 text-sm mb-4">
                          This school has demonstrated exceptional commitment to student development through active participation in Desk Diary programs.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {school.programs && school.programs.map((program, index) => (
                            <span key={index} className="bg-primary text-white text-xs px-3 py-1 rounded">
                              {program}
                            </span>
                          ))}
                        </div>
                      </div>
                    </AnimatedCard>
                  ))}
                </div>
                {partnerSchools.filter(s => s.featured).length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Star className="mx-auto text-gold mb-4" size={48} />
                    <p className="text-gray-600 text-lg mb-2">We're preparing to spotlight our standout partner schools here.</p>
                    <p className="text-gray-500 mb-4">While you wait, explore the impact we're making across Liberia.</p>
                    <button
                      onClick={() => setActiveTab('schools')}
                      className="text-primary hover:text-gold font-semibold inline-flex items-center"
                    >
                      View all partner schools →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* School Submission Form */}
      {activeTab === 'submit' && (
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gray-50 rounded-lg p-8">
              <h2 className="font-anton text-3xl text-primary mb-6 text-center">Partner School Submission</h2>
              <p className="text-gray-600 mb-8 text-center">
                Join our network of partner schools and give your students the opportunity to have their stories documented and celebrated.
              </p>
              <form onSubmit={handleSchoolSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">School Name</label>
                  <input
                    type="text"
                    required
                    value={schoolForm.school_name}
                    onChange={(e) => setSchoolForm({ ...schoolForm, school_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter school name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">School Address</label>
                  <input
                    type="text"
                    value={schoolForm.address}
                    onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter school address"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Person</label>
                    <input
                      type="text"
                      value={schoolForm.contact_person}
                      onChange={(e) => setSchoolForm({ ...schoolForm, contact_person: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Email</label>
                    <input
                      type="email"
                      required
                      value={schoolForm.contact_email}
                      onChange={(e) => setSchoolForm({ ...schoolForm, contact_email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Email address"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={schoolForm.phone}
                    onChange={(e) => setSchoolForm({ ...schoolForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Students</label>
                  <input
                    type="number"
                    value={schoolForm.student_count}
                    onChange={(e) => setSchoolForm({ ...schoolForm, student_count: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Approximate number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Programs of Interest</label>
                  <div className="space-y-2">
                    {['Media Club', 'Leadership Training', 'Journalism Workshop', 'Storytelling Workshop', 'Community Engagement'].map((program) => (
                      <label key={program} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={schoolForm.programs_of_interest.includes(program)}
                          onChange={() => toggleProgram(program)}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span className="text-gray-700">{program}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Information</label>
                  <textarea
                    rows="4"
                    value={schoolForm.additional_info}
                    onChange={(e) => setSchoolForm({ ...schoolForm, additional_info: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Tell us more about your school..."
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
      )}

      {/* Partner Detail Modal */}
      {selectedPartner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPartner(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  {selectedPartner.featured && (
                    <div className="flex items-center space-x-1 text-gold mb-2">
                      <Star size={16} fill="currentColor" />
                      <span className="text-sm font-semibold">Featured School</span>
                    </div>
                  )}
                  <h2 className="font-anton text-3xl text-primary">{selectedPartner.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedPartner(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              {selectedPartner.image_url && (
                <img src={selectedPartner.image_url} alt={selectedPartner.name} className="w-full h-64 object-cover rounded-lg mb-6" loading="lazy" decoding="async" />
              )}

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin size={20} />
                  <span>{selectedPartner.location}</span>
                </div>

                {selectedPartner.contact_email && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail size={20} />
                    <a href={`mailto:${selectedPartner.contact_email}`} className="text-primary hover:underline">
                      {selectedPartner.contact_email}
                    </a>
                  </div>
                )}

                {selectedPartner.phone && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone size={20} />
                    <a href={`tel:${selectedPartner.phone}`} className="text-primary hover:underline">
                      {selectedPartner.phone}
                    </a>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-gray-600"><strong>Students:</strong> {selectedPartner.students}</p>
                </div>

                {selectedPartner.programs && selectedPartner.programs.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="font-semibold text-gray-700 mb-2">Programs:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPartner.programs.map((program, index) => (
                        <span key={index} className="bg-primary text-white text-sm px-3 py-1 rounded">
                          {program}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Partners
