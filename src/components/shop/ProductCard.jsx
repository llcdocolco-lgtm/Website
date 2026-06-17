import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useCart } from '../../hooks/useCart.jsx'

export default function ProductCard({ product, onSelect }) {
  const { addItem } = useCart()

  function handleAdd(e) {
    e.stopPropagation()
    addItem(product)
    toast.success(`${product.name} added to cart`)
  }

  return (
    <motion.div
      className="product-card"
      onClick={() => onSelect(product)}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
    >
      <div className="product-img-wrap">
        <span className="product-cat-badge">{product.categoryLabel}</span>
        <img
          src={`/${product.image}`}
          alt={product.name}
          loading="lazy"
          onError={e => { e.target.src = '/img/placeholder.svg' }}
        />
      </div>
      <div className="product-info">
        <div className="product-name">{product.name}</div>
        <p className="product-desc">{product.boxContents}</p>
        <div className="product-price">
          ${product.boxPrice.toFixed(2)}
          <span className="price-unit"> /box</span>
        </div>
        <div className="product-unit-price">${product.unitPrice.toFixed(2)} per unit</div>
        <button className="product-add-btn" onClick={handleAdd}>
          + Add to Cart
        </button>
      </div>
    </motion.div>
  )
}
