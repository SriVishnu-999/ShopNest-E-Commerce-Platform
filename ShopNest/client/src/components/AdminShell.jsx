import { NavLink, Outlet } from 'react-router-dom'

export default function AdminShell() {
  return (
    <div className="container admin-shell page-shell">
      <aside className="admin-sidebar">
        <div><span className="kicker">CONTROL CENTER</span><h2>Admin</h2></div>
        <nav>
          <NavLink end to="/admin">Overview</NavLink>
          <NavLink to="/admin/products">Products</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
        </nav>
        <div className="admin-side-note"><b>ShopNest Admin</b><span>JWT role protected</span></div>
      </aside>
      <section className="admin-main"><Outlet /></section>
    </div>
  )
}
