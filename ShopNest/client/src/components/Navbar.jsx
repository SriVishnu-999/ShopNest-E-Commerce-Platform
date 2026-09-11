import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <div className="top-note">Free mock delivery on demo orders · Portfolio demo store</div>
      <nav className="navbar container">
        <Link to="/" className="brand" aria-label="ShopNest home">
          <span className="brand-mark">S</span>
          <span>ShopNest</span>
        </Link>
        <div className="nav-links">
          <NavLink to="/shop">Shop</NavLink>
          {user && !isAdmin && <NavLink to="/orders">My orders</NavLink>}
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}
        </div>
        <div className="nav-actions">
          {user ? (
            <div className="user-menu">
              <span className="user-greeting">Hi, {user.fullName.split(' ')[0]}</span>
              <button className="text-button" onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <Link to="/login" className="text-button">Sign in</Link>
          )}
          {!isAdmin && (
            <Link to="/cart" className="cart-pill">
              Cart <span>{count}</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
