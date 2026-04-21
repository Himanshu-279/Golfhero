import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [charities, setCharities] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    charity_id: '', charity_percentage: 10
  })

  useEffect(() => {
    api.get('/charities').then(r => setCharities(r.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.charity_percentage < 10) return toast.error('Minimum charity contribution is 10%')
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters')

    setLoading(true)
    try {
      const user = await register({
        ...form,
        charity_id: form.charity_id || null,
        charity_percentage: parseInt(form.charity_percentage)
      })
      toast.success('Account created! Please subscribe to get started.')
      navigate('/subscribe')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-cream flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 bg-brand-dark text-white flex-col justify-center px-16">
        <Link to="/" className="flex items-center gap-2 mb-16">
          <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center">
            <span className="text-brand-dark text-sm font-bold font-display">G</span>
          </div>
          <span className="font-display font-semibold text-lg">GolfHero</span>
        </Link>
        <h2 className="text-4xl font-display font-bold mb-4">Join thousands playing for good.</h2>
        <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
          Every subscription. Every score. Every draw — a portion goes straight to charity.
        </p>
        <div className="mt-10 space-y-3">
          {['No golf experience needed', 'Cancel anytime', 'Charity of your choice', 'Monthly prize draws'].map(f => (
            <div key={f} className="flex items-center gap-3">
              <span className="w-5 h-5 bg-brand-gold/20 rounded-full flex items-center justify-center text-brand-gold text-xs">✓</span>
              <span className="text-gray-300 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">G</span>
              </div>
              <span className="font-display font-semibold text-brand-dark text-lg">GolfHero</span>
            </Link>
          </div>

          <h1 className="text-2xl font-display font-bold text-brand-dark mb-2">Create your account</h1>
          <p className="text-gray-500 mb-8">Start playing, winning, and giving today.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input className="input-field" placeholder="Your name" value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" className="input-field" placeholder="Min. 8 characters" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>

            {/* Charity selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Choose a Charity (optional)</label>
              <select className="input-field" value={form.charity_id}
                onChange={e => setForm(f => ({ ...f, charity_id: e.target.value }))}>
                <option value="">Select a charity later</option>
                {charities.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {form.charity_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Charity Contribution: <span className="text-brand-green font-semibold">{form.charity_percentage}%</span>
                </label>
                <input type="range" min="10" max="50" step="5"
                  value={form.charity_percentage}
                  onChange={e => setForm(f => ({ ...f, charity_percentage: parseInt(e.target.value) }))}
                  className="w-full accent-brand-green" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>10% (min)</span><span>50%</span>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2">
              {loading && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-green font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
