import { useState, useEffect } from 'react'
import { Camera, Video, Users, GraduationCap, Briefcase, X, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import { getGallery } from '../services/supabaseService'
import AnimatedCard from '../components/AnimatedCard'

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [mediaItems, setMediaItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightboxItem, setLightboxItem] = useState(null)

  const categories = [
    { id: 'all', name: 'All Media', icon: Camera },
    { id: 'interviews', name: 'Interviews', icon: Video },
    { id: 'students', name: 'Students', icon: Users },
    { id: 'teachers', name: 'Teachers', icon: GraduationCap },
    { id: 'principals', name: 'Principals', icon: Briefcase },
  ]

  useEffect(() => {
    loadGallery()
  }, [activeCategory])

  const loadGallery = async () => {
    setLoading(true)
    try {
      const category = activeCategory === 'all' ? null : activeCategory
      const data = await getGallery(category)
      setMediaItems(data)
    } catch (error) {
      console.error('Error loading gallery:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMedia = mediaItems

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-anton text-5xl md:text-6xl mb-4">Gallery</h1>
          <p className="text-xl text-gold">Photos, Videos, and Media Library</p>
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

      {/* Media Grid */}
      <section id="gallery-grid" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading gallery...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredMedia.map((item, index) => (
                  <AnimatedCard
                    key={item.id}
                    delay={index * 0.1}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => setLightboxItem(item)}
                  >
                    <div className="h-48 relative bg-gray-900">
                      {item.media_type === 'video' ? (
                        <>
                          <video src={item.media_url} className="w-full h-full object-cover" muted preload="metadata" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                              <Play className="text-primary ml-1" size={24} fill="currentColor" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <img src={item.media_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                      )}
                    </div>
                    <div className="p-4">
                      <span className="text-gold text-xs font-semibold capitalize">{item.category}</span>
                      <h3 className="font-anton text-lg mt-1 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{item.description}</p>
                    </div>
                  </AnimatedCard>
                ))}
              </div>

              {filteredMedia.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Camera className="mx-auto text-primary mb-4" size={48} />
                  <p className="text-gray-600 text-lg mb-2">We're still curating this category.</p>
                  <p className="text-gray-500 mb-4">Take a look at everything we've got so far.</p>
                  <button
                    onClick={() => setActiveCategory('all')}
                    className="text-primary hover:text-gold font-semibold inline-flex items-center"
                  >
                    View all media →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Media Library CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-anton text-4xl text-primary mb-4">Access Our Media Library</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Explore our extensive collection of photos, videos, and interviews documenting student stories across Liberia.
          </p>
          <button
            onClick={() => {
              setActiveCategory('all')
              document.getElementById('gallery-grid')?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Browse Full Library
          </button>
        </div>
      </section>

      {/* Lightbox: full image view or playable video */}
      {lightboxItem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxItem(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-black">
              <button
                onClick={() => setLightboxItem(null)}
                className="absolute top-3 right-3 z-10 text-white bg-black/50 rounded-full p-1.5 hover:bg-black/70"
              >
                <X size={20} />
              </button>
              {lightboxItem.media_type === 'video' ? (
                <video src={lightboxItem.media_url} controls autoPlay className="w-full max-h-[70vh]" />
              ) : (
                <img src={lightboxItem.media_url} alt={lightboxItem.title} className="w-full max-h-[70vh] object-contain" loading="lazy" decoding="async" />
              )}
            </div>
            <div className="p-6">
              <span className="text-gold text-xs font-semibold capitalize">{lightboxItem.category}</span>
              <h3 className="font-anton text-2xl mt-1 mb-2">{lightboxItem.title}</h3>
              <p className="text-gray-600">{lightboxItem.description}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Gallery
