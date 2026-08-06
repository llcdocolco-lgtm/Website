import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('docolco_cart') || '[]')
    } catch {
      return []
    }
  })
  const [open, setOpen] = useState(false)

  useEffect(() => {
    sessionStorage.setItem('docolco_cart', JSON.stringify(items))
  }, [items])

  function addItem(product, selection = {}) {
    const { image = product.image, variant = null } = selection
    const cartKey = variant ? `${product.id}::${variant}` : String(product.id)
    setItems(prev => {
      const existing = prev.find(i => i.cartKey === cartKey)
      if (existing) {
        return prev.map(i =>
          i.cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i
        )
      }
      return [...prev, { ...product, image, variant, cartKey, qty: 1 }]
    })
  }

  function removeItem(cartKey) {
    setItems(prev => prev.filter(i => i.cartKey !== cartKey))
  }

  function updateQty(cartKey, qty) {
    if (qty <= 0) return removeItem(cartKey)
    setItems(prev => prev.map(i => i.cartKey === cartKey ? { ...i, qty } : i))
  }

  function clearCart() {
    setItems([])
  }

  const total = items.reduce((sum, i) => sum + i.boxPrice * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{ items, open, setOpen, addItem, removeItem, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
