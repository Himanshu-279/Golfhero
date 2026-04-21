import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import toast from 'react-hot-toast'
import Navbar from '../components/Navbar'

export default function WinnerUploadPage() {
  const { drawId } = useParams()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleFile = (e) => {
    const f = e.target.files[0]
    if (!f) return
    if (!f.type.startsWith('image/')) return toast.error('Please upload an image file')
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) return toast.error('Please upload your score screenshot')
    setLoading(true)

    // In a real app, upload to Supabase Storage and store URL
    // For now, we simulate with a note
    try {
      await new Promise(r => setTimeout(r, 1500)) // simulate upload
      toast.success('Proof submitted! Admin will review within 24 hours.')
      setSubmitted(true)
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-cream">
        <Navbar />
        <div className="max-w-lg mx-auto px-4 py-24 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-display font-bold text-brand-dark mb-3">Proof Submitted!</h1>
          <p className="text-gray-500 mb-6">Our team will review your submission within 24 hours. You'll be notified when your prize is processed.</p>
          <Link to="/dashboard" className="btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-16">
        <h1 className="text-2xl font-display font-bold text-brand-dark mb-2">Submit Winner Proof</h1>
        <p className="text-gray-500 mb-8">Upload a screenshot of your golf scores from your golf platform to verify your win.</p>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Score Screenshot</label>
            <div
              onClick={() => document.getElementById('file-input').click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-brand-green transition-colors"
            >
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
              ) : (
                <div>
                  <div className="text-3xl mb-2">📸</div>
                  <p className="text-sm text-gray-500">Click to upload image</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
            <input id="file-input" type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-yellow-800 leading-relaxed">
            <strong>Important:</strong> Your screenshot must clearly show your last 5 Stableford scores including dates. Screenshots must be from an official golf scoring platform.
          </div>

          <button type="submit" disabled={loading || !file} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading && <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
            {loading ? 'Submitting…' : 'Submit Proof'}
          </button>
        </form>
      </div>
    </div>
  )
}
