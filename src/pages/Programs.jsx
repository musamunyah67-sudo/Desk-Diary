import { useState, useEffect } from 'react'
import { Users, Award, Wrench, Heart, HandHeart, GraduationCap, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getPrograms, getPlatformSettings } from '../services/supabaseService'
import AnimatedIcon from '../components/AnimatedIcon'
import AnimatedStat from '../components/AnimatedStat'

const ICONS = { Users, Award, Wrench, Heart, HandHeart, GraduationCap }

const DEFAULT_IMPACTS = { media_clubs: '3+', students_trained: '20+', workshops_conducted: '4+', mentors_engaged: '10+' }

const Programs = () => {
  const [programs, setPrograms] = useState([])
  const [impacts, setImpacts] = useState(DEFAULT_IMPACTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [programsData, impactsData] = await Promise.all([
        getPrograms(),
        getPlatformSettings('program_impacts'),
      ])
      setPrograms(programsData || [])
      if (impactsData && Object.keys(impactsData).length) setImpacts(impactsData)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-blue-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-gold rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-anton text-5xl md:text-6xl mb-4"
          >
            Our Programs
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gold"
          >
            Empowering Students Through Education and Media
          </motion.p>
        </div>
      </section>

      {/* Programs Grid — admin managed */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <p className="text-center text-gray-500 py-8">Loading programs...</p>
          ) : programs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {programs.map((program, index) => {
                const Icon = ICONS[program.icon] || Sparkles
                const color = program.color || 'from-primary to-blue-600'
                return (
                  <motion.div
                    key={program.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100"
                  >
                    <div className={`h-52 bg-gradient-to-br ${color} flex items-center justify-center relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-black opacity-10"></div>
                      <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
                        <Icon className="text-white w-24 h-24 relative z-10" />
                      </motion.div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-anton text-2xl mb-3 text-primary">{program.title}</h3>
                      <p className="text-gray-600 mb-4 text-sm leading-relaxed">{program.description}</p>

                      {program.stats && Object.keys(program.stats).length > 0 && (
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {Object.entries(program.stats).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 rounded-lg p-3 text-center">
                              <div className="font-anton text-xl text-primary">{value}</div>
                              <div className="text-xs text-gray-500 capitalize">{key.replace(/_/g, ' ')}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {program.features && program.features.length > 0 && (
                        <ul className="space-y-2 mb-4">
                          {program.features.map((feature, i) => (
                            <li key={i} className="flex items-center space-x-2 text-sm text-gray-700">
                              <div className="w-2 h-2 bg-gradient-to-r from-primary to-gold rounded-full"></div>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      <Link
                        to="/volunteer"
                        className="flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300"
                      >
                        <span>Learn More</span>
                        <ArrowRight size={18} />
                      </Link>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <p className="text-gray-500 text-lg mb-3">No programs published yet.</p>
              <Link to="/about" className="text-primary hover:text-gold font-semibold inline-flex items-center">
                Learn about our mission instead <ArrowRight className="ml-2" size={18} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Program Impact — admin editable via Settings */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-anton text-4xl text-primary text-center mb-12">Program Impact</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <AnimatedIcon icon={Users} size={40} className="text-primary mx-auto" haloClassName="bg-primary" variant="float" />
              <div className="font-anton text-5xl text-primary mb-2 mt-2"><AnimatedStat value={impacts.media_clubs} /></div>
              <p className="text-gray-600">Media Clubs Established</p>
            </div>
            <div className="text-center">
              <AnimatedIcon icon={GraduationCap} size={40} className="text-gold mx-auto" haloClassName="bg-gold" variant="pulse" />
              <div className="font-anton text-5xl text-gold mb-2 mt-2"><AnimatedStat value={impacts.students_trained} /></div>
              <p className="text-gray-600">Students Trained</p>
            </div>
            <div className="text-center">
              <AnimatedIcon icon={Wrench} size={40} className="text-primary mx-auto" haloClassName="bg-primary" variant="wiggle" />
              <div className="font-anton text-5xl text-primary mb-2 mt-2"><AnimatedStat value={impacts.workshops_conducted} /></div>
              <p className="text-gray-600">Workshops Conducted</p>
            </div>
            <div className="text-center">
              <AnimatedIcon icon={HandHeart} size={40} className="text-gold mx-auto" haloClassName="bg-gold" variant="spin" />
              <div className="font-anton text-5xl text-gold mb-2 mt-2"><AnimatedStat value={impacts.mentors_engaged} /></div>
              <p className="text-gray-600">Mentors Engaged</p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Involved CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-anton text-4xl mb-4">Get Involved</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our programs as a participant, mentor, or volunteer. Together, we can empower the next generation of leaders.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/volunteer" className="bg-gold text-primary px-8 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors text-center">
              Join a Program
            </Link>
            <Link to="/volunteer" className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors text-center">
              Become a Mentor
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Programs
