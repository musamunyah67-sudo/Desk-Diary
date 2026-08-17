import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, ArrowLeft, Share2 } from 'lucide-react'
import { getStoryById } from '../services/supabaseService'
import AnimatedCard from '../components/AnimatedCard'

const StoryDetail = () => {
  const { id } = useParams()
  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStory()
  }, [id])

  const loadStory = async () => {
    setLoading(true)
    try {
      const data = await getStoryById(id)
      setStory(data)
    } catch (error) {
      console.error('Error loading story:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading story...</p>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Story not found</p>
          <Link to="/stories" className="text-primary hover:text-gold font-semibold">
            Back to Stories
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
          <Link to="/stories" className="inline-flex items-center text-gold hover:text-white mb-6">
            <ArrowLeft size={20} className="mr-2" />
            Back to Stories
          </Link>
          <h1 className="font-anton text-4xl md:text-5xl mb-4">{story.title}</h1>
          <div className="flex items-center space-x-4 text-gold">
            <Calendar size={18} />
            <span>{new Date(story.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span className="capitalize">{story.category} Story</span>
          </div>
        </div>
      </section>

      {/* Story Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {story.image_url && (
            <AnimatedCard className="mb-8">
              <img src={story.image_url} alt={story.title} className="w-full h-96 object-cover rounded-lg" loading="lazy" decoding="async" />
            </AnimatedCard>
          )}

          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {story.content}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t">
            <p className="text-gray-500 text-sm">
              By {story.author || 'Desk Diary'}
            </p>
          </div>

          <div className="mt-8 flex justify-between items-center">
            <Link to="/stories" className="text-primary hover:text-gold font-semibold">
              ← Back to Stories
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

export default StoryDetail
