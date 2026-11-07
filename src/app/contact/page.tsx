export default function ContactPage() {
  return (
    <div className="container section-padding" style={{ marginTop: "80px", minHeight: "70vh" }}>
      <div className="text-center" style={{ marginBottom: "60px" }}>
        <div className="sectionSubtitle">
          <span className="line" style={{ display: 'inline-block' }}></span> GET IN TOUCH <span className="line" style={{ display: 'inline-block' }}></span>
        </div>
        <h1 className="sectionTitle" style={{ marginBottom: "20px" }}>Contact Us</h1>
        <p style={{ maxWidth: "600px", margin: "0 auto", color: "var(--text-muted)" }}>
          Have a question about our products, astrology services, or upcoming yatras? Our dedicated support team is here to help you on your spiritual journey.
        </p>
      </div>

      <div className="grid-2 product-layout" style={{ alignItems: "start" }}>
        {/* Contact Form */}
        <div className="product-details-card">
          <h3 style={{ fontSize: "24px", fontFamily: "var(--font-playfair)", marginBottom: "24px" }}>Send us a Message</h3>
          <form>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "8px", color: "var(--text-main)", fontWeight: "500" }}>First Name *</label>
                <input type="text" required style={{ width: "100%", padding: "14px", border: "1px solid var(--border-color)", borderRadius: "6px", backgroundColor: "#fdfdfd" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "8px", color: "var(--text-main)", fontWeight: "500" }}>Last Name *</label>
                <input type="text" required style={{ width: "100%", padding: "14px", border: "1px solid var(--border-color)", borderRadius: "6px", backgroundColor: "#fdfdfd" }} />
              </div>
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", marginBottom: "8px", color: "var(--text-main)", fontWeight: "500" }}>Email Address *</label>
              <input type="email" required style={{ width: "100%", padding: "14px", border: "1px solid var(--border-color)", borderRadius: "6px", backgroundColor: "#fdfdfd" }} />
            </div>
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", marginBottom: "8px", color: "var(--text-main)", fontWeight: "500" }}>Your Message *</label>
              <textarea required rows={5} style={{ width: "100%", padding: "14px", border: "1px solid var(--border-color)", borderRadius: "6px", backgroundColor: "#fdfdfd", resize: "vertical" }}></textarea>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "16px", fontSize: "15px", fontWeight: "600" }}>
              SEND MESSAGE
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="product-details-card">
          <div style={{ marginBottom: "40px" }}>
            <h3 style={{ fontSize: "24px", fontFamily: "var(--font-playfair)", marginBottom: "24px" }}>Contact Information</h3>
            <p style={{ color: "var(--text-muted)", marginBottom: "32px", lineHeight: "1.7" }}>
              We'd love to hear from you. You can reach out to us via email, phone, or visit our headquarters. We aim to respond to all inquiries within 24 hours.
            </p>
            
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <div style={{ fontSize: "24px" }}>📍</div>
              <div>
                <h4 style={{ fontSize: "16px", marginBottom: "4px", fontWeight: "600" }}>Headquarters</h4>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", lineHeight: "1.6" }}>108 Spiritual Vihar, Temple Road<br />Rishikesh, Uttarakhand 249201<br />India</p>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <div style={{ fontSize: "24px" }}>📞</div>
              <div>
                <h4 style={{ fontSize: "16px", marginBottom: "4px", fontWeight: "600" }}>Phone Support</h4>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>+91 98765 43210 (Mon-Sat, 9AM-6PM)</p>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
              <div style={{ fontSize: "24px" }}>✉️</div>
              <div>
                <h4 style={{ fontSize: "16px", marginBottom: "4px", fontWeight: "600" }}>Email Us</h4>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>support@punyam.com</p>
              </div>
            </div>
          </div>

          <div style={{ width: "100%", height: "250px", backgroundColor: "#e0e0e0", borderRadius: "12px", overflow: "hidden" }}>
            {/* Embedded Google Map Placeholder */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110595.69806456728!2d78.21271295!3d30.0869281!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39093e67cf93f111%3A0xcc78804a6f941bfe!2sRishikesh%2C%20Uttarakhand!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>
      </div>
    </div>
  );
}
