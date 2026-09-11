import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const user = await login(email, password)
      const fallback = user.role === 'Admin' ? '/admin' : '/'
      navigate(location.state?.from || fallback, { replace: true })
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-art">
        <div className="auth-art-content"><span className="kicker light">WELCOME BACK</span><h1>Everything you like, one sign-in away.</h1><p>Access your cart, order history and live order progress.</p></div>
      </div>
      <div className="auth-panel">
        <div className="auth-box">
          <Link to="/" className="brand"><span className="brand-mark">S</span><span>ShopNest</span></Link>
          <div className="auth-heading"><h2>Sign in</h2><p>Use your account or one of the demo credentials below.</p></div>
          {error && <div className="alert error">{error}</div>}
          <form onSubmit={submit}>
            <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required /></label>
            <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required /></label>
            <button className="btn btn-primary full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
          </form>
          <p className="auth-switch">New to ShopNest? <Link to="/register">Create an account</Link></p>
          <div className="demo-credentials">
            <strong>Demo accounts</strong>
            <button type="button" onClick={() => { setEmail('customer@shopnest.local'); setPassword('Customer@123!') }}><span>Customer</span><code>customer@shopnest.local</code></button>
            <button type="button" onClick={() => { setEmail('admin@shopnest.local'); setPassword('Admin@123!') }}><span>Admin</span><code>admin@shopnest.local</code></button>
          </div>
        </div>
      </div>
    </div>
  )
}
