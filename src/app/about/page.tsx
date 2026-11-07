import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="container section-padding" style={{ marginTop: "80px", minHeight: "70vh" }}>
      {/* Hero Section */}
      <div className="text-center" style={{ marginBottom: "60px" }}>
        <div className="sectionSubtitle">
          <span className="line" style={{ display: 'inline-block' }}></span> ABOUT US <span className="line" style={{ display: 'inline-block' }}></span>
        </div>
        <h1 className="sectionTitle" style={{ marginBottom: "20px" }}>The Punyam Story</h1>
        <p style={{ maxWidth: "700px", margin: "0 auto", color: "var(--text-muted)", fontSize: "16px", lineHeight: "1.8" }}>
          We are building India's leading spiritual platform, integrating commerce, education, services, and community into a single premium user experience. Our mission is to make authentic spirituality accessible to everyone, no matter where they are on their journey.
        </p>
      </div>

      {/* Featured Image */}
      <div style={{ width: "100%", height: "400px", borderRadius: "12px", overflow: "hidden", marginBottom: "80px", position: "relative" }}>
        <img src="/hero_bg.png" alt="Punyam Spiritual Journey" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>

      {/* Mission & Vision */}
      <div className="grid-2" style={{ gap: "40px", marginBottom: "80px" }}>
        <div style={{ backgroundColor: "var(--white)", padding: "40px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "clamp(24px, 6.5vw, 32px)", marginBottom: "16px" }}>👁️</div>
          <h3 style={{ fontSize: "24px", fontFamily: "var(--font-playfair)", marginBottom: "16px" }}>Our Vision</h3>
          <p style={{ color: "var(--text-muted)", lineHeight: "1.7" }}>
            To create a globally recognized ecosystem where the timeless wisdom of ancient traditions seamlessly merges with modern convenience, fostering a community of enlightened and empowered individuals.
          </p>
        </div>
        <div style={{ backgroundColor: "var(--white)", padding: "40px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <div style={{ fontSize: "clamp(24px, 6.5vw, 32px)", marginBottom: "16px" }}>🎯</div>
          <h3 style={{ fontSize: "24px", fontFamily: "var(--font-playfair)", marginBottom: "16px" }}>Our Mission</h3>
          <p style={{ color: "var(--text-muted)", lineHeight: "1.7" }}>
            To curate the highest quality spiritual goods, partner with the most authentic astrologers, and organize the most transformative yatras, all while giving back to the community and supporting traditional artisans.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div style={{ textAlign: "center", marginBottom: "80px" }}>
        <h2 style={{ fontSize: "clamp(24px, 6.5vw, 32px)", fontFamily: "var(--font-playfair)", marginBottom: "40px" }}>Our Core Values</h2>
        <div className="grid-4" style={{ gap: "24px" }}>
          {[
            { icon: "✨", title: "Authenticity", desc: "100% genuine products and verified spiritual experts." },
            { icon: "🤝", title: "Community", desc: "Building meaningful connections through shared beliefs." },
            { icon: "🌿", title: "Sustainability", desc: "Eco-friendly packaging and support for local artisans." },
            { icon: "🙏", title: "Devotion", desc: "Every service we provide is rooted in deep reverence." }
          ].map((value, index) => (
            <div key={index} style={{ padding: "24px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>{value.icon}</div>
              <h4 style={{ fontSize: "18px", fontFamily: "var(--font-playfair)", marginBottom: "8px" }}>{value.title}</h4>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{value.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Leadership / Team */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h2 style={{ fontSize: "clamp(24px, 6.5vw, 32px)", fontFamily: "var(--font-playfair)", marginBottom: "40px" }}>Meet Our Guides</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap" }}>
          
          <div style={{ width: "250px" }}>
            <div style={{ width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 16px auto", border: "4px solid var(--white)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <img src="/avatar_1.png" alt="Dr. Priya Sharma" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <h4 style={{ fontSize: "18px", fontFamily: "var(--font-playfair)", marginBottom: "4px" }}>Dr. Priya Sharma</h4>
            <p style={{ color: "var(--primary-color)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600", marginBottom: "12px" }}>Chief Astrologer</p>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Over 20 years of experience in Vedic astrology and spiritual counseling.</p>
          </div>

          <div style={{ width: "250px" }}>
            <div style={{ width: "150px", height: "150px", borderRadius: "50%", overflow: "hidden", margin: "0 auto 16px auto", border: "4px solid var(--white)", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <img src="/avatar_2.png" alt="Rajeev Menon" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <h4 style={{ fontSize: "18px", fontFamily: "var(--font-playfair)", marginBottom: "4px" }}>Rajeev Menon</h4>
            <p style={{ color: "var(--primary-color)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", fontWeight: "600", marginBottom: "12px" }}>Head of Yatra</p>
            <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Expert in curating transformative spiritual journeys across the Himalayas.</p>
          </div>

        </div>
      </div>

    </div>
  );
}
