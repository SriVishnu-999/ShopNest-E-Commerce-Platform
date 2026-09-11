import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <div className="brand footer-brand"><span className="brand-mark">S</span><span>ShopNest</span></div>
          <p>A polished full-stack e-commerce portfolio project built with ASP.NET Core, React and SQL Server.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/shop">All products</Link>
          <Link to="/shop?category=Electronics">Electronics</Link>
          <Link to="/shop?category=Fashion">Fashion</Link>
        </div>
        <div>
          <h4>Account</h4>
          <Link to="/orders">Orders</Link>
          <Link to="/login">Sign in</Link>
          <span>Secure mock checkout</span>
        </div>
      </div>
      <div className="container footer-bottom">© {new Date().getFullYear()} ShopNest. Built for learning and interviews.</div>
    </footer>
  )
}
