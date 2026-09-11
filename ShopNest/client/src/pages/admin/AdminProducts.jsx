import { useEffect, useMemo, useState } from 'react'
import Loader from '../../components/Loader'
import { api } from '../../services/api'
import { currency } from '../../utils/format'

const emptyForm = { name: '', description: '', price: '', imageUrl: '', category: 'Electronics', stock: '', isFeatured: false, isActive: true }

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => { setLoading(true); api('/products/admin/all').then(setProducts).finally(() => setLoading(false)) }
  useEffect(load, [])

  const filtered = useMemo(() => products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(search.toLowerCase())), [products, search])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setError(''); setModal(true) }
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, description: p.description, price: p.price, imageUrl: p.imageUrl, category: p.category, stock: p.stock, isFeatured: p.isFeatured, isActive: p.isActive }); setError(''); setModal(true) }

  const submit = async (e) => {
    e.preventDefault(); setSaving(true); setError('')
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) }
    try {
      if (editing) await api(`/products/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) })
      else await api('/products', { method: 'POST', body: JSON.stringify(payload) })
      setModal(false); load()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  const remove = async (p) => {
    if (!window.confirm(`Deactivate ${p.name}?`)) return
    await api(`/products/${p.id}`, { method: 'DELETE' }); load()
  }

  return (
    <>
      <div className="admin-page-head"><div><span className="kicker">CATALOG</span><h1>Products</h1><p>Create, edit, feature and deactivate catalog items.</p></div><button className="btn btn-primary" onClick={openCreate}>+ New product</button></div>
      <div className="admin-toolbar"><input placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} /><span>{filtered.length} products</span></div>
      {loading ? <Loader /> : <div className="table-card products-table">
        <div className="admin-table product-table-row head"><span>Product</span><span>Category</span><span>Price</span><span>Stock</span><span>Status</span><span>Actions</span></div>
        {filtered.map((p) => <div className="admin-table product-table-row" key={p.id}>
          <div className="admin-product-cell"><img src={p.imageUrl} alt=""/><span><strong>{p.name}</strong><small>#{p.id}</small></span></div>
          <span>{p.category}</span><strong>{currency(p.price)}</strong><span className={p.stock <= 10 ? 'low-stock' : ''}>{p.stock}</span><span><i className={p.isActive ? 'active-dot' : 'inactive-dot'} />{p.isActive ? 'Active' : 'Inactive'}{p.isFeatured ? ' · Featured' : ''}</span>
          <div className="table-actions"><button onClick={() => openEdit(p)}>Edit</button>{p.isActive && <button className="danger-text" onClick={() => remove(p)}>Deactivate</button>}</div>
        </div>)}
      </div>}

      {modal && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setModal(false)}>
        <div className="modal-card">
          <div className="modal-head"><div><span className="kicker">{editing ? 'EDIT' : 'CREATE'}</span><h2>{editing ? 'Update product' : 'New product'}</h2></div><button onClick={() => setModal(false)}>×</button></div>
          {error && <div className="alert error">{error}</div>}
          <form onSubmit={submit}>
            <label>Product name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Description<textarea rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></label>
            <div className="form-grid two"><label>Price (₹)<input type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></label><label>Stock<input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required /></label></div>
            <div className="form-grid two"><label>Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Electronics</option><option>Fashion</option><option>Home</option><option>Fitness</option><option>Other</option></select></label><label>Image URL<input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} required /></label></div>
            <div className="check-row"><label><input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}/> Featured product</label><label><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}/> Active</label></div>
            <div className="modal-actions"><button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create product'}</button></div>
          </form>
        </div>
      </div>}
    </>
  )
}
