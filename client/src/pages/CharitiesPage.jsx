import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function CharitiesPage() {
  const [charities, setCharities] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      api.get(`/charities${search ? `?search=${encodeURIComponent(search)}` : ''}`)
        .then(r => setCharities(r.data))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />

      {/* Header */}
      <section className="bg-brand-dark text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">Charities We Support</h1>
          <p className="text-gray-300 max-w-xl mx-auto mb-8">
            Every GolfHero subscription contributes to a cause you care about. Choose yours.
          </p>
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search charities…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-brand-gold"
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin h-8 w-8 border-4 border-brand-green border-t-transparent rounded-full" />
          </div>
        ) : charities.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-4xl mb-3">🔍</div>
            <p>No charities found{search ? ` for "${search}"` : ''}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {charities.map(charity => (
              <Link to={`/charities/${charity.id}`} key={charity.id}
                className="card hover:shadow-md hover:-translate-y-1 transition-all group">
                {charity.image_url ? (
                  <img src={charity.image_url} alt={charity.name} className="w-full h-44 object-cover rounded-xl mb-4" />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-brand-green/20 to-brand-light/10 rounded-xl mb-4 flex items-center justify-center text-4xl">
                    ❤️
                  </div>
                )}
                {charity.featured && (
                  <span className="inline-block bg-brand-gold/20 text-brand-gold text-xs font-medium px-3 py-0.5 rounded-full mb-2">
                    Featured
                  </span>
                )}
                <h3 className="font-display font-semibold text-brand-dark group-hover:text-brand-green transition-colors mb-2">
                  {charity.name}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed">{charity.description}</p>
                <div className="mt-4 text-brand-green text-sm font-medium group-hover:underline">Learn more →</div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
