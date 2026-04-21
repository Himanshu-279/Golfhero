import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import api from '../lib/api'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

// ─── Admin Sidebar ───────────────────────────────────────────────
function AdminSidebar() {
  const { pathname } = useLocation()
  const links = [
    { to: '/admin', label: '📊 Dashboard', exact: true },
    { to: '/admin/users', label: '👥 Users' },
    { to: '/admin/draws', label: '🎲 Draws' },
    { to: '/admin/charities', label: '❤️ Charities' },
    { to: '/admin/winners', label: '🏆 Winners' },
    { to: '/admin/analytics', label: '📈 Analytics' },
  ]
  return (
    <div className="w-56 bg-white border-r border-gray-100 min-h-screen hidden md:block">
      <div className="p-4 border-b border-gray-100">
        <p className="font-display font-semibold text-brand-dark text-sm">Admin Panel</p>
      </div>
      <nav className="p-2 flex flex-col gap-1">
        {links.map(({ to, label, exact }) => {
          const active = exact ? pathname === to : pathname.startsWith(to) && to !== '/admin'
          const base = exact ? pathname === '/admin' : false
          return (
            <Link key={to} to={to}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${(active || base) ? 'bg-brand-green text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

// ─── Stats Dashboard ─────────────────────────────────────────────
function AdminDashboard() {
  const [stats, setStats] = useState(null)
  useEffect(() => { api.get('/admin/stats').then(r => setStats(r.data)) }, [])

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-brand-dark mb-6">Overview</h2>
      {stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Users', value: stats.total_users, color: 'text-brand-green' },
            { label: 'Active Subscribers', value: stats.active_subscribers, color: 'text-blue-600' },
            { label: 'Charity Raised', value: `₹${stats.total_charity_contributed?.toLocaleString()}`, color: 'text-brand-gold' },
            { label: 'Total Prize Pool', value: `₹${stats.total_prize_pool?.toLocaleString()}`, color: 'text-purple-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card">
              <div className={`text-2xl font-display font-bold ${color} mb-1`}>{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="animate-pulse grid grid-cols-4 gap-4 mb-8">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl" />)}
        </div>
      )}
    </div>
  )
}

// ─── Users ────────────────────────────────────────────────────────
function AdminUsers() {
  const [users, setUsers] = useState([])
  useEffect(() => { api.get('/admin/users').then(r => setUsers(r.data)) }, [])

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-brand-dark mb-6">Users ({users.length})</h2>
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                {['Name', 'Email', 'Status', 'Plan', 'Charity %', 'Joined', 'Role', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={u.subscription_status === 'active' ? 'badge-active' : 'badge-inactive'}>
                      {u.subscription_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">—</td>
                  <td className="px-4 py-3">{u.charity_percentage}%</td>
                  <td className="px-4 py-3 text-gray-400">{format(new Date(u.created_at), 'dd MMM yy')}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${u.role === 'admin' ? 'text-purple-600' : 'text-gray-400'}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={async () => {
                      const name = prompt('New name:', u.name)
                      if (!name) return
                      await api.put(`/admin/users/${u.id}`, { name })
                      toast.success('Updated')
                      api.get('/admin/users').then(r => setUsers(r.data))
                    }} className="text-xs text-brand-green hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Draws ────────────────────────────────────────────────────────
function AdminDraws() {
  const [draws, setDraws] = useState([])
  const [simResult, setSimResult] = useState(null)
  const [drawType, setDrawType] = useState('random')
  const [running, setRunning] = useState(false)

  const load = () => api.get('/draws/admin/all').then(r => setDraws(r.data))
  useEffect(() => { load() }, [])

  const simulate = async () => {
    setRunning(true)
    try {
      const res = await api.post('/draws/simulate', { draw_type: drawType })
      setSimResult(res.data)
    } catch { toast.error('Simulation failed') }
    finally { setRunning(false) }
  }

  const runDraw = async () => {
    if (!confirm('Run and save draw? This will calculate winners.')) return
    setRunning(true)
    try {
      await api.post('/draws/run', { draw_type: drawType })
      toast.success('Draw saved as draft')
      load()
      setSimResult(null)
    } catch { toast.error('Draw failed') }
    finally { setRunning(false) }
  }

  const publish = async (id) => {
    if (!confirm('Publish this draw? Winners will be notified.')) return
    await api.put(`/draws/${id}/publish`)
    toast.success('Draw published')
    load()
  }

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-brand-dark mb-6">Draw Management</h2>

      {/* Controls */}
      <div className="card mb-6">
        <h3 className="font-medium text-brand-dark mb-4">Run New Draw</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Draw Type</label>
            <select value={drawType} onChange={e => setDrawType(e.target.value)} className="input-field py-2 w-48">
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic (weighted)</option>
            </select>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={simulate} disabled={running} className="btn-outline text-sm py-2 px-4">
              {running ? '…' : 'Simulate'}
            </button>
            <button onClick={runDraw} disabled={running} className="btn-primary text-sm py-2 px-4">
              {running ? '…' : 'Run & Save (Draft)'}
            </button>
          </div>
        </div>

        {simResult && (
          <div className="mt-5 bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-brand-dark mb-3">Simulation Result (not saved)</p>
            <div className="flex gap-2 mb-3">
              {simResult.drawNumbers.map((n, i) => (
                <span key={i} className="w-9 h-9 rounded-full bg-brand-green text-white text-sm font-bold flex items-center justify-center">{n}</span>
              ))}
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <div>5-Match winners: {simResult.results.match5.length} · Prize: ₹{simResult.prizes.match5_per_winner}</div>
              <div>4-Match winners: {simResult.results.match4.length} · Prize: ₹{simResult.prizes.match4_per_winner}</div>
              <div>3-Match winners: {simResult.results.match3.length} · Prize: ₹{simResult.prizes.match3_per_winner}</div>
              <div>Total pool: ₹{simResult.pools.total} | Jackpot: ₹{simResult.pools.jackpot}</div>
            </div>
          </div>
        )}
      </div>

      {/* Draw list */}
      <div className="flex flex-col gap-3">
        {draws.map(d => (
          <div key={d.id} className="card flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-brand-dark">{d.month_year}</span>
                <span className={d.status === 'published' ? 'badge-active' : 'badge-pending'}>{d.status}</span>
              </div>
              <div className="flex gap-1.5 my-2">
                {(d.draw_numbers || []).map((n, i) => (
                  <span key={i} className="w-7 h-7 rounded-full bg-brand-green/20 text-brand-green text-xs font-bold flex items-center justify-center">{n}</span>
                ))}
              </div>
              <p className="text-xs text-gray-400">Pool: ₹{d.total_pool} | {d.subscriber_count} participants</p>
            </div>
            {d.status === 'draft' && (
              <button onClick={() => publish(d.id)} className="btn-primary text-sm py-2 px-4">Publish</button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Charities ────────────────────────────────────────────────────
function AdminCharities() {
  const [charities, setCharities] = useState([])
  const [form, setForm] = useState({ name: '', description: '', image_url: '', website: '', featured: false, upcoming_events: '' })
  const [showForm, setShowForm] = useState(false)

  const load = () => api.get('/charities').then(r => setCharities(r.data))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await api.post('/charities', form)
    toast.success('Charity added')
    setShowForm(false)
    setForm({ name: '', description: '', image_url: '', website: '', featured: false, upcoming_events: '' })
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this charity?')) return
    await api.delete(`/charities/${id}`)
    toast.success('Charity deactivated')
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-bold text-brand-dark">Charities ({charities.length})</h2>
        <button onClick={() => setShowForm(f => !f)} className="btn-primary text-sm py-2 px-4">+ Add Charity</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Name *</label>
            <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Website</label>
            <input className="input-field" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Image URL</label>
            <input className="input-field" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} />
            <label htmlFor="featured" className="text-sm text-gray-600">Featured charity</label>
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Description *</label>
            <textarea className="input-field" rows="3" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-gray-500 mb-1 block">Upcoming Events</label>
            <textarea className="input-field" rows="2" value={form.upcoming_events} onChange={e => setForm(f => ({ ...f, upcoming_events: e.target.value }))} />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="btn-primary text-sm py-2 px-4">Save Charity</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline text-sm py-2 px-4">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {charities.map(c => (
          <div key={c.id} className="card flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-brand-dark">{c.name}</span>
                {c.featured && <span className="text-xs bg-brand-gold/20 text-brand-gold px-2 py-0.5 rounded-full">Featured</span>}
              </div>
              <p className="text-xs text-gray-400 line-clamp-2">{c.description}</p>
            </div>
            <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:underline shrink-0">Remove</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Winners ─────────────────────────────────────────────────────
function AdminWinners() {
  const [winners, setWinners] = useState([])
  const load = () => api.get('/admin/winners').then(r => setWinners(r.data))
  useEffect(() => { load() }, [])

  const verify = async (id, status) => {
    await api.put(`/admin/winners/${id}/verify`, { status })
    toast.success(`Winner ${status}`)
    load()
  }

  const markPaid = async (id) => {
    await api.put(`/admin/winners/${id}/pay`)
    toast.success('Marked as paid')
    load()
  }

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-brand-dark mb-6">Winners ({winners.length})</h2>
      {winners.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No winners yet</div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  {['User', 'Draw', 'Match', 'Prize', 'Verification', 'Payment', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {winners.map(w => (
                  <tr key={w.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium">{w.users?.name}</div>
                      <div className="text-xs text-gray-400">{w.users?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{w.draws?.month_year}</td>
                    <td className="px-4 py-3"><span className="badge-active">{w.match_count}-match</span></td>
                    <td className="px-4 py-3 font-medium text-brand-green">₹{w.prize_amount?.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={
                        w.verification_status === 'approved' ? 'badge-active' :
                        w.verification_status === 'rejected' ? 'badge-inactive' : 'badge-pending'
                      }>{w.verification_status || 'pending'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={w.payment_status === 'paid' ? 'badge-active' : 'badge-pending'}>
                        {w.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {!w.verification_status && (
                          <>
                            <button onClick={() => verify(w.id, 'approved')} className="text-xs text-green-600 hover:underline">Approve</button>
                            <button onClick={() => verify(w.id, 'rejected')} className="text-xs text-red-400 hover:underline">Reject</button>
                          </>
                        )}
                        {w.verification_status === 'approved' && w.payment_status !== 'paid' && (
                          <button onClick={() => markPaid(w.id)} className="text-xs text-brand-green hover:underline">Mark Paid</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Analytics ───────────────────────────────────────────────────
function AdminAnalytics() {
  const [stats, setStats] = useState(null)
  useEffect(() => { api.get('/admin/stats').then(r => setStats(r.data)) }, [])

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-brand-dark mb-6">Analytics</h2>
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="font-medium text-brand-dark mb-4">Platform Summary</h3>
            <div className="space-y-3">
              {[
                { label: 'Total registered users', value: stats.total_users },
                { label: 'Active subscribers', value: stats.active_subscribers },
                { label: 'Conversion rate', value: `${stats.total_users > 0 ? Math.round((stats.active_subscribers / stats.total_users) * 100) : 0}%` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="font-medium text-brand-dark">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 className="font-medium text-brand-dark mb-4">Financial Summary</h3>
            <div className="space-y-3">
              {[
                { label: 'Total charity raised', value: `₹${stats.total_charity_contributed?.toLocaleString()}` },
                { label: 'Total prize pool distributed', value: `₹${stats.total_prize_pool?.toLocaleString()}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-sm text-gray-500">{label}</span>
                  <span className="font-medium text-brand-green">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Admin Layout ────────────────────────────────────────────
export default function AdminPage() {
  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-6 max-w-5xl">
          <Routes>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="draws" element={<AdminDraws />} />
            <Route path="charities" element={<AdminCharities />} />
            <Route path="winners" element={<AdminWinners />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="*" element={<Navigate to="/admin" />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
