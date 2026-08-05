import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useCart } from '../../hooks/useCart.jsx'
import { swatchColor } from '../../utils/swatchColor.js'

export default function ProductModal({ product, onClose }) {
  const { addItem } = useCart()
  const hasVariants = product && Array.isArray(product.images) && product.images.length > 1
  const [activeImage, setActiveImage] = useState(product?.image)

  useEffect(() => {
    setActiveImage(product?.image)
  }, [product])

  function handleAdd() {
    addItem(product)
    toast.success(`${product.name} added to cart`)
    onClose()
  }

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="product-modal"
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{ opacity: 0,    scale: 0.93, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            <button className="modal-close" onClick={onClose}>✕</button>
            <div className="product-modal-inner">
              <div className="product-modal-img">
                <img
                  src={`/${activeImage}`}
                  alt={product.name}
                  onError={e => { e.target.src = '/img/placeholder.svg' }}
                />
                {hasVariants && (
                  <div className="product-swatches product-swatches-modal">
                    {product.images.map(img => (
                      <button
                        key={img}
                        type="button"
                        className={`swatch-dot${img === activeImage ? ' is-active' : ''}`}
                        style={{ background: swatchColor(img) }}
                        aria-label="Choose scent"
                        onClick={() => setActiveImage(img)}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="product-modal-info">
                <span className="product-cat-badge" style={{ position: 'static' }}>{product.categoryLabel}</span>
                <h2>{product.name}</h2>
                <div className="modal-price">
                  ${product.boxPrice.toFixed(2)} <span>/box</span>
                </div>
                <p className="modal-unit-price">${product.unitPrice.toFixed(2)} per unit</p>
                <div className="modal-detail">
                  <strong>Box Contents:</strong> {product.boxContents}
                </div>
                <div className="modal-detail">
                  <strong>SKU:</strong> {product.id}
                </div>
                <button className="btn btn-primary" style={{ marginTop: '8px' }} onClick={handleAdd}>
                  Add to Cart
                </button>
                <p className="modal-note">Sold by the box · Pickup or WhatsApp delivery</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
