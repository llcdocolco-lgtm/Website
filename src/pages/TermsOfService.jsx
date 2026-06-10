import { useEffect } from 'react'

export default function TermsOfService() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="legal-page">
      <div className="container">
        <h1>Terms of Service</h1>
        <p className="legal-date">Last updated: June 2026</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing this website and placing an order, you agree to these Terms of Service. If you do not agree, please do not use this site.</p>
        </section>

        <section>
          <h2>2. Products and Pricing</h2>
          <p>All products are sold by the box at USD prices as listed at the time of purchase. Prices may change without prior notice. We reserve the right to refuse or cancel orders at our discretion.</p>
        </section>

        <section>
          <h2>3. Payment</h2>
          <p>All payments are processed securely via Stripe. By providing payment information you represent that you are authorized to use the payment method. All sales are final.</p>
        </section>

        <section>
          <h2>4. Delivery</h2>
          <p>Products are available for pickup at our US warehouse. Shipping can be arranged and coordinated via WhatsApp after order confirmation. Delivery timelines depend on availability and location.</p>
        </section>

        <section>
          <h2>5. Limitation of Liability</h2>
          <p>Docolco LLC shall not be liable for indirect, incidental, or consequential damages arising from the use of this website or our products.</p>
        </section>

        <section>
          <h2>6. Contact</h2>
          <p>Questions? Contact us at <a href="mailto:llcdocolco@gmail.com">llcdocolco@gmail.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
