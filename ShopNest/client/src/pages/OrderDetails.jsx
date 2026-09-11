import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import Loader from '../components/Loader'
import { api } from '../services/api'
import { currency, formatDate } from '../utils/format'

const steps = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'OutForDelivery', 'Delivered']

export default function OrderDetails() {
  const { id } = useParams(); const location = useLocation()
  const [order, setOrder] = useState(null); const [loading, setLoading] = useState(true)
  useEffect(() => { api(`/orders/${id}`).then(setOrder).finally(() => setLoading(false)) }, [id])
  if (loading) return <div className="container page-shell"><Loader /></div>
  if (!order) return <div className="container page-shell empty-state"><h2>Order not found</h2></div>

  const current = steps.indexOf(order.status)
  return (
    <div className="container page-shell order-detail-page">
      {location.state?.justPlaced && <div className="alert success">Order placed successfully. Your mock checkout is complete.</div>}
      <div className="order-detail-header"><div><span className="kicker">ORDER DETAILS</span><h1>{order.orderNumber}</h1><p>Placed {formatDate(order.createdAt)}</p></div><span className={`status large status-${order.status.toLowerCase()}`}>{order.status}</span></div>
      {order.status === 'Cancelled' ? <div className="cancelled-banner">This order was cancelled and its stock was returned to inventory.</div> : (
        <div className="tracking-card">
          {steps.map((step, index) => <div className={`tracking-step ${index <= current ? 'done' : ''}`} key={step}><span>{index < current ? '✓' : index + 1}</span><b>{step === 'OutForDelivery' ? 'Out for delivery' : step}</b></div>)}
        </div>
      )}
      <div className="order-detail-grid">
        <section className="card-panel"><h3>Items</h3><div className="order-items">{order.items.map((item, idx) => <div key={idx}><img src={item.imageUrl} alt={item.productName}/><span><strong>{item.productName}</strong><small>{currency(item.unitPrice)} × {item.quantity}</small></span><b>{currency(item.unitPrice * item.quantity)}</b></div>)}</div><div className="summary-row total"><span>Total</span><span>{currency(order.total)}</span></div></section>
        <aside className="card-panel order-info"><h3>Delivery</h3><p><strong>{order.customerName}</strong><br/>{order.address}<br/>{order.city} — {order.postalCode}<br/>{order.email}</p><div className="panel-divider"/><h3>Payment</h3><p>{order.paymentMethod}<br/><small>Mock transaction — no real payment</small></p></aside>
      </div>
      <Link to="/orders" className="text-link">← Back to all orders</Link>
    </div>
  )
}
