import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../../components/Loader'
import { api } from '../../services/api'
import { currency, formatDate } from '../../utils/format'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  useEffect(() => { api('/orders/admin/dashboard').then(setData) }, [])
  if (!data) return <Loader label="Loading dashboard" />

  const metrics = [
    ['Revenue', currency(data.revenue), 'Non-cancelled order value'],
    ['Orders', data.totalOrders, `${data.pendingOrders} currently active`],
    ['Products', data.totalProducts, `${data.lowStock} low-stock items`],
    ['Users', data.totalCustomers, 'Registered accounts'],
  ]

  return (
    <>
      <div className="admin-page-head"><div><span className="kicker">OVERVIEW</span><h1>Store dashboard</h1><p>A live summary of your ShopNest demo data.</p></div><Link to="/admin/products" className="btn btn-primary">+ Add product</Link></div>
      <div className="metric-grid">{metrics.map(([label, value, note]) => <div className="metric-card" key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></div>)}</div>
      <div className="admin-section-head"><h3>Recent orders</h3><Link to="/admin/orders">View all →</Link></div>
      <div className="table-card">
        <div className="admin-table head"><span>Order</span><span>Customer</span><span>Date</span><span>Status</span><span>Total</span></div>
        {data.recentOrders.length ? data.recentOrders.map((order) => (
          <div className="admin-table" key={order.id}><strong>{order.orderNumber}</strong><span>{order.customerName}</span><span>{formatDate(order.createdAt)}</span><span><i className={`status status-${order.status.toLowerCase()}`}>{order.status}</i></span><strong>{currency(order.total)}</strong></div>
        )) : <div className="table-empty">No orders yet.</div>}
      </div>
    </>
  )
}
