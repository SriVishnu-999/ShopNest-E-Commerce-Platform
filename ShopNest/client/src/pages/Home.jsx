import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import { api } from '../services/api'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api('/products?featured=true&pageSize=8')
      .then((data) => setProducts(data.items))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <span className="kicker">CURATED FOR EVERYDAY LIFE</span>
          <h1>Find what fits your life.</h1>
          <p>Smart essentials, modern style and practical picks — brought together in one clean shopping experience.</p>
          <div className="hero-actions">
            <Link to="/shop" className="btn btn-primary">Shop collection</Link>
            <a href="#featured" className="btn btn-ghost">See featured</a>
          </div>
          <div className="hero-proof">
            <span><b>12+</b> curated products</span>
            <span><b>4</b> categories</span>
            <span><b>100%</b> mock checkout</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-orb hero-orb-one" />
          <div className="hero-orb hero-orb-two" />
          <div className="hero-card hero-card-main">
            <span className="hero-card-label">Editor’s pick</span>
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85" alt="Wireless headphones" />
            <div><strong>AeroPulse</strong><span>Immersive sound, all day.</span></div>
          </div>
          <div className="floating-chip chip-one">Fast REST API</div>
          <div className="floating-chip chip-two">Role-based access</div>
        </div>
      </section>

      <section className="category-strip container">
        {['Electronics', 'Fashion', 'Home', 'Fitness'].map((category) => (
          <Link key={category} to={`/shop?category=${category}`} className="category-card">
            <span className="category-icon">{category === 'Electronics' ? '⌁' : category === 'Fashion' ? '◇' : category === 'Home' ? '⌂' : '↗'}</span>
            <span>{category}</span>
            <b>Explore →</b>
          </Link>
        ))}
      </section>

      <section id="featured" className="section container">
        <div className="section-heading">
          <div><span className="kicker">SHOPNEST PICKS</span><h2>Featured products</h2></div>
          <Link to="/shop" className="text-link">View all products →</Link>
        </div>
        {loading ? <Loader label="Loading products" /> : (
          <div className="product-grid">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        )}
      </section>

      <section className="benefit-band">
        <div className="container benefit-grid">
          <div><span>01</span><h3>Secure account flow</h3><p>JWT authentication and protected customer/admin routes.</p></div>
          <div><span>02</span><h3>Real inventory rules</h3><p>Stock is validated and updated during every mock checkout.</p></div>
          <div><span>03</span><h3>Order visibility</h3><p>Customers track progress while admins control status changes.</p></div>
        </div>
      </section>
    </>
  )
}
