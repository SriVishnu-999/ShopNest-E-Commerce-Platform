import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartContext = createContext(null)

function readCart() {
  try {
    return JSON.parse(localStorage.getItem('shopnest_cart')) || []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart)

  useEffect(() => {
    localStorage.setItem('shopnest_cart', JSON.stringify(items))
  }, [items])

  const addItem = (product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock, 20) }
            : item,
        )
      }
      return [...current, { ...product, quantity: Math.min(quantity, product.stock, 20) }]
    })
  }

  const updateQuantity = (id, quantity) => {
    setItems((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(1, Math.min(Number(quantity), item.stock, 20)) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (id) => setItems((current) => current.filter((item) => item.id !== id))
  const clearCart = () => setItems([])

  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const value = useMemo(
    () => ({ items, addItem, updateQuantity, removeItem, clearCart, count, subtotal }),
    [items, count, subtotal],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)
