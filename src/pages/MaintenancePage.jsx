import { useEffect } from 'react'

const MaintenancePage = ({ message }) => {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Desk Diary | Maintenance & Upgrade'

    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)

    return () => {
      document.title = previousTitle
      document.head.removeChild(meta)
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-xl w-full text-center">
        <div className="inline-flex items-center space-x-2 bg-gold/20 text-primary px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide mb-8">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          <span>Maintenance in Progress</span>
        </div>

        <h1 className="font-anton text-3xl md:text-4xl text-primary mb-4">
          🔧 We're Making Desk Diary Better
        </h1>

        <p className="text-gray-600 leading-relaxed mb-6">
          Desk Diary is temporarily offline while we carry out an important platform
          upgrade and maintenance operation. We're improving our infrastructure,
          refining existing features, strengthening security, fixing and optimizing
          existing systems, and introducing new capabilities to deliver a more
          seamless experience for our community.
        </p>

        <p className="font-anton text-lg text-primary mb-6">
          "The desk is being upgraded. The stories are still being written."
        </p>

        {message && (
          <p className="text-sm text-gray-500 italic mb-6 border-t border-gray-200 pt-4">
            {message}
          </p>
        )}

        <p className="text-gray-600 mb-1">We'll be back online soon.</p>
        <p className="text-gray-500 text-sm mb-8">— Desk Diary Team</p>

        <p className="font-anton text-primary text-sm tracking-wide">
          Your Desk. Your Story. Your Voice.
        </p>
      </div>
    </div>
  )
}

export default MaintenancePage
