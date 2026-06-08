import { useEffect } from 'react'

export default function ShippingReturns() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="legal-page">
      <div className="container">
        <h1>Shipping &amp; Returns</h1>
        <p className="legal-date">Last updated: June 2026</p>

        <section>
          <h2>Pickup</h2>
          <p>All orders can be picked up from our US warehouse. After placing an order you will be contacted via WhatsApp to schedule your pickup appointment.</p>
        </section>

        <section>
          <h2>Shipping</h2>
          <p>Shipping is available and coordinated on a per-order basis via WhatsApp. Shipping costs are determined based on order size and destination. We will contact you with shipping details after your order is confirmed.</p>
        </section>

        <section>
          <h2>Processing Time</h2>
          <p>Orders are typically processed within 1–2 business days. You will receive a WhatsApp message once your order is ready.</p>
        </section>

        <section>
          <h2>Returns</h2>
          <p>Due to the nature of our products (cleaning supplies, packaging materials), all sales are final. If you receive a damaged or incorrect product, please contact us within 48 hours at <a href="mailto:info@docolco.com">info@docolco.com</a> and we will work to resolve the issue.</p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>For shipping inquiries: <a href="mailto:info@docolco.com">info@docolco.com</a><br />WhatsApp coordination begins after order confirmation.</p>
        </section>
      </div>
    </div>
  )
}
