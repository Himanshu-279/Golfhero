import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-32 text-center">
        <div className="text-7xl font-display font-bold text-brand-green mb-4">404</div>
        <h1 className="text-2xl font-display font-bold text-brand-dark mb-3">Page not found</h1>
        <p className="text-gray-500 mb-8">Looks like this shot went out of bounds.</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    </div>
  )
}
