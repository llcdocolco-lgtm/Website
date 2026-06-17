import { motion } from 'framer-motion'

export default function About() {
  return (
    <section id="about" className="about">
      <div className="container">
        <motion.div
          className="about-inner"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <div className="about-text">
            <div className="section-tag">Who We Are</div>
            <h2 className="section-title">Your trusted supply<br />partner in the USA</h2>
            <p>
              Docolco LLC is a US-based marketer and distributor of cleaning,
              packaging, and protection products. We supply businesses across the
              country with high-quality essentials at competitive wholesale prices.
            </p>
            <p>
              Our products are available for pickup from our US warehouse, or we can
              coordinate shipping directly to your business via WhatsApp.
            </p>
            <div className="about-highlights">
              <div className="highlight">
                <span className="highlight-icon">📦</span>
                <div>
                  <strong>Wholesale Pricing</strong>
                  <p>Box-quantity rates for maximum value</p>
                </div>
              </div>
              <div className="highlight">
                <span className="highlight-icon">🏢</span>
                <div>
                  <strong>US Warehouse</strong>
                  <p>Pickup or coordinated shipping available</p>
                </div>
              </div>
              <div className="highlight">
                <span className="highlight-icon">💬</span>
                <div>
                  <strong>WhatsApp Support</strong>
                  <p>Delivery coordination made simple</p>
                </div>
              </div>
            </div>
          </div>

          <div className="about-visual" aria-hidden="true">
            <div className="about-card about-card-1"><span>Cleaning</span></div>
            <div className="about-card about-card-2"><span>Packaging</span></div>
            <div className="about-card about-card-3"><span>Protection</span></div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
