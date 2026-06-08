import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../../hooks/useCart.jsx'

const PAYMENT_URL = '/.netlify/functions/create-payment-intent'

export default function CheckoutModal({ open, onClose }) {
  const { items, total } = useCart()
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [phone,   setPhone]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(PAYMENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart:          items.map(i => ({ id: i.id, qty: i.qty })),
          customerName:  name,
          customerEmail: email,
          customerPhone: phone,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Server error. Please try again.')
      window.location.href = data.url

    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="checkout-modal"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{ opacity: 0,    y: 40, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            <button className="modal-close" onClick={onClose}>✕</button>
            <h2>Complete Order</h2>

            <div className="checkout-summary">
              {items.map(i => (
                <div key={i.id} className="checkout-item">
                  <span>{i.name} × {i.qty}</span>
                  <span>${(i.boxPrice * i.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="checkout-total">
                <strong>Total</strong>
                <strong>${total.toFixed(2)}</strong>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="checkout-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text" required
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="John Smith"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="john@company.com"
                />
              </div>
              <div className="form-group">
                <label>WhatsApp Phone</label>
                <input
                  type="tel" required
                  value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              {error && <div className="checkout-error">{error}</div>}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={loading}
              >
                {loading ? 'Redirecting to Stripe...' : `Pay $${total.toFixed(2)} Securely`}
              </button>

              <p className="checkout-note">
                🔒 Secure payment via Stripe · Prices in USD
              </p>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
