import { useState, useEffect } from 'react'
import { BookOpen, Heart, Users, Sparkles, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getStories } from '../services/supabaseService'
import AnimatedCard from '../components/AnimatedCard'

const Stories = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedStory, setSelectedStory] = useState(null)

  const categories = [
    { id: 'all', name: 'All Stories', icon: BookOpen },
    { id: 'feature', name: 'Feature Stories', icon: Sparkles },
    { id: 'success', name: 'Success Stories', icon: Heart },
    { id: 'community', name: 'Community Stories', icon: Users },
    { id: 'inspirational', name: 'Inspirational Journeys', icon: Heart },
  ]

  useEffect(() => {
    loadStories()
  }, [activeCategory])

  const loadStories = async () => {
    setLoading(true)
    try {
      const category = activeCategory === 'all' ? null : activeCategory
      const data = await getStories(category)
      setStories(data)
    } catch (error) {
      console.error('Error loading stories:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStories = stories

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-anton text-5xl md:text-6xl mb-4">Student Stories</h1>
          <p className="text-xl text-gold">Where Every Student Story Matters</p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-gray-50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-primary text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <cat.icon size={16} />
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading stories...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredStories.map((story, index) => (
                  <AnimatedCard
                    key={story.id}
                    delay={index * 0.1}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300"
                  >
                    {story.image_url && (
                      <div className="h-48 relative">
                        <img src={story.image_url} alt={story.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      </div>
                    )}
                    <div className="p-6">
                      <span className="text-gold text-sm font-semibold capitalize">{story.category} Story</span>
                      <h3 className="font-anton text-xl mt-2 mb-3">{story.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{story.content.substring(0, 150)}...</p>
                      <button
                        onClick={() => setSelectedStory(story)}
                        className="text-primary hover:text-gold font-semibold text-sm"
                      >
                        Read More
                      </button>
                      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
                        <div>
                          <p className="font-semibold text-gray-700">{story.author || 'Desk Diary'}</p>
                          <p>{new Date(story.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </div>

              {filteredStories.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No stories found in this category.</p>
                  <Link to="/contact" className="inline-block mt-4 text-primary hover:text-gold">
                    Contact us to submit a story
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Submit Story CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-anton text-4xl text-primary mb-4">Share Your Story</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Every student has a story worth telling. Share your journey, achievements, or inspirational moments with the Desk Diary community.
          </p>
          <Link to="/contact" className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            Submit Your Story
          </Link>
        </div>
      </section>

      {/* Story Detail Modal */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedStory(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="font-anton text-2xl text-primary">{selectedStory.title}</h2>
                <button
                  onClick={() => setSelectedStory(null)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6">
                {selectedStory.image_url && (
                  <img src={selectedStory.image_url} alt={selectedStory.title} className="w-full h-64 object-cover rounded-lg mb-6" loading="lazy" decoding="async" />
                )}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                  <span className="text-gold font-semibold capitalize">{selectedStory.category} Story</span>
                  <span>•</span>
                  <span>By {selectedStory.author || 'Desk Diary'}</span>
                  <span>•</span>
                  <span>{new Date(selectedStory.created_at).toLocaleDateString()}</span>
                </div>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedStory.content}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Stories
