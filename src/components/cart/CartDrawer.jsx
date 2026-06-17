import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../hooks/useCart.jsx'

export default function CartDrawer({ onCheckout }) {
  const { items, open, setOpen, removeItem, updateQty, total, count } = useCart()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            className="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
          >
            <div className="drawer-header">
              <h3>Cart ({count})</h3>
              <button className="drawer-close" onClick={() => setOpen(false)}>✕</button>
            </div>

            {items.length === 0 ? (
              <div className="drawer-empty">
                <span>🛒</span>
                <p>Your cart is empty</p>
                <button className="btn btn-primary" onClick={() => setOpen(false)}>
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="drawer-items">
                  <AnimatePresence>
                    {items.map(item => (
                      <motion.div
                        key={item.id}
                        className="drawer-item"
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <img
                          src={`/${item.image}`}
                          alt={item.name}
                          onError={e => { e.target.src = '/img/placeholder.svg' }}
                        />
                        <div className="drawer-item-info">
                          <div className="drawer-item-name">{item.name}</div>
                          <div className="drawer-item-price">${(item.boxPrice * item.qty).toFixed(2)}</div>
                          <div className="qty-controls">
                            <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                            <span>{item.qty}</span>
                            <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                          </div>
                        </div>
                        <button className="remove-btn" onClick={() => removeItem(item.id)}>✕</button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="drawer-footer">
                  <div className="drawer-total">
                    <span>Total</span>
                    <strong>${total.toFixed(2)}</strong>
                  </div>
                  <button
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    onClick={() => { setOpen(false); onCheckout() }}
                  >
                    Checkout
                  </button>
                  <p className="drawer-note">Sold by the box · USD only</p>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
