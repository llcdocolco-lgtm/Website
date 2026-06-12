import { motion } from 'framer-motion'

const channels = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.867-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
      </svg>
    ),
    label:       'WhatsApp',
    description: 'Fastest response — order coordination & delivery',
    action:      'Chat now',
    href:        'https://wa.me/message/DOCOLCO',
    accent:      '#25D366',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
    label:       'General Inquiries',
    description: 'llcdocolco@gmail.com',
    action:      'Send email',
    href:        'mailto:llcdocolco@gmail.com',
    accent:      'var(--blue)',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
    label:       'Wholesale',
    description: 'llcdocolco@gmail.com',
    action:      'Send email',
    href:        'mailto:llcdocolco@gmail.com?subject=Wholesale%20Inquiry',
    accent:      'var(--gold)',
  },
]

export default function Contact() {
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
            <p>Interested in wholesale pricing or have questions about our products? Reach us through any of these channels — we typically respond the same day.</p>
            <div className="contact-details">
              <div className="contact-item">
                <strong>Location</strong>
                <span>United States</span>
              </div>
              <div className="contact-item">
                <strong>Delivery</strong>
                <span>Pickup available · Shipping coordinated via WhatsApp</span>
              </div>
              <div className="contact-item">
                <strong>Response time</strong>
                <span>Same day · Mon – Sat</span>
              </div>
            </div>
          </div>

          <div className="contact-channels">
            {channels.map((ch, i) => (
              <motion.a
                key={ch.label}
                href={ch.href}
                target={ch.href.startsWith('http') ? '_blank' : undefined}
                rel={ch.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="contact-channel"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -3 }}
                style={{ '--ch-accent': ch.accent }}
              >
                <div className="ch-icon">{ch.icon}</div>
                <div className="ch-body">
                  <span className="ch-label">{ch.label}</span>
                  <span className="ch-desc">{ch.description}</span>
                </div>
                <span className="ch-action">{ch.action} →</span>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
