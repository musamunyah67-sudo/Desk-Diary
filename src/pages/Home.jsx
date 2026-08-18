import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Users, BookOpen, Calendar, Award, Target } from 'lucide-react'
import AnimatedIcon from '../components/AnimatedIcon'
import AnimatedCard from '../components/AnimatedCard'
import CountUp from '../components/CountUp'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getPlatformSettings,
  getStories,
  getEvents,
  getTestimonials,
  getPartners
} from '../services/supabaseService'

const HERO_IMAGES = ['/images/hero-1.jpg', '/images/hero-2.jpg', '/images/hero-3.jpg', '/images/hero-4.jpg', '/images/hero-5.jpg', '/images/hero-6.jpg']

const DEFAULT_STATS = { students_featured: '100+', schools_partnered: '10+', events_covered: '20+', counties_reached: '15' }

const Home = () => {
  const navigate = useNavigate()
  const [heroIndex, setHeroIndex] = useState(0)
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [stories, setStories] = useState([])
  const [events, setEvents] = useState([])
  const [testimonials, setTestimonials] = useState([])
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_IMAGES.length), 6000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const load = async () => {
      const [statsData, storiesData, eventsData, testimonialsData, partnersData] = await Promise.all([
        getPlatformSettings('statistics'),
        getStories(),
        getEvents('upcoming'),
        getTestimonials(),
        getPartners(),
      ])
      if (statsData && Object.keys(statsData).length) setStats(statsData)
      setStories((storiesData || []).slice(0, 3))
      setEvents((eventsData || []).slice(0, 2))
      setTestimonials((testimonialsData || []).slice(0, 3))
      setPartners((partnersData || []).slice(0, 4))
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      {/* Hero Section — front-page treatment: text column + rotating photo, like a masthead spread */}
      <section className="relative text-white overflow-hidden">
        {/* Full-bleed backdrop: graduation photo with a light gradient over it for text readability */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-bg-students.jpg"
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/55 to-primary/25" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-3"
            >
              <h1 className="font-anton text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-6">
                DESK<br />DIARY
              </h1>
              <p className="font-serif italic text-xl md:text-2xl text-white/85 mb-6 max-w-xl leading-snug">
                "Your desk. Your story. Your voice."
              </p>
              <p className="text-white/70 text-lg mb-9 max-w-xl leading-relaxed">
                Documenting, celebrating, and amplifying the voices, achievements, talents, and educational experiences of students.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/stories" className="bg-gold text-primary px-8 py-3.5 font-semibold hover:bg-white transition-colors inline-flex items-center justify-center">
                  Explore Stories <ArrowRight className="ml-2" size={20} />
                </Link>
                <Link to="/volunteer" className="border border-white/40 px-8 py-3.5 font-semibold hover:border-white hover:bg-white/5 transition-colors">
                  Get Involved
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="lg:col-span-2"
            >
              <div className="relative aspect-[4/5] overflow-hidden border border-white/10">
                <AnimatePresence mode="sync">
                  <motion.img
                    key={heroIndex}
                    src={HERO_IMAGES[heroIndex]}
                    alt="Desk Diary students in the field"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-end">
                  <div className="flex gap-1.5">
                    {HERO_IMAGES.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setHeroIndex(i)}
                        aria-label={`Show hero image ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all ${i === heroIndex ? 'w-6 bg-gold' : 'w-1.5 bg-white/50'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        <div className="h-10 bg-gradient-to-b from-primary to-white" />
      </section>

      {/* Mission Highlight */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="dateline text-primary mb-3">Our Mission</p>
            <AnimatedIcon icon={Target} size={40} className="text-primary mx-auto mb-3" haloClassName="bg-primary" variant="pulse" />
            <h2 className="font-anton text-4xl text-gray-900 mb-4">Why We Show Up</h2>
            <p className="font-serif text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              To empower students by documenting and sharing their stories, achievements, talents, and educational experiences through responsible journalism, digital media, leadership development, and storytelling.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics — admin editable via Settings */}
      <section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: stats.students_featured, label: 'Students Featured', variant: 'float' },
              { icon: BookOpen, value: stats.schools_partnered, label: 'Schools Partnered', variant: 'pulse' },
              { icon: Calendar, value: stats.events_covered, label: 'Events Covered', variant: 'wiggle' },
              { icon: Award, value: stats.counties_reached, label: 'Counties Reached', variant: 'spin' },
            ].map((s, i) => (
              <AnimatedCard key={s.label} delay={i * 0.1} className="text-center">
                <AnimatedIcon icon={s.icon} size={44} className="mx-auto text-primary" haloClassName="bg-primary" variant={s.variant} />
                <div className="font-anton text-4xl mb-2 mt-2 text-primary">
                  <CountUp end={parseInt(s.value.replace(/\D/g, '')) || 0} suffix={s.value.replace(/[\d]/g, '')} />
                </div>
                <p className="text-gray-600">{s.label}</p>
              </AnimatedCard>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Stories Preview — pulled from Supabase, managed by admins */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12 border-b border-gray-200 pb-4">
            <div>
              <p className="dateline text-primary mb-2">From the Desk</p>
              <h2 className="font-anton text-4xl text-gray-900">Latest Stories</h2>
            </div>
            <Link to="/stories" className="text-primary hover:text-gold font-semibold inline-flex items-center whitespace-nowrap">
              View All <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 w-full bg-gray-200" />
                  <div className="pt-4 space-y-3">
                    <div className="h-3 w-20 bg-gray-200" />
                    <div className="h-5 w-3/4 bg-gray-200" />
                    <div className="h-3 w-full bg-gray-200" />
                    <div className="h-3 w-2/3 bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : stories.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {stories.map((story, i) => (
                <AnimatedCard key={story.id} delay={i * 0.1} className="group bg-white border border-gray-200 overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <Link to={`/stories/${story.id}`}>
                    {story.image_url ? (
                      <img src={story.image_url} alt={story.title} className="h-48 w-full object-cover grayscale-[15%] group-hover:grayscale-0 transition-all duration-300" loading="lazy" decoding="async" />
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-primary to-blue-700"></div>
                    )}
                    <div className="p-6">
                      <p className="dateline text-gold mb-2">{story.category} Story</p>
                      <h3 className="font-anton text-xl mb-3 text-gray-900">{story.title}</h3>
                      <p className="font-serif text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">{story.content}</p>
                      <span className="text-primary group-hover:text-gold font-semibold text-sm inline-flex items-center transition-colors">
                        Read More <ArrowRight className="ml-1" size={16} />
                      </span>
                    </div>
                  </Link>
                </AnimatedCard>
              ))}
            </div>
          ) : (
            <EmptyRedirect
              message="No stories have been published yet."
              linkTo="/volunteer"
              linkLabel="Become a volunteer and help us tell the first ones"
            />
          )}
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="font-anton text-4xl text-primary">Upcoming Events</h2>
            <Link to="/events" className="text-primary hover:text-gold font-semibold inline-flex items-center">
              View All <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading events...</p>
          ) : events.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-8">
              {events.map((event, i) => {
                const d = event.date ? new Date(event.date) : null
                return (
                  <AnimatedCard key={event.id} delay={i * 0.1} className="bg-gray-50 rounded-lg p-6 border-l-4 border-primary/30 cursor-pointer">
                    <Link to={`/events/${event.id}`}>
                      <div className="flex items-start space-x-4">
                        <div className="bg-primary text-white p-4 rounded-lg text-center min-w-[80px]">
                          <div className="font-anton text-2xl">{d ? d.getDate() : '--'}</div>
                          <div className="text-sm">{d ? d.toLocaleString('default', { month: 'short' }).toUpperCase() : ''}</div>
                        </div>
                        <div>
                          <h3 className="font-anton text-xl mb-2">{event.title}</h3>
                          <p className="text-gray-600 text-sm mb-2">{event.description}</p>
                          <p className="text-gray-500 text-sm">{event.location}</p>
                        </div>
                      </div>
                    </Link>
                  </AnimatedCard>
                )
              })}
            </div>
          ) : (
            <EmptyRedirect
              message="No upcoming events right now."
              linkTo="/programs"
              linkLabel="See what our programs are up to"
            />
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-anton text-4xl mb-4">Join Our Mission</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Be part of Liberia's leading student storytelling platform. Support, volunteer, or partner with us to amplify student voices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/volunteer" className="bg-gold text-primary px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors">
              Become a Volunteer
            </Link>
            <Link to="/donate" className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors">
              Support Our Work
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials — admin managed */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-anton text-4xl text-primary text-center mb-12">What People Say</h2>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading testimonials...</p>
          ) : testimonials.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="bg-white rounded-lg p-6 shadow-md hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-center mb-4">
                    {t.image_url ? (
                      <img src={t.image_url} alt={t.name} className="w-12 h-12 rounded-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-anton text-xl">
                        {t.name?.[0] || '?'}
                      </div>
                    )}
                    <div className="ml-4">
                      <h4 className="font-semibold">{t.name}</h4>
                      <p className="text-gray-500 text-sm">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">"{t.quote}"</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyRedirect
              message="No testimonials yet."
              linkTo="/stories"
              linkLabel="Read our student stories instead"
            />
          )}
        </div>
      </section>

      {/* Partners Preview — admin managed */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-anton text-4xl text-primary text-center mb-12">Our Partners</h2>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading partners...</p>
          ) : partners.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {partners.map((p, i) => (
                  <AnimatedCard
                    key={p.id}
                    delay={i * 0.1}
                    className="bg-gray-50 rounded-lg overflow-hidden h-32 text-center hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => navigate('/partners', { state: { openPartnerId: p.id } })}
                  >
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center px-3">
                        <span className="font-anton text-lg text-gray-500">{p.name}</span>
                      </div>
                    )}
                  </AnimatedCard>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link to="/partners" className="text-primary hover:text-gold font-semibold inline-flex items-center">
                  View All Partners <ArrowRight className="ml-2" size={20} />
                </Link>
              </div>
            </>
          ) : (
            <EmptyRedirect
              message="No partners listed yet."
              linkTo="/partnerships"
              linkLabel="Learn how to become a partner"
            />
          )}
        </div>
      </section>
    </div>
  )
}

// Used across empty sections so browsing never dead-ends on a blank block
const EmptyRedirect = ({ message, linkTo, linkLabel }) => (
  <div className="text-center py-12 bg-gray-50 rounded-lg">
    <p className="text-gray-500 text-lg mb-3">{message}</p>
    <Link to={linkTo} className="text-primary hover:text-gold font-semibold inline-flex items-center">
      {linkLabel} <ArrowRight className="ml-2" size={18} />
    </Link>
  </div>
)

export default Home
