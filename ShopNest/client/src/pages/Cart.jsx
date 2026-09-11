import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { currency } from '../utils/format'

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  if (!items.length) {
    return <div className="container page-shell empty-state"><div className="empty-icon">🛒</div><h1>Your cart is empty</h1><p>Add something you like and it will appear here.</p><Link className="btn btn-primary" to="/shop">Browse products</Link></div>
  }

  return (
    <div className="container page-shell">
      <div className="page-title"><span className="kicker">YOUR BAG</span><h1>Shopping cart</h1></div>
      <div className="cart-layout">
        <section className="cart-list">
          {items.map((item) => (
            <article className="cart-item" key={item.id}>
              <img src={item.imageUrl} alt={item.name} />
              <div className="cart-item-info">
                <span className="eyebrow">{item.category}</span>
                <Link to={`/products/${item.id}`}>{item.name}</Link>
                <span>{currency(item.price)} each</span>
              </div>
              <div className="qty-control small">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
              </div>
              <strong className="cart-line-total">{currency(item.price * item.quantity)}</strong>
              <button className="remove-button" onClick={() => removeItem(item.id)} aria-label="Remove item">×</button>
            </article>
          ))}
        </section>
        <aside className="summary-card">
          <h3>Order summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>{currency(subtotal)}</span></div>
          <div className="summary-row"><span>Delivery</span><span>Free (demo)</span></div>
          <div className="summary-row total"><span>Total</span><span>{currency(subtotal)}</span></div>
          <p className="summary-note">This is a demonstration checkout. No real delivery fee or payment is charged.</p>
          <button className="btn btn-primary full" onClick={() => navigate(user ? '/checkout' : '/login', { state: { from: '/checkout' } })}>Proceed to checkout</button>
          <Link to="/shop" className="continue-link">← Continue shopping</Link>
        </aside>
      </div>
    </div>
  )
}
