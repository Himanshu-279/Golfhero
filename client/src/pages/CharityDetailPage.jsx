import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'

export default function CharityDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const [charity, setCharity] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/charities/${id}`),
      api.get(`/charities/${id}/stats`)
    ]).then(([c, s]) => {
      setCharity(c.data)
      setStats(s.data)
    }).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="flex justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-brand-green border-t-transparent rounded-full" />
      </div>
    </div>
  )

  if (!charity) return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="text-center py-20">
        <p className="text-gray-500">Charity not found</p>
        <Link to="/charities" className="text-brand-green mt-4 inline-block">← Back to charities</Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link to="/charities" className="text-sm text-gray-400 hover:text-brand-green mb-6 inline-block">← All Charities</Link>

        {charity.image_url && (
          <img src={charity.image_url} alt={charity.name} className="w-full h-64 md:h-80 object-cover rounded-2xl mb-8" />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            {charity.featured && (
              <span className="inline-block bg-brand-gold/20 text-brand-gold text-xs font-medium px-3 py-1 rounded-full mb-3">Featured Charity</span>
            )}
            <h1 className="text-3xl font-display font-bold text-brand-dark mb-4">{charity.name}</h1>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{charity.description}</p>

            {charity.website && (
              <a href={charity.website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-brand-green text-sm font-medium hover:underline">
                Visit website →
              </a>
            )}

            {charity.upcoming_events && (
              <div className="mt-8">
                <h3 className="font-display font-semibold text-brand-dark mb-3">Upcoming Events</h3>
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-gray-600 whitespace-pre-wrap">
                  {charity.upcoming_events}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {stats && (
              <div className="card text-center">
                <div className="text-2xl font-display font-bold text-brand-green mb-1">₹{stats.total?.toLocaleString()}</div>
                <div className="text-xs text-gray-400">Total raised via GolfHero</div>
                <div className="text-sm text-gray-500 mt-2">{stats.donors} contributors</div>
              </div>
            )}

            <div className="card">
              <p className="text-sm font-medium text-brand-dark mb-3">Support this charity</p>
              <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                Subscribe to GolfHero and select this charity. At least 10% of every payment goes directly to them.
              </p>
              {user ? (
                user.subscription_status === 'active' ? (
                  <Link to="/dashboard" className="btn-primary text-sm py-2 px-4 w-full text-center block">
                    Update charity preference
                  </Link>
                ) : (
                  <Link to="/subscribe" className="btn-primary text-sm py-2 px-4 w-full text-center block">
                    Subscribe to support
                  </Link>
                )
              ) : (
                <Link to={`/register?charity=${id}`} className="btn-primary text-sm py-2 px-4 w-full text-center block">
                  Join and support
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
