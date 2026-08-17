import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Send, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { getContactSettings, submitContactMessage } from '../services/supabaseService'

const DEFAULT_CONTACT = {
  phone: '+231 770 755 152',
  whatsapp: '+231 880 986 088',
  email: 'deskdiary401@gmail.com',
  address: 'Behind Moses Blah Compound, Soul Clinic Community, Paynesville City-Liberia',
  facebook_url: 'https://web.facebook.com/deskdiaryded401',
  instagram_url: 'https://www.instagram.com/deskdiaryded401/',
  youtube_url: 'https://www.youtube.com/@deskdiaryded401',
  tiktok_url: 'https://www.tiktok.com/@deskdiaryded401/',
}

const Contact = () => {
  const [settings, setSettings] = useState(DEFAULT_CONTACT)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', phone: '', subject: '', message: ''
  })

  useEffect(() => {
    const load = async () => {
      const data = await getContactSettings()
      if (data && !Array.isArray(data) && Object.keys(data).length) setSettings({ ...DEFAULT_CONTACT, ...data })
    }
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // Match database schema exactly
      const messageData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message
      }
      await submitContactMessage(messageData)
      toast.success('Message sent! We\'ll get back to you soon.')
      setFormData({ first_name: '', last_name: '', email: '', phone: '', subject: '', message: '' })
    } catch (error) {
      console.error(error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const contactInfo = [
    {
      icon: Phone,
      title: 'Phone',
      value: settings.phone,
      value2: settings.whatsapp ? `${settings.whatsapp} (WhatsApp)` : null,
      label: 'Call or WhatsApp us'
    },
    {
      icon: Mail,
      title: 'Email',
      value: settings.email,
      label: 'Send us an email'
    },
    {
      icon: MapPin,
      title: 'Office Address',
      value: settings.address,
      label: 'Visit our office'
    }
  ]

  const mapQuery = encodeURIComponent(settings.address || DEFAULT_CONTACT.address)

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-anton text-5xl md:text-6xl mb-4">Contact Us</h1>
          <p className="text-xl text-gold">Get in Touch with Desk Diary</p>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="font-anton text-3xl text-primary mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Last name"
                    />
                  </div>
                </div>
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
                    placeholder="Phone number (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select a subject</option>
                    <option value="general">General Inquiry</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="volunteer">Volunteer Opportunity</option>
                    <option value="media">Media Request</option>
                    <option value="school">School Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                  <textarea
                    rows="5"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Write your message here..."
                  ></textarea>
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50"
                >
                  <Send className="mr-2" size={20} />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="font-anton text-3xl text-primary mb-6">Contact Information</h2>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary text-white p-3 rounded-lg">
                        <info.icon size={24} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{info.title}</h3>
                        <p className="text-gray-600 mb-1">{info.value}</p>
                        {info.value2 && <p className="text-gray-600 mb-1">{info.value2}</p>}
                        <p className="text-gray-500 text-sm">{info.label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Social Media */}
              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-4">Follow Us</h3>
                <div className="flex flex-wrap gap-4">
                  {settings.facebook_url && (
                    <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Facebook
                    </a>
                  )}
                  {settings.instagram_url && (
                    <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors">
                      Instagram
                    </a>
                  )}
                  {settings.youtube_url && (
                    <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                      YouTube
                    </a>
                  )}
                  {settings.tiktok_url && (
                    <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                      TikTok
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Google Map — live embed, no API key required for a basic embed */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-anton text-3xl text-primary text-center mb-8">Find Our Office</h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <iframe
              title="Desk Diary office location"
              className="w-full h-96"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
            />
          </div>
          <p className="text-gray-500 text-sm text-center mt-3">{settings.address}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-anton text-3xl text-primary text-center mb-3">Frequently Asked Questions</h2>
          <p className="text-gray-500 text-center mb-10">Everything you need to know about getting involved</p>
          <FaqAccordion
            items={[
              {
                q: 'How can I volunteer with Desk Diary?',
                a: 'You can apply through our Volunteer page. We offer a range of opportunities including storytelling, event coordination, media training, and administrative support — whatever your skills and schedule allow, there\'s likely a role that fits. Once you submit an application, our team reviews it and reaches out to talk through the best fit for you.'
              },
              {
                q: 'How can my school partner with Desk Diary?',
                a: 'Schools can apply for partnership directly through our Partners page. We offer media clubs, leadership training, and storytelling programs designed around each school\'s needs. After you submit your school\'s information, we\'ll follow up to schedule an introductory conversation and outline next steps.'
              },
              {
                q: 'How can I donate to support Desk Diary?',
                a: 'You can donate through our Donate page using credit or debit cards, mobile money, or a direct bank transfer. Every contribution goes toward our educational programs — from media club equipment to student training and event coverage across Liberia\'s counties.'
              },
              {
                q: 'How can I submit a student story?',
                a: 'You can submit student stories through our Stories page. We welcome stories of achievements, challenges, creative work, and inspirational journeys from students across Liberia. Our editorial team reviews every submission and works with you to make sure the story is told the way you want it told.'
              },
            ]}
          />
        </div>
      </section>
    </div>
  )
}

// An open, readable accordion — full-width answers with generous line
// height instead of cramped small text in a fixed box.
const FaqAccordion = ({ items }) => {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index
        return (
          <div key={index} className="bg-gray-50 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className="w-full flex items-center justify-between text-left px-6 py-5"
            >
              <span className="font-semibold text-gray-800 text-lg pr-4">{item.q}</span>
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-primary flex-shrink-0">
                <ChevronDown size={22} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="text-gray-600 text-base leading-relaxed px-6 pb-6">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export default Contact
