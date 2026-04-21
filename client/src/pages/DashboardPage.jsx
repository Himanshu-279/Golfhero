import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import ScoreForm from '../components/ScoreForm'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

function ScoreCard({ score, onEdit, onDelete }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green font-bold flex items-center justify-center text-sm">
          {score.score}
        </div>
        <span className="text-sm text-gray-500">{format(new Date(score.score_date), 'dd MMM yyyy')}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onEdit(score)} className="text-xs text-brand-green hover:underline">Edit</button>
        <button onClick={() => onDelete(score.id)} className="text-xs text-red-400 hover:underline">Delete</button>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, refreshUser } = useAuth()
  const [searchParams] = useSearchParams()
  const [scores, setScores] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [winnings, setWinnings] = useState([])
  const [latestDraw, setLatestDraw] = useState(null)
  const [editScore, setEditScore] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [charityInfo, setCharityInfo] = useState(null)

  useEffect(() => {
    if (searchParams.get('subscribed') === 'true') {
      toast.success('Subscription active! Welcome to GolfHero.')
      refreshUser()
    }
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [scoresRes, subRes] = await Promise.all([
        api.get('/scores'),
        api.get('/subscriptions/status')
      ])
      setScores(scoresRes.data)
      setSubscription(subRes.data)
    } catch {}

    try {
      const drawRes = await api.get('/draws/latest')
      setLatestDraw(drawRes.data)
    } catch {}

    if (user?.charity_id) {
      try {
        const charRes = await api.get(`/charities/${user.charity_id}`)
        setCharityInfo(charRes.data)
      } catch {}
    }
  }

  const handleDeleteScore = async (id) => {
    if (!confirm('Delete this score?')) return
    await api.delete(`/scores/${id}`)
    toast.success('Score deleted')
    loadData()
  }

  const isActive = user?.subscription_status === 'active'

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-display font-bold text-brand-dark">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here's your GolfHero overview</p>
        </div>

        {/* Subscription banner if not active */}
        {!isActive && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 mb-6 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-medium text-yellow-800">No active subscription</p>
              <p className="text-sm text-yellow-700">Subscribe to enter scores and participate in draws.</p>
            </div>
            <Link to="/subscribe" className="btn-primary text-sm py-2 px-5 bg-yellow-500 hover:bg-yellow-600">Subscribe Now</Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {/* Subscription status */}
          <div className="card">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">Subscription</div>
            <div className="flex items-center gap-2 mb-1">
              <span className={isActive ? 'badge-active' : 'badge-inactive'}>
                {isActive ? 'Active' : 'Inactive'}
              </span>
              {subscription?.plan && <span className="text-xs text-gray-400 capitalize">{subscription.plan}</span>}
            </div>
            {subscription?.current_period_end && (
              <p className="text-xs text-gray-400 mt-2">
                Renews {format(new Date(subscription.current_period_end), 'dd MMM yyyy')}
              </p>
            )}
            {isActive && (
              <button onClick={async () => {
                if (!confirm('Cancel subscription at period end?')) return
                try {
                  await api.post('/subscriptions/cancel')
                  toast.success('Subscription cancelled successfully')
                  // Refresh subscription status
                  setTimeout(() => window.location.reload(), 1000)
                } catch (err) {
                  toast.error(err.response?.data?.error || 'Failed to cancel subscription')
                }
              }} className="text-xs text-red-400 mt-3 hover:underline">Cancel subscription</button>
            )}
          </div>

          {/* Charity */}
          <div className="card">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">Your Charity</div>
            {charityInfo ? (
              <>
                <p className="font-display font-semibold text-brand-dark">{charityInfo.name}</p>
                <p className="text-xs text-gray-400 mt-1">{user?.charity_percentage}% of your subscription</p>
                <Link to={`/charities/${charityInfo.id}`} className="text-xs text-brand-green mt-2 inline-block hover:underline">View charity →</Link>
              </>
            ) : (
              <div>
                <p className="text-sm text-gray-400">No charity selected</p>
                <Link to="/charities" className="text-xs text-brand-green mt-2 inline-block hover:underline">Browse charities →</Link>
              </div>
            )}
          </div>

          {/* Latest draw */}
          <div className="card">
            <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">Latest Draw</div>
            {latestDraw ? (
              <>
                <p className="text-sm font-medium text-brand-dark mb-2">{latestDraw.month_year}</p>
                <div className="flex gap-2 flex-wrap">
                  {(latestDraw.draw_numbers || []).map((n, i) => (
                    <span key={i} className="w-8 h-8 rounded-full bg-brand-green text-white text-xs font-bold flex items-center justify-center">
                      {n}
                    </span>
                  ))}
                </div>
                <Link to="/draws" className="text-xs text-brand-green mt-3 inline-block hover:underline">View all draws →</Link>
              </>
            ) : (
              <p className="text-sm text-gray-400">No draws yet</p>
            )}
          </div>
        </div>

        {/* Scores section */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-semibold text-lg text-brand-dark">My Scores</h2>
              <p className="text-xs text-gray-400 mt-0.5">Your last 5 Stableford scores · Oldest auto-removed when you add a 6th</p>
            </div>
            {isActive && (
              <button onClick={() => { setShowForm(f => !f); setEditScore(null) }}
                className="btn-primary text-xs py-2 px-4">
                {showForm ? 'Cancel' : '+ Add Score'}
              </button>
            )}
          </div>

          {showForm && !editScore && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <ScoreForm onSuccess={() => { setShowForm(false); loadData() }} onCancel={() => setShowForm(false)} />
            </div>
          )}

          {editScore && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <ScoreForm editScore={editScore} onSuccess={() => { setEditScore(null); loadData() }} onCancel={() => setEditScore(null)} />
            </div>
          )}

          {scores.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-4xl mb-3">⛳</div>
              <p className="text-sm">{isActive ? 'Add your first score to participate in draws' : 'Subscribe to start entering scores'}</p>
            </div>
          ) : (
            <div>
              {scores.map(s => (
                <ScoreCard key={s.id} score={s} onEdit={setEditScore} onDelete={handleDeleteScore} />
              ))}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  {5 - scores.length > 0
                    ? `${5 - scores.length} more score${5 - scores.length !== 1 ? 's' : ''} until draw eligibility`
                    : '✓ You are eligible for the next draw'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Winnings placeholder */}
        <div className="card">
          <h2 className="font-display font-semibold text-lg text-brand-dark mb-1">Winnings</h2>
          <p className="text-xs text-gray-400 mb-4">Your prize history across all draws</p>
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-3">🏆</div>
            <p className="text-sm">Your winnings will appear here after each draw</p>
          </div>
        </div>
      </div>
    </div>
  )
}
