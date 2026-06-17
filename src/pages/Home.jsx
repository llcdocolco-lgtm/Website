import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Hero from '../components/sections/Hero.jsx'
import Shop from '../components/shop/Shop.jsx'
import About from '../components/sections/About.jsx'
import Contact from '../components/sections/Contact.jsx'
import CartDrawer from '../components/cart/CartDrawer.jsx'
import CheckoutModal from '../components/checkout/CheckoutModal.jsx'
import { useCart } from '../hooks/useCart.jsx'

export default function Home() {
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [successOrder, setSuccessOrder] = useState(null)
  const [searchParams, setSearchParams] = useSearchParams()
  const { clearCart } = useCart()

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccessOrder(searchParams.get('order_id') || 'DCO-ORDER')
      clearCart()
      setSearchParams({})
    }
  }, [])

  function scrollToShop() {
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <Hero onShopClick={scrollToShop} />
      <Shop />
      <About />
      <Contact />

      <CartDrawer onCheckout={() => setCheckoutOpen(true)} />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />

      <AnimatePresence>
        {successOrder && (
          <motion.div
            className="success-banner"
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
          >
            <div className="success-banner-inner">
              <strong>✓ Payment successful!</strong>
              <span>Order ID: <code>{successOrder}</code></span>
              <p>We'll contact you via WhatsApp to coordinate delivery.</p>
              <button onClick={() => setSuccessOrder(null)} aria-label="Dismiss">✕</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
