import { useState } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'

export default function ScoreForm({ onSuccess, editScore = null, onCancel }) {
  const [form, setForm] = useState({
    score: editScore?.score || '',
    score_date: editScore?.score_date || new Date().toISOString().slice(0, 10)
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const score = parseInt(form.score)
    if (score < 1 || score > 45) return toast.error('Score must be between 1 and 45')

    setLoading(true)
    try {
      if (editScore) {
        await api.put(`/scores/${editScore.id}`, form)
        toast.success('Score updated')
      } else {
        await api.post('/scores', form)
        toast.success('Score added')
      }
      onSuccess?.()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save score')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Score (1–45)</label>
          <input
            type="number" min="1" max="45"
            className="input-field"
            placeholder="e.g. 32"
            value={form.score}
            onChange={e => setForm(f => ({ ...f, score: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
          <input
            type="date"
            className="input-field"
            value={form.score_date}
            max={new Date().toISOString().slice(0, 10)}
            onChange={e => setForm(f => ({ ...f, score_date: e.target.value }))}
            required
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn-primary py-2 px-4 text-sm flex-1 flex items-center justify-center gap-1">
          {loading && <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full" />}
          {editScore ? 'Update Score' : 'Add Score'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-outline py-2 px-4 text-sm">Cancel</button>
        )}
      </div>
    </form>
  )
}
