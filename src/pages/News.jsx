import { useState, useEffect } from 'react'
import { Newspaper, Calendar, School, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getNews, subscribeToNewsletter } from '../services/supabaseService'
import toast from 'react-hot-toast'
import AnimatedCard from '../components/AnimatedCard'

const News = () => {
  const [activeCategory, setActiveCategory] = useState('all')
  const [newsItems, setNewsItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)

  const categories = [
    { id: 'all', name: 'All News', icon: Newspaper },
    { id: 'educational', name: 'Educational News', icon: BookOpen },
    { id: 'school_updates', name: 'School Updates', icon: School },
    { id: 'blog', name: 'Blog', icon: Newspaper },
  ]

  useEffect(() => {
    loadNews()
  }, [activeCategory])

  const loadNews = async () => {
    setLoading(true)
    try {
      const category = activeCategory === 'all' ? null : activeCategory
      const data = await getNews(category)
      setNewsItems(data)
    } catch (error) {
      console.error('Error loading news:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNews = newsItems

  const handleSubscribe = async (e) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setSubscribing(true)
    try {
      await subscribeToNewsletter(email)
      toast.success('Successfully subscribed to newsletter!')
      setEmail('')
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.')
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-anton text-5xl md:text-6xl mb-4">News & Articles</h1>
          <p className="text-xl text-gold">Stay Updated with Educational News and Insights</p>
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

      {/* News Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading news...</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredNews.map((item, index) => (
                  <AnimatedCard key={item.id} delay={index * 0.1} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer">
                    <Link to={`/news/${item.id}`}>
                      {item.image_url && (
                        <div className="h-48 relative">
                          <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center space-x-2 mb-3">
                          <Calendar size={14} className="text-gray-500" />
                        <span className="text-gray-500 text-sm">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                      <span className="text-gold text-sm font-semibold capitalize">{item.category.replace('_', ' ')}</span>
                      <h3 className="font-anton text-xl mt-2 mb-3">{item.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{item.content.substring(0, 150)}...</p>
                      <p className="text-sm text-gray-500">By {item.author || 'Desk Diary'}</p>
                    </div>
                    </Link>
                  </AnimatedCard>
                ))}
              </div>

              {filteredNews.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No articles found in this category.</p>
                  <Link to="/contact" className="inline-block mt-4 text-primary hover:text-gold">
                    Contact us to submit news
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-anton text-4xl text-primary mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get the latest educational news, school updates, and inspiring stories delivered directly to your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <button 
              type="submit"
              disabled={subscribing}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {subscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default News
