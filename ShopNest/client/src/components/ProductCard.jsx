import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { currency } from '../utils/format'

export default function ProductCard({ product }) {
  const { addItem } = useCart()

  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-image-wrap">
        <img src={product.imageUrl} alt={product.name} className="product-image" loading="lazy" />
        {product.isFeatured && <span className="badge">Featured</span>}
        {product.stock <= 10 && product.stock > 0 && <span className="stock-badge">Only {product.stock} left</span>}
      </Link>
      <div className="product-card-body">
        <div className="eyebrow">{product.category}</div>
        <Link to={`/products/${product.id}`} className="product-name">{product.name}</Link>
        <div className="product-card-footer">
          <strong>{currency(product.price)}</strong>
          <button
            className="icon-action"
            disabled={product.stock === 0}
            onClick={() => addItem(product)}
            aria-label={`Add ${product.name} to cart`}
            title="Add to cart"
          >
            {product.stock === 0 ? 'Sold out' : '+ Cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
