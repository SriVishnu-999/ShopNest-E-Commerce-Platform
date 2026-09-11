import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ fullName: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try { await register(form.fullName, form.email, form.password); navigate('/') }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-art register-art"><div className="auth-art-content"><span className="kicker light">JOIN SHOPNEST</span><h1>Create an account in under a minute.</h1><p>Save your orders and experience the complete customer flow.</p></div></div>
      <div className="auth-panel"><div className="auth-box">
        <Link to="/" className="brand"><span className="brand-mark">S</span><span>ShopNest</span></Link>
        <div className="auth-heading"><h2>Create account</h2><p>Passwords need upper/lowercase, a number and symbol.</p></div>
        {error && <div className="alert error">{error}</div>}
        <form onSubmit={submit}>
          <label>Full name<input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required /></label>
          <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
          <label>Password<input type="password" minLength="6" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
          <button className="btn btn-primary full" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div></div>
    </div>
  )
}
