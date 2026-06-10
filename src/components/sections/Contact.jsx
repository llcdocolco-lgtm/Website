import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Contact() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    const f = e.target
    const subject = encodeURIComponent(`Inquiry from ${f.name.value}`)
    const body    = encodeURIComponent(`${f.message.value}\n\n-- ${f.name.value} | ${f.email.value}`)
    window.location.href = `mailto:llcdocolco@gmail.com?subject=${subject}&body=${body}`
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  return (
    <section id="contact" className="contact">
      <div className="container">
        <motion.div
          className="contact-inner"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <div className="contact-info">
            <div className="section-tag">Get in Touch</div>
            <h2 className="section-title">Let's talk business</h2>
            <p>Interested in wholesale pricing or have questions about our products?</p>
            <div className="contact-details">
              <div className="contact-item">
                <strong>General</strong>
                <a href="mailto:llcdocolco@gmail.com">llcdocolco@gmail.com</a>
              </div>
              <div className="contact-item">
                <strong>Wholesale</strong>
                <a href="mailto:llcdocolco@gmail.com">llcdocolco@gmail.com</a>
              </div>
              <div className="contact-item">
                <strong>Location</strong>
                <span>United States</span>
              </div>
              <div className="contact-item">
                <strong>Delivery</strong>
                <span>Pickup or WhatsApp-coordinated shipping</span>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="cname">Name</label>
              <input id="cname" name="name" type="text" required placeholder="Your name" />
            </div>
            <div className="form-group">
              <label htmlFor="cemail">Email</label>
              <input id="cemail" name="email" type="email" required placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label htmlFor="cmessage">Message</label>
              <textarea id="cmessage" name="message" rows="5" required placeholder="Tell us what you need..." />
            </div>
            <button type="submit" className="btn btn-primary" disabled={sent}>
              {sent ? 'Email client opened ✓' : 'Send Message'}
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}
