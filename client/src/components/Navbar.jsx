import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setOpen(false)
  }

  const isActive = (path) => location.pathname === path

  const navLink = (to, label) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={`text-sm font-medium transition-colors ${isActive(to) ? 'text-brand-green' : 'text-gray-600 hover:text-brand-green'}`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold font-display">G</span>
          </div>
          <span className="font-display font-semibold text-brand-dark text-lg">GolfHero</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLink('/charities', 'Charities')}
          {navLink('/draws', 'Draws')}
          {user && navLink('/dashboard', 'Dashboard')}
          {user?.role === 'admin' && navLink('/admin', 'Admin')}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-500">Hi, {user.name?.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn-outline text-sm py-2 px-4">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-brand-green">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <RiCloseLine size={24} /> : <RiMenu3Line size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-4">
          {navLink('/charities', 'Charities')}
          {navLink('/draws', 'Draws')}
          {user && navLink('/dashboard', 'Dashboard')}
          {user?.role === 'admin' && navLink('/admin', 'Admin')}
          <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
            {user ? (
              <button onClick={handleLogout} className="btn-outline text-sm">Logout</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-outline text-sm text-center">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-sm text-center">Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
