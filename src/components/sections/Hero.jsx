import { motion } from 'framer-motion'

const stagger = {
  animate: { transition: { staggerChildren: 0.14 } },
}

const item = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

function Ticker({ reverse, content, bg }) {
  const text = `${content}   ·   `.repeat(6)
  return (
    <div className="ticker-wrap" style={{ background: bg }}>
      <div className={`ticker-track${reverse ? ' reverse' : ''}`}>
        <span>{text}</span>
        <span aria-hidden="true">{text}</span>
      </div>
    </div>
  )
}

export default function Hero({ onShopClick }) {
  return (
    <section className="hero">
      <div className="hero-dots" aria-hidden="true" />

      <motion.div
        className="hero-content"
        variants={stagger}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={item} className="hero-tag">
          🇺🇸 Distributed across the USA
        </motion.div>

        <motion.h1 variants={item} className="hero-title">
          Clean. Pack.<br />
          <span className="hero-accent">Protect.</span>
        </motion.h1>

        <motion.p variants={item} className="hero-subtitle">
          Wholesale cleaning, packaging and protection supplies
          <br />delivered to American businesses.
        </motion.p>

        <motion.div variants={item} className="hero-ctas">
          <button className="btn btn-white" onClick={onShopClick}>
            Shop Now
          </button>
          <a href="mailto:wholesale@docolco.com" className="btn btn-outline">
            Get a Quote
          </a>
        </motion.div>

        <motion.div variants={item} className="hero-stats">
          <div className="stat">
            <span className="stat-number">500+</span>
            <span className="stat-label">Clients</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-number">13</span>
            <span className="stat-label">Products</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat-number">10+</span>
            <span className="stat-label">States</span>
          </div>
        </motion.div>
      </motion.div>

      <div className="hero-tickers">
        <Ticker bg="var(--red)"       reverse={false} content="CLEANING · PACKAGING · PROTECTION · DOCOLCO LLC" />
        <Ticker bg="var(--blue-dark)" reverse={true}  content="QUALITY PRODUCTS · USA DISTRIBUTOR · info@docolco.com" />
      </div>
    </section>
  )
}
