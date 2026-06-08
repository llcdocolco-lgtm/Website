import { useEffect } from 'react'

export default function PrivacyPolicy() {
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="legal-page">
      <div className="container">
        <h1>Privacy Policy</h1>
        <p className="legal-date">Last updated: June 2026</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>When you place an order we collect your name, email address, and phone number. Payment card information is processed securely by Stripe and is never stored on our servers.</p>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>We use your information solely to process your order and coordinate delivery. We do not sell or share your personal information with third parties except as strictly necessary to fulfill your order (Stripe for payment processing).</p>
        </section>

        <section>
          <h2>3. California Residents — CCPA</h2>
          <p>California residents have the right to know what personal information we collect, the right to request deletion of that information, and the right to opt out of any sale of personal information. We do not sell personal information. To exercise your rights, contact us at <a href="mailto:info@docolco.com">info@docolco.com</a>.</p>
        </section>

        <section>
          <h2>4. Data Security</h2>
          <p>We use industry-standard security measures to protect your information. All payment data is encrypted and processed by Stripe, a PCI-DSS compliant payment processor.</p>
        </section>

        <section>
          <h2>5. Cookies</h2>
          <p>We use sessionStorage to maintain your shopping cart within a single browser session. No persistent tracking cookies are set.</p>
        </section>

        <section>
          <h2>6. Contact</h2>
          <p>Questions about this policy? Email us at <a href="mailto:info@docolco.com">info@docolco.com</a>.</p>
        </section>
      </div>
    </div>
  )
}
