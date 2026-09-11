import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Loader from '../components/Loader'
import { api } from '../services/api'
import { useCart } from '../context/CartContext'
import { currency } from '../utils/format'

export default function ProductDetails() {
  const { id } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    api(`/products/${id}`).then(setProduct).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="container page-shell"><Loader /></div>
  if (!product) return <div className="container page-shell empty-state"><h2>Product not found</h2><Link to="/shop" className="btn btn-primary">Back to shop</Link></div>

  const add = () => {
    addItem(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="container page-shell">
      <div className="breadcrumbs"><Link to="/shop">Shop</Link><span>/</span><span>{product.category}</span></div>
      <section className="product-detail">
        <div className="detail-image"><img src={product.imageUrl} alt={product.name} /></div>
        <div className="detail-copy">
          <span className="kicker">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="detail-price">{currency(product.price)}</div>
          <p className="detail-description">{product.description}</p>
          <div className="detail-meta">
            <span className={product.stock > 0 ? 'availability in-stock' : 'availability out-stock'}>{product.stock > 0 ? `In stock · ${product.stock} available` : 'Out of stock'}</span>
            <span>Free mock delivery for this demo</span>
          </div>
          <div className="purchase-row">
            <div className="qty-control">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, 20, q + 1))}>+</button>
            </div>
            <button className="btn btn-primary btn-grow" disabled={product.stock === 0} onClick={add}>{added ? 'Added to cart ✓' : 'Add to cart'}</button>
          </div>
          <div className="detail-assurance">
            <div><b>✓</b><span><strong>Mock checkout</strong> No real payment is processed.</span></div>
            <div><b>✓</b><span><strong>Stock protected</strong> Inventory is revalidated by the API.</span></div>
            <div><b>✓</b><span><strong>Trackable</strong> Follow every status from placed to delivered.</span></div>
          </div>
        </div>
      </section>
    </div>
  )
}
