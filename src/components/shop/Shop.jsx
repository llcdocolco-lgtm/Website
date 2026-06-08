import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useProducts } from '../../hooks/useProducts.js'
import FilterBar from './FilterBar.jsx'
import ProductCard from './ProductCard.jsx'
import ProductModal from './ProductModal.jsx'

const INITIAL_LIMIT = 24
const PAGE_SIZE = 12

function Skeleton() {
  return (
    <div className="product-card skeleton">
      <div className="product-img-wrap skeleton-img" />
      <div className="product-info">
        <div className="skeleton-line" style={{ width: '68%' }} />
        <div className="skeleton-line" style={{ width: '48%' }} />
        <div className="skeleton-line" style={{ width: '38%' }} />
        <div className="skeleton-line" style={{ width: '55%' }} />
      </div>
    </div>
  )
}

export default function Shop() {
  const { products, categories, loading, error } = useProducts()
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [visibleCount, setVisibleCount] = useState(INITIAL_LIMIT)

  const filtered = filter === 'all'
    ? products
    : products.filter(p => p.category.toLowerCase() === filter)

  useEffect(() => {
    setVisibleCount(INITIAL_LIMIT)
  }, [filter])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  return (
    <section id="shop" className="shop">
      <div className="container">
        <motion.div
          className="section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <div className="section-tag">Catalog</div>
          <h2 className="section-title">Our Products</h2>
          <p className="section-desc">Premium wholesale supplies — sold by the box</p>
        </motion.div>

        {!loading && !error && (
          <FilterBar categories={categories} active={filter} onChange={setFilter} />
        )}

        {error && (
          <div className="shop-error">
            Products temporarily unavailable. Contact us at{' '}
            <a href="mailto:info@docolco.com">info@docolco.com</a>
          </div>
        )}

        <div className="products-grid">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)
          ) : (
            <AnimatePresence mode="sync">
              {visible.map(p => (
                <ProductCard key={p.id} product={p} onSelect={setSelected} />
              ))}
            </AnimatePresence>
          )}
        </div>

        {!loading && hasMore && (
          <motion.div
            className="load-more-wrap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="load-more-btn"
              onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
            >
              Load More Products
            </button>
          </motion.div>
        )}
      </div>

      <ProductModal product={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
