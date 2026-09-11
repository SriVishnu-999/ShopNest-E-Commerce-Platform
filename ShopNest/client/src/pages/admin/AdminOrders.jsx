import { useEffect, useState } from 'react'
import Loader from '../../components/Loader'
import { api } from '../../services/api'
import { currency, formatDate } from '../../utils/format'

const statuses = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'OutForDelivery', 'Delivered', 'Cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [updating, setUpdating] = useState(null)

  const load = () => { setLoading(true); api(`/orders/admin/all${filter ? `?status=${filter}` : ''}`).then(setOrders).finally(() => setLoading(false)) }
  useEffect(load, [filter])

  const updateStatus = async (order, status) => {
    if (status === order.status) return
    setUpdating(order.id)
    try {
      await api(`/orders/admin/${order.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
      load()
    } catch (err) { window.alert(err.message) }
    finally { setUpdating(null) }
  }

  return (
    <>
      <div className="admin-page-head"><div><span className="kicker">FULFILMENT</span><h1>Orders</h1><p>Review orders and move customers through the delivery lifecycle.</p></div><select className="sort-select" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="">All statuses</option>{statuses.map((s) => <option key={s}>{s}</option>)}</select></div>
      {loading ? <Loader /> : <div className="table-card orders-admin-table">
        <div className="admin-table order-table-row head"><span>Order</span><span>Customer</span><span>Items</span><span>Total</span><span>Placed</span><span>Status</span></div>
        {orders.length ? orders.map((order) => <div className="admin-table order-table-row" key={order.id}>
          <strong>{order.orderNumber}</strong><span>{order.customerName}<small>{order.email}</small></span><span>{order.items.reduce((sum, i) => sum + i.quantity, 0)} item(s)</span><strong>{currency(order.total)}</strong><span>{formatDate(order.createdAt)}</span>
          <select value={order.status} disabled={updating === order.id || ['Delivered','Cancelled'].includes(order.status)} onChange={(e) => updateStatus(order, e.target.value)}>{statuses.map((s) => <option key={s}>{s}</option>)}</select>
        </div>) : <div className="table-empty">No orders match this filter.</div>}
      </div>}
    </>
  )
}
