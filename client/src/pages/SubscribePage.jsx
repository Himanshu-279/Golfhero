import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'

export default function SubscribePage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(null)

  const subscribe = async (plan) => {
    setLoading(plan)
    try {
      const res = await api.post('/subscriptions/checkout', { plan })
      
      // If Razorpay response
      if (res.data.type === 'razorpay') {
        const options = {
          key: res.data.keyId,
          amount: res.data.order.amount,
          currency: 'INR',
          name: 'GolfHero',
          description: `${plan === 'yearly' ? 'Yearly' : 'Monthly'} Subscription`,
          order_id: res.data.order.orderId,
          prefill: {
            name: res.data.userName,
            email: res.data.userEmail
          },
          theme: {
            color: '#16a34a'
          },
          handler: async (response) => {
            try {
              // Verify payment on backend
              await api.post('/subscriptions/razorpay-callback', {
                orderId: res.data.order.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                plan: plan
              })
              toast.success('Subscription activated! Welcome to GolfHero 🎉')
              setTimeout(() => window.location.href = '/dashboard', 2000)
            } catch (err) {
              toast.error('Payment verification failed')
              setLoading(null)
            }
          }
        }
        
        // Load Razorpay SDK
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        script.onload = () => {
          const rzp = new window.Razorpay(options)
          rzp.open()
        }
        document.body.appendChild(script)
      } 
      // If Demo or Stripe mode
      else if (res.data.url) {
        window.location.href = res.data.url
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start checkout')
      setLoading(null)
    }
  }

  if (user?.subscription_status === 'active') {
    return (
      <div className="min-h-screen bg-brand-cream">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-display font-bold text-brand-dark mb-3">You're already subscribed!</h1>
          <p className="text-gray-500 mb-6">Your subscription is active. Head to your dashboard to enter scores.</p>
          <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-dark mb-3">Choose Your Plan</h1>
          <p className="text-gray-500 text-lg">One subscription. Monthly draws. Real charity impact.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Monthly */}
          <div className="card border-2 border-gray-200 hover:border-brand-green transition-colors">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Monthly</div>
            <div className="text-4xl font-display font-bold text-brand-dark mb-1">₹499<span className="text-lg font-normal text-gray-400">/mo</span></div>
            <p className="text-gray-500 text-sm mb-6">Billed monthly. Cancel anytime.</p>
            <ul className="space-y-2 mb-8">
              {['5 score entries/month', 'Monthly prize draw entry', 'Charity contribution (10%+)', 'Full dashboard access'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-brand-green">✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => subscribe('monthly')} disabled={!!loading}
              className="btn-outline w-full py-3 flex items-center justify-center gap-2">
              {loading === 'monthly' && <span className="animate-spin h-4 w-4 border-2 border-brand-green border-t-transparent rounded-full" />}
              {loading === 'monthly' ? 'Redirecting…' : 'Subscribe Monthly'}
            </button>
          </div>

          {/* Yearly */}
          <div className="card border-2 border-brand-green relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-gold text-brand-dark text-xs font-semibold px-4 py-1 rounded-full">
              Best Value — Save 20%
            </div>
            <div className="text-sm font-medium text-brand-green uppercase tracking-wider mb-4">Yearly</div>
            <div className="text-4xl font-display font-bold text-brand-dark mb-1">₹4,799<span className="text-lg font-normal text-gray-400">/yr</span></div>
            <p className="text-gray-500 text-sm mb-6">Billed yearly. That's ₹400/mo.</p>
            <ul className="space-y-2 mb-8">
              {['Everything in Monthly', '2 months free', 'Priority draw entry', 'Early access to features'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-brand-green">✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => subscribe('yearly')} disabled={!!loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading === 'yearly' && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
              {loading === 'yearly' ? 'Redirecting…' : 'Subscribe Yearly'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Secure payment via Stripe. 10% minimum of your subscription goes to your chosen charity.
        </p>
      </div>
    </div>
  )
}
