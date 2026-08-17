import { Target, Eye, Heart, Users, Award, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import AnimatedIcon from '../components/AnimatedIcon'

const About = () => {
  const coreValues = [
    { name: 'Integrity', icon: Shield },
    { name: 'Professionalism', icon: Award },
    { name: 'Excellence', icon: Target },
    { name: 'Innovation', icon: Eye },
    { name: 'Inclusion', icon: Users },
    { name: 'Collaboration', icon: Users },
    { name: 'Accountability', icon: Shield },
    { name: 'Creativity', icon: Heart },
    { name: 'Leadership', icon: Award },
    { name: 'Respect', icon: Heart },
    { name: 'Service', icon: Heart },
    { name: 'Transparency', icon: Shield },
  ]

  const objectives = [
    'Document authentic student stories across Liberia',
    'Promote academic excellence and leadership',
    'Celebrate student achievements',
    'Showcase creativity, innovation, and talent',
    'Build media clubs in schools',
    'Train young people in journalism and media literacy',
    'Strengthen relationships between schools and communities',
    'Preserve educational history through multimedia storytelling',
    'Inspire students through positive role models',
    'Promote responsible digital citizenship',
  ]

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-anton text-5xl md:text-6xl mb-4">About Us</h1>
          <p className="text-xl text-gold">Where Every Student Story Matters</p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-anton text-4xl text-primary mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">
              Desk Diary (DeD) is a registered non-profit media and storytelling organization dedicated to documenting, celebrating, and amplifying the voices, achievements, talents, and experiences of students across Liberia.
            </p>
            <p className="text-gray-600 mb-4">
              Founded by William W. Flomo, Desk Diary was established to bridge the visibility gap affecting students and educational institutions by creating a professional platform where student stories are seen, heard, recognized, and shared with the world.
            </p>
            <p className="text-gray-600">
              Through journalism, photography, videography, digital storytelling, leadership development, and media education, Desk Diary empowers students while promoting creativity, academic excellence, responsible journalism, and community engagement.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-shadow overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-blue-400"></div>
              <AnimatedIcon icon={Target} size={44} className="text-primary" haloClassName="bg-primary" variant="pulse" />
              <h2 className="font-anton text-3xl text-primary mb-4 mt-3">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To empower students by documenting and sharing their stories, achievements, talents, and educational experiences through responsible journalism, digital media, leadership development, and storytelling while strengthening partnerships between schools and communities.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative bg-white p-8 rounded-2xl shadow-md hover:shadow-2xl transition-shadow overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gold to-yellow-300"></div>
              <AnimatedIcon icon={Eye} size={44} className="text-gold" haloClassName="bg-gold" variant="float" />
              <h2 className="font-anton text-3xl text-gold mb-4 mt-3">Our Vision</h2>
              <p className="text-gray-600 leading-relaxed">
                To become Liberia's leading student storytelling and educational media platform, inspiring generations by documenting every student's journey and creating opportunities for young people to be seen, heard, recognized, and celebrated.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-anton text-4xl text-primary text-center mb-12">Core Values</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => {
              const variants = ['float', 'pulse', 'wiggle', 'spin']
              const variant = variants[index % variants.length]
              const color = index % 2 === 0 ? 'text-primary' : 'text-gold'
              const halo = index % 2 === 0 ? 'bg-primary' : 'bg-gold'
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -6, scale: 1.05 }}
                  className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-lg transition-shadow"
                >
                  <AnimatedIcon icon={value.icon} size={32} className={`mx-auto ${color}`} haloClassName={halo} variant={variant} />
                  <h3 className="font-semibold text-gray-800 mt-2">{value.name}</h3>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Organizational Objectives */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-anton text-4xl text-primary text-center mb-12">Our Objectives</h2>
          <div className="max-w-3xl mx-auto">
            <ul className="space-y-4">
              {objectives.map((objective, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start space-x-3"
                >
                  <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-600">{objective}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-anton text-4xl text-primary text-center mb-12">Leadership</h2>
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gray-50 p-8 rounded-lg">
              <img
                src="/images/founder.jpg"
                alt="William W. Flomo"
                className="w-40 h-40 rounded-full mx-auto mb-4 object-cover object-top ring-4 ring-gold/40" loading="lazy" decoding="async" />
              <h3 className="font-anton text-2xl text-primary mb-2">William W. Flomo</h3>
              <p className="text-gold font-semibold mb-4">Founder & Executive Director</p>
              <p className="text-gray-600">
                William W. Flomo founded Desk Diary with a vision to amplify student voices across Liberia and create a platform where every student's story matters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Governance */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-anton text-4xl text-primary text-center mb-12">Governance</h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-gray-600 mb-6">
              Desk Diary operates under a structured governance framework that ensures transparency, accountability, and adherence to our mission and values.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <Shield className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Board of Directors</h3>
                <p className="text-gray-600 text-sm">Strategic oversight and guidance</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -6 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <Award className="h-8 w-8 text-primary mx-auto mb-4" />
                <h3 className="font-semibold mb-2">The Core Team</h3>
                <img src="/images/core-team.jpg" alt="The Core Team" className="w-full rounded-lg shadow-md mt-4 mb-3" loading="lazy" decoding="async" />
                <p className="text-gray-600 text-sm">Daily operations and execution</p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About
