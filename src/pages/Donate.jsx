import { useState, useEffect } from 'react'
import { Heart, CreditCard, Smartphone, Building2, Target, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { getCampaigns, getDonationMethods, getPlatformSettings } from '../services/supabaseService'
import AnimatedIcon from '../components/AnimatedIcon'
import AnimatedStat from '../components/AnimatedStat'

const METHOD_ICONS = { CreditCard, Smartphone, Building2 }
const DEFAULT_DONATE_STATS = { students_impacted: '600+', schools_reached: '30+', stories_documented: '50+', counties_covered: '15' }

const Donate = () => {
  const [campaigns, setCampaigns] = useState([])
  const [donationMethods, setDonationMethods] = useState([])
  const [stats, setStats] = useState(DEFAULT_DONATE_STATS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    try {
      const [campaignsData, methodsData, statsData] = await Promise.all([
        getCampaigns(),
        getDonationMethods(),
        getPlatformSettings('donate_stats'),
      ])
      setCampaigns(campaignsData)
      setDonationMethods(methodsData)
      if (statsData && Object.keys(statsData).length) setStats(statsData)
    } catch (error) {
      console.error('Error loading donate page data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-anton text-5xl md:text-6xl mb-4">Donate</h1>
          <p className="text-xl text-gold">Support Our Mission to Empower Students</p>
        </div>
      </section>

      {/* Impact */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-anton text-4xl text-primary mb-6">Your Impact</h2>
              <p className="text-gray-600 mb-6">
                Your donation directly supports Desk Diary's mission to document, celebrate, and amplify student voices across Liberia. Every contribution helps us:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <Heart className="text-gold mt-1" size={20} fill="currentColor" />
                  <span className="text-gray-700">Train students in journalism and media skills</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Heart className="text-gold mt-1" size={20} fill="currentColor" />
                  <span className="text-gray-700">Establish media clubs in schools</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Heart className="text-gold mt-1" size={20} fill="currentColor" />
                  <span className="text-gray-700">Document and share student stories</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Heart className="text-gold mt-1" size={20} fill="currentColor" />
                  <span className="text-gray-700">Provide leadership development programs</span>
                </li>
                <li className="flex items-start space-x-3">
                  <Heart className="text-gold mt-1" size={20} fill="currentColor" />
                  <span className="text-gray-700">Expand to reach more schools and communities</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-lg p-8 text-white">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <AnimatedIcon icon={Target} size={36} className="text-white mx-auto" haloClassName="bg-white" variant="float" />
                  <div className="font-anton text-3xl mt-1"><AnimatedStat value={stats.students_impacted} /></div>
                  <p className="text-sm">Students Impacted</p>
                </div>
                <div>
                  <AnimatedIcon icon={TrendingUp} size={36} className="text-white mx-auto" haloClassName="bg-white" variant="wiggle" />
                  <div className="font-anton text-3xl mt-1"><AnimatedStat value={stats.schools_reached} /></div>
                  <p className="text-sm">Schools Reached</p>
                </div>
                <div>
                  <AnimatedIcon icon={Heart} size={36} className="text-white mx-auto" haloClassName="bg-white" variant="pulse" />
                  <div className="font-anton text-3xl mt-1"><AnimatedStat value={stats.stories_documented} /></div>
                  <p className="text-sm">Stories Documented</p>
                </div>
                <div>
                  <AnimatedIcon icon={Building2} size={36} className="text-white mx-auto" haloClassName="bg-white" variant="spin" />
                  <div className="font-anton text-3xl mt-1"><AnimatedStat value={stats.counties_covered} /></div>
                  <p className="text-sm">Counties Covered</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Methods */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-anton text-4xl text-primary text-center mb-12">Donation Methods</h2>
          {donationMethods.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {donationMethods.map((method) => {
                const Icon = METHOD_ICONS[method.icon] || CreditCard
                return (
                  <div key={method.id} className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                    <Icon className="text-primary mx-auto h-16 w-16 mb-4" />
                    <h3 className="font-anton text-xl mb-2">{method.title}</h3>
                    <p className="text-gray-600 text-sm">{method.description}</p>
                    {method.details && <p className="text-gray-500 text-xs mt-3 whitespace-pre-line">{method.details}</p>}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">Donation methods will be listed here soon.</p>
          )}
        </div>
      </section>

      {/* Donation Form */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="font-anton text-3xl text-primary mb-6 text-center">Make a Donation</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Donation Amount</label>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {['$10', '$25', '$50', '$100'].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className="border-2 border-primary text-primary py-2 rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors"
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Or enter custom amount"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your email address"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Donation Method</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select payment method</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="mobile">Mobile Money</option>
                  <option value="bank">Bank Transfer</option>
                </select>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded text-primary focus:ring-primary" />
                  <span className="text-gray-700 text-sm">Make this a recurring monthly donation</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Message (Optional)</label>
                <textarea
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add a message with your donation..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Donate Now
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Campaigns */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-anton text-4xl text-primary text-center mb-12">Active Campaigns</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading campaigns...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-3 gap-8">
                {campaigns.map((campaign, index) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="bg-white rounded-lg p-6 shadow-md hover:shadow-2xl transition-all duration-300"
                  >
                    <h3 className="font-anton text-xl mb-2">{campaign.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{campaign.description}</p>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">Raised: ${campaign.raised_amount || 0}</span>
                        <span className="text-gray-600">Goal: ${campaign.goal_amount || 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(((campaign.raised_amount || 0) / (campaign.goal_amount || 1)) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <button className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Donate to Campaign
                    </button>
                  </motion.div>
                ))}
              </div>
              {campaigns.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No active campaigns at this time.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Thank You Message */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Heart className="mx-auto h-16 w-16 mb-4" />
          <h2 className="font-anton text-4xl mb-4">Thank You for Your Support</h2>
          <p className="text-xl max-w-2xl mx-auto">
            Your generosity helps us continue our mission of empowering students across Liberia through storytelling and media education.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Donate
