import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-brand-dark text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center">
              <span className="text-brand-dark text-sm font-bold font-display">G</span>
            </div>
            <span className="font-display font-semibold text-lg">GolfHero</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Play golf. Win prizes. Change lives.<br />
            Every score you enter supports a charity you love.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-brand-gold">Platform</h4>
          <div className="flex flex-col gap-2">
            <Link to="/charities" className="text-gray-400 text-sm hover:text-white transition-colors">Charities</Link>
            <Link to="/draws" className="text-gray-400 text-sm hover:text-white transition-colors">Monthly Draws</Link>
            <Link to="/register" className="text-gray-400 text-sm hover:text-white transition-colors">Subscribe</Link>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-4 text-brand-gold">How it works</h4>
          <div className="flex flex-col gap-2 text-gray-400 text-sm">
            <span>1. Subscribe monthly or yearly</span>
            <span>2. Enter your last 5 golf scores</span>
            <span>3. Win prizes in monthly draws</span>
            <span>4. Support your chosen charity</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 text-center py-4 text-gray-500 text-xs">
        © {new Date().getFullYear()} GolfHero. All rights reserved.
      </div>
    </footer>
  )
}
