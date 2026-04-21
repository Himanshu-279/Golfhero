import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../lib/api'

function CountUp({ end, duration = 2000, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.round(eased * end))
          if (progress < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

export default function HomePage() {
  const { user } = useAuth()
  const [featuredCharities, setFeaturedCharities] = useState([])
  const [latestDraw, setLatestDraw] = useState(null)

  useEffect(() => {
    api.get('/charities?featured=true').then(r => setFeaturedCharities(r.data.slice(0, 3))).catch(() => {})
    api.get('/draws/latest').then(r => setLatestDraw(r.data)).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-dark text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-brand-gold rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-light rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 py-24 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/30 rounded-full px-4 py-2 mb-6 animate-fade-in">
            <span className="w-2 h-2 bg-brand-gold rounded-full animate-pulse" />
            <span className="text-brand-gold text-sm font-medium">Monthly draws now live</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 animate-fade-up opacity-0-init" style={{ animationFillMode: 'forwards' }}>
            Play Golf.<br />
            <span className="text-brand-gold">Win Prizes.</span><br />
            Change Lives.
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-up opacity-0-init animate-delay-200" style={{ animationFillMode: 'forwards' }}>
            Enter your Stableford scores each month. Win cash prizes. And with every subscription, you're funding a charity that matters to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up opacity-0-init animate-delay-300" style={{ animationFillMode: 'forwards' }}>
            {user ? (
              <Link to="/dashboard" className="btn-primary text-base py-4 px-8 bg-brand-gold text-brand-dark hover:bg-yellow-400">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary text-base py-4 px-8 bg-brand-gold text-brand-dark hover:bg-yellow-400">
                  Start Winning Today
                </Link>
                <Link to="/charities" className="btn-outline border-white text-white text-base py-4 px-8 hover:bg-white hover:text-brand-dark">
                  Explore Charities
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: 12500, prefix: '₹', suffix: '+', label: 'Charity Raised' },
            { value: 340, suffix: '+', label: 'Active Members' },
            { value: 24, label: 'Draws Completed' },
            { value: 15, prefix: '₹', suffix: 'L+ Prizes Paid' },
          ].map((s, i) => (
            <div key={i}>
              <div className="text-2xl md:text-3xl font-display font-bold text-brand-green">
                <CountUp end={s.value} prefix={s.prefix || ''} suffix={s.suffix || ''} />
              </div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-dark mb-3">How GolfHero Works</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Simple. Engaging. Rewarding — for you and the world.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Subscribe', desc: 'Choose a monthly or yearly plan. Cancel anytime.', icon: '🏌️' },
            { step: '02', title: 'Enter Scores', desc: 'Log your last 5 Stableford scores after each round.', icon: '⛳' },
            { step: '03', title: 'Monthly Draw', desc: 'Your 5 scores are matched against the monthly draw numbers.', icon: '🎲' },
            { step: '04', title: 'Win & Give', desc: 'Win cash prizes. A portion always goes to your chosen charity.', icon: '❤️' },
          ].map(({ step, title, desc, icon }) => (
            <div key={step} className="card relative group hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4 animate-float">{icon}</div>
              <div className="text-5xl font-display font-bold text-gray-100 absolute top-4 right-4">{step}</div>
              <h3 className="font-display font-semibold text-lg text-brand-dark mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prize Pool */}
      <section className="bg-brand-dark text-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Monthly Prize Pool</h2>
            <p className="text-gray-400">Every subscriber contributes. Every match wins.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { match: '5-Number Match', share: '40%', tag: 'Jackpot', desc: 'Rolls over if unclaimed', color: 'border-brand-gold bg-brand-gold/10' },
              { match: '4-Number Match', share: '35%', tag: 'Second Prize', desc: 'Split among all winners', color: 'border-brand-light bg-brand-light/10' },
              { match: '3-Number Match', share: '25%', tag: 'Third Prize', desc: 'Split among all winners', color: 'border-gray-500 bg-white/5' },
            ].map(({ match, share, tag, desc, color }) => (
              <div key={match} className={`border rounded-2xl p-6 ${color}`}>
                <div className="text-xs font-medium uppercase tracking-widest text-brand-gold mb-2">{tag}</div>
                <div className="text-4xl font-display font-bold mb-2">{share}</div>
                <div className="font-medium text-lg mb-1">{match}</div>
                <div className="text-gray-400 text-sm">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Draw Result */}
      {latestDraw && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="card text-center">
            <h2 className="text-2xl font-display font-bold text-brand-dark mb-2">Latest Draw — {latestDraw.month_year}</h2>
            <p className="text-gray-500 text-sm mb-6">Winning numbers</p>
            <div className="flex justify-center gap-3 mb-6">
              {(latestDraw.draw_numbers || []).map((n, i) => (
                <div key={i} className="w-12 h-12 rounded-full bg-brand-green text-white flex items-center justify-center font-bold text-lg">
                  {n}
                </div>
              ))}
            </div>
            <Link to="/draws" className="btn-outline text-sm py-2 px-5">View All Results</Link>
          </div>
        </section>
      )}

      {/* Featured Charities */}
      {featuredCharities.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-display font-bold text-brand-dark mb-2">Featured Charities</h2>
              <p className="text-gray-500">Your subscription helps them do more good.</p>
            </div>
            <Link to="/charities" className="text-brand-green text-sm font-medium hover:underline hidden md:block">View all →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCharities.map(charity => (
              <Link to={`/charities/${charity.id}`} key={charity.id} className="card hover:shadow-md transition-all hover:-translate-y-1 group">
                {charity.image_url && (
                  <img src={charity.image_url} alt={charity.name} className="w-full h-40 object-cover rounded-xl mb-4" />
                )}
                <h3 className="font-display font-semibold text-brand-dark group-hover:text-brand-green transition-colors">{charity.name}</h3>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{charity.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-brand-green rounded-3xl p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl" />
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 relative">Ready to play for a cause?</h2>
          <p className="text-green-100 text-lg mb-8 max-w-lg mx-auto relative">
            Join hundreds of golfers making a difference every month. From as little as the cost of a coffee.
          </p>
          <Link to={user ? '/dashboard' : '/register'} className="inline-block bg-brand-gold text-brand-dark font-semibold text-lg py-4 px-10 rounded-full hover:bg-yellow-400 transition-colors relative">
            {user ? 'View Dashboard' : 'Subscribe Now'}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
