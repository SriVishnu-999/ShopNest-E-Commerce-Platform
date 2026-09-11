import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/api'
import { currency } from '../utils/format'

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ customerName: user?.fullName || '', email: user?.email || '', address: '', city: '', postalCode: '', paymentMethod: 'Mock Card' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!items.length) return <div className="container page-shell empty-state"><h2>Your cart is empty</h2><Link to="/shop" className="btn btn-primary">Shop now</Link></div>

  const setField = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setSubmitting(true); setError('')
    try {
      const order = await api('/orders/checkout', {
        method: 'POST',
        body: JSON.stringify({ ...form, items: items.map((i) => ({ productId: i.id, quantity: i.quantity })) }),
      })
      clearCart()
      navigate(`/orders/${order.id}`, { state: { justPlaced: true } })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container page-shell">
      <div className="page-title"><span className="kicker">FINAL STEP</span><h1>Checkout</h1></div>
      <form className="checkout-layout" onSubmit={submit}>
        <section className="checkout-form card-panel">
          <div className="panel-heading"><span>1</span><div><h3>Delivery details</h3><p>Where should we send your mock order?</p></div></div>
          {error && <div className="alert error">{error}</div>}
          <div className="form-grid two">
            <label>Full name<input name="customerName" value={form.customerName} onChange={setField} required /></label>
            <label>Email<input name="email" type="email" value={form.email} onChange={setField} required /></label>
          </div>
          <label>Address<input name="address" value={form.address} onChange={setField} placeholder="Street, building, area" required /></label>
          <div className="form-grid two">
            <label>City<input name="city" value={form.city} onChange={setField} required /></label>
            <label>Postal code<input name="postalCode" value={form.postalCode} onChange={setField} required /></label>
          </div>
          <div className="panel-divider" />
          <div className="panel-heading"><span>2</span><div><h3>Payment</h3><p>This portfolio project never charges a real card.</p></div></div>
          <label>Payment method<select name="paymentMethod" value={form.paymentMethod} onChange={setField}><option>Mock Card</option><option>Mock UPI</option><option>Cash on Delivery (Mock)</option></select></label>
          <div className="mock-card"><div><span>SHOPNEST DEMO</span><b>•••• •••• •••• 4242</b></div><small>NO REAL PAYMENT</small></div>
        </section>
        <aside className="summary-card checkout-summary">
          <h3>Your order</h3>
          <div className="mini-order-list">
            {items.map((item) => <div key={item.id}><img src={item.imageUrl} alt="" /><span>{item.name}<small>Qty {item.quantity}</small></span><b>{currency(item.price * item.quantity)}</b></div>)}
          </div>
          <div className="summary-row total"><span>Product total</span><span>{currency(subtotal)}</span></div>
          <button className="btn btn-primary full" disabled={submitting}>{submitting ? 'Placing order…' : `Place mock order · ${currency(subtotal)}`}</button>
          <p className="summary-note centered">By placing this order you confirm this is a demonstration checkout.</p>
        </aside>
      </form>
    </div>
  )
}
