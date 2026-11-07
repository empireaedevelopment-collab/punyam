import Link from "next/link";

export default function ServicesPage() {
  return (
    <div className="container section-padding" style={{ marginTop: "80px", minHeight: "60vh" }}>
      <div className="text-center">
        <div className="sectionSubtitle">
          <span className="line" style={{ display: 'inline-block' }}></span> SERVICES <span className="line" style={{ display: 'inline-block' }}></span>
        </div>
        <h1 className="sectionTitle" style={{ marginBottom: "20px" }}>Spiritual Services & Consultations</h1>
        <p style={{ maxWidth: "600px", margin: "0 auto", color: "var(--text-muted)" }}>
          Book a consultation with our expert astrologers, organize sacred yatra journeys, or engage with our literature and cultural events all in one place.
        </p>
      </div>

      <div className="grid-2" style={{ marginTop: "60px" }}>
        <div style={{ backgroundColor: "var(--white)", padding: "40px", borderRadius: "8px", border: "1px solid var(--border-color)", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(28px, 8vw, 40px)", marginBottom: "16px" }}>✨</div>
          <h3 style={{ fontSize: "20px", fontFamily: "var(--font-playfair)", marginBottom: "12px" }}>Astrology</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
            Get accurate horoscope readings, daily panchang, and personalized astrological guidance powered by expert astrologers.
          </p>
          <Link href="/astrology/instant-report" className="btn btn-primary" style={{ display: 'inline-block' }}>INSTANT ASTRO REPORT</Link>
        </div>
        
        <div style={{ backgroundColor: "var(--white)", padding: "40px", borderRadius: "8px", border: "1px solid var(--border-color)", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(28px, 8vw, 40px)", marginBottom: "16px" }}>🏔️</div>
          <h3 style={{ fontSize: "20px", fontFamily: "var(--font-playfair)", marginBottom: "12px" }}>Yatra Bookings</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>
            Embark on sacred journeys and pilgrimages across India with our curated travel packages and trusted operators.
          </p>
          <Link href="/consultation" className="btn btn-primary" style={{ display: 'inline-block' }}>BOOK CONSULTATION</Link>
        </div>
      </div>
    </div>
  );
}
