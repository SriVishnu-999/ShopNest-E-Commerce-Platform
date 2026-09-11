import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../components/Loader'
import { api } from '../services/api'
import { currency, formatDate } from '../utils/format'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { api('/orders/mine').then(setOrders).finally(() => setLoading(false)) }, [])

  return (
    <div className="container page-shell">
      <div className="page-title"><span className="kicker">ACCOUNT</span><h1>My orders</h1><p>Track every order from placement to delivery.</p></div>
      {loading ? <Loader label="Loading orders" /> : !orders.length ? (
        <div className="empty-state"><div className="empty-icon">□</div><h3>No orders yet</h3><p>Your completed checkouts will appear here.</p><Link to="/shop" className="btn btn-primary">Start shopping</Link></div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link to={`/orders/${order.id}`} className="order-row" key={order.id}>
              <div><span className="eyebrow">ORDER</span><strong>{order.orderNumber}</strong><small>{formatDate(order.createdAt)}</small></div>
              <div className="order-thumbs">{order.items.slice(0, 3).map((i, idx) => <img src={i.imageUrl} alt="" key={idx} />)}</div>
              <div><span className={`status status-${order.status.toLowerCase()}`}>{order.status}</span><strong>{currency(order.total)}</strong></div>
              <span className="row-arrow">→</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
