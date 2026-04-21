import { useState, useEffect } from 'react'
import api from '../lib/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { format } from 'date-fns'

export default function DrawPage() {
  const [draws, setDraws] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/draws').then(r => setDraws(r.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />

      <section className="bg-brand-dark text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">Monthly Draws</h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Every month, 5 winning numbers are drawn. Match 3, 4 or all 5 of your scores to win.
          </p>
        </div>
      </section>

      {/* How draws work */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {[
            { match: '5-Number Match', prize: '40% of pool', tag: 'Jackpot', note: 'Rolls over if unclaimed', bg: 'bg-brand-gold/10 border-brand-gold/30' },
            { match: '4-Number Match', prize: '35% of pool', tag: 'Second Prize', note: 'Split among winners', bg: 'bg-brand-green/10 border-brand-green/30' },
            { match: '3-Number Match', prize: '25% of pool', tag: 'Third Prize', note: 'Split among winners', bg: 'bg-gray-50 border-gray-200' },
          ].map(({ match, prize, tag, note, bg }) => (
            <div key={match} className={`border rounded-2xl p-5 ${bg}`}>
              <div className="text-xs font-medium text-brand-gold uppercase tracking-wider mb-2">{tag}</div>
              <div className="font-display font-bold text-xl text-brand-dark mb-1">{prize}</div>
              <div className="text-sm text-gray-600">{match}</div>
              <div className="text-xs text-gray-400 mt-1">{note}</div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-display font-bold text-brand-dark mb-6">Draw History</h2>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-brand-green border-t-transparent rounded-full" />
          </div>
        ) : draws.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-4xl mb-3">🎲</div>
            <p className="text-gray-500">No draws published yet. First draw coming soon!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {draws.map((draw, i) => (
              <div key={draw.id} className="card">
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-brand-dark">{draw.month_year}</h3>
                      {i === 0 && <span className="badge-active">Latest</span>}
                    </div>
                    <p className="text-xs text-gray-400">
                      {draw.subscriber_count} participants · Published {draw.published_at ? format(new Date(draw.published_at), 'dd MMM yyyy') : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(draw.draw_numbers || []).map((n, j) => (
                      <div key={j} className="w-10 h-10 rounded-full bg-brand-green text-white text-sm font-bold flex items-center justify-center">
                        {n}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="text-brand-gold font-bold text-sm">₹{draw.jackpot_pool?.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Jackpot</div>
                  </div>
                  <div>
                    <div className="text-brand-green font-bold text-sm">₹{draw.match4_pool?.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">4-Match</div>
                  </div>
                  <div>
                    <div className="text-gray-600 font-bold text-sm">₹{draw.match3_pool?.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">3-Match</div>
                  </div>
                </div>
                {draw.jackpot_rollover > 0 && (
                  <div className="mt-3 text-xs text-brand-gold bg-brand-gold/10 rounded-lg px-3 py-1.5">
                    ↗ Jackpot rolled over to next month: ₹{draw.jackpot_rollover?.toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
