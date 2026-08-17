import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, ArrowLeft, Share2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { getNews } from '../services/supabaseService'
import AnimatedCard from '../components/AnimatedCard'

const NewsDetail = () => {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadArticle()
  }, [id])

  const loadArticle = async () => {
    try {
      const articles = await getNews()
      const found = articles.find(a => a.id === id)
      setArticle(found)
    } catch (error) {
      console.error('Error loading article:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading article...</p>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Article not found</p>
          <Link to="/news" className="text-primary hover:text-gold font-semibold">
            Back to News
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/news" className="inline-flex items-center text-gold hover:text-white mb-6">
            <ArrowLeft size={20} className="mr-2" />
            Back to News
          </Link>
          <h1 className="font-anton text-4xl md:text-5xl mb-4">{article.title}</h1>
          <div className="flex items-center space-x-4 text-gold">
            <Calendar size={18} />
            <span>{new Date(article.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span className="capitalize">{article.category.replace('_', ' ')}</span>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {article.image_url && (
            <AnimatedCard className="mb-8">
              <img src={article.image_url} alt={article.title} className="w-full h-96 object-cover rounded-lg" loading="lazy" decoding="async" />
            </AnimatedCard>
          )}

          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {article.content}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t">
            <p className="text-gray-500 text-sm">
              By {article.author || 'Desk Diary'}
            </p>
          </div>

          <div className="mt-8 flex justify-between items-center">
            <Link to="/news" className="text-primary hover:text-gold font-semibold">
              ← Back to News
            </Link>
            <button className="flex items-center space-x-2 text-gray-600 hover:text-primary">
              <Share2 size={20} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default NewsDetail
