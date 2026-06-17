import { motion } from 'framer-motion'

export default function FilterBar({ categories, active, onChange }) {
  const options = ['all', ...categories.map(c => c.toLowerCase())]

  return (
    <div className="filter-bar">
      {options.map(cat => (
        <motion.button
          key={cat}
          className={`filter-btn${active === cat ? ' active' : ''}`}
          onClick={() => onChange(cat)}
          whileTap={{ scale: 0.95 }}
        >
          {cat === 'all' ? 'All Products' : cat.charAt(0).toUpperCase() + cat.slice(1)}
        </motion.button>
      ))}
    </div>
  )
}
