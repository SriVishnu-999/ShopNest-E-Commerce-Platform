import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import Loader from '../components/Loader'
import { api } from '../services/api'

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('search') || '')

  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const page = Number(searchParams.get('page') || 1)

  useEffect(() => { api('/products/categories').then(setCategories) }, [])

  useEffect(() => {
    setLoading(true)
    const query = new URLSearchParams(searchParams)
    query.set('pageSize', '12')
    api(`/products?${query.toString()}`)
      .then((data) => {
        setProducts(data.items)
        setMeta({ total: data.total, page: data.page, totalPages: data.totalPages })
      })
      .finally(() => setLoading(false))
  }, [searchParams])

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    if (key !== 'page') next.delete('page')
    setSearchParams(next)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateParam('search', search.trim())
  }

  return (
    <div className="container page-shell">
      <div className="shop-header">
        <div><span className="kicker">DISCOVER</span><h1>Shop all products</h1><p>{meta.total} carefully selected items</p></div>
        <form className="search-box" onSubmit={handleSearch}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" />
          <button>Search</button>
        </form>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <button className={!category ? 'filter-chip active' : 'filter-chip'} onClick={() => updateParam('category', '')}>All</button>
          {categories.map((c) => <button key={c} className={category === c ? 'filter-chip active' : 'filter-chip'} onClick={() => updateParam('category', c)}>{c}</button>)}
        </div>
        <select value={sort} onChange={(e) => updateParam('sort', e.target.value)} className="sort-select">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {loading ? <Loader label="Finding products" /> : products.length ? (
        <>
          <div className="product-grid">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          {meta.totalPages > 1 && (
            <div className="pagination">
              <button disabled={page <= 1} onClick={() => updateParam('page', page - 1)}>← Previous</button>
              <span>Page {page} of {meta.totalPages}</span>
              <button disabled={page >= meta.totalPages} onClick={() => updateParam('page', page + 1)}>Next →</button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state"><div className="empty-icon">⌕</div><h3>No products found</h3><p>Try a different search or category.</p><button className="btn btn-primary" onClick={() => { setSearch(''); setSearchParams({}) }}>Clear filters</button></div>
      )}
    </div>
  )
}
