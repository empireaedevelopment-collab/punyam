import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { Play, ArrowRight } from "lucide-react";
import { FaInstagram, FaYoutube, FaFacebook, FaWhatsapp, FaTelegram } from "react-icons/fa";
import { getProducts } from "../lib/woocommerce";

export default async function Home() {
  let featuredProducts: any[] = [];
  try {
    const products = await getProducts();
    if (Array.isArray(products)) {
      featuredProducts = products;
    }
  } catch (error) {
    console.error("Failed to load featured products:", error);
  }
  return (
    <div className={styles.main}>
      {/* HERO SECTION */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay}></div>
        <img src="/hero_bg.png" alt="Spiritual Background" className={styles.heroBg} />
        
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <div className={styles.heroSubtitle}>
              <span className={styles.line}></span>
              Discover. Connect. Elevate.
              <span className={styles.line}></span>
            </div>
            <h1 className={styles.heroTitle}>A WORLD OF<br />SPIRITUALITY</h1>
            <h2 className={styles.heroTagline}>All You Need. All in Punyam.</h2>
            <p className={styles.heroDesc}>
              Punyam is your one-stop destination for authentic spiritual products, astrology services, sacred journeys, enriching literature, cultural programs and a vibrant spiritual community.
            </p>
            <div className={styles.heroActions}>
              <Link href="/consultation" className="btn btn-primary" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', color: '#000', border: 'none' }}>BOOK CONSULTATION</Link>
            </div>
          </div>
        </div>
      </section>

      {/* LATEST VIDEOS SECTION */}
      <section className={`section-padding ${styles.videosSection}`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionSubtitle}>LATEST FROM PUNYAM</div>
              <h2 className={styles.sectionTitle}>Our Latest Videos</h2>
            </div>
            <button className="btn btn-outline">VIEW ALL VIDEOS</button>
          </div>
          
          <div className="grid-4">
            <div className={styles.videoCard}>
              <div className={styles.videoThumb}>
                <img src="/video_1.png" alt="The Power of Daily Prayers" />
                <div className={styles.videoDuration}>6:45</div>
                <div className={styles.playIcon}><Play size={24} /></div>
              </div>
              <h3 className={styles.videoTitle}>The Power of Daily Prayers</h3>
              <p className={styles.videoMeta}>2.4K views • 2 days ago</p>
            </div>
            <div className={styles.videoCard}>
              <div className={styles.videoThumb}>
                <img src="/video_2.png" alt="Understanding Your Horoscope" />
                <div className={styles.videoDuration}>8:30</div>
                <div className={styles.playIcon}><Play size={24} /></div>
              </div>
              <h3 className={styles.videoTitle}>Understanding Your Horoscope</h3>
              <p className={styles.videoMeta}>3.1K views • 5 days ago</p>
            </div>
            <div className={styles.videoCard}>
              <div className={styles.videoThumb}>
                <img src="/video_3.png" alt="Sacred Yatra to Kedarnath" />
                <div className={styles.videoDuration}>7:12</div>
                <div className={styles.playIcon}><Play size={24} /></div>
              </div>
              <h3 className={styles.videoTitle}>Sacred Yatra to Kedarnath</h3>
              <p className={styles.videoMeta}>4.2K views • 1 week ago</p>
            </div>
            <div className={styles.videoCard}>
              <div className={styles.videoThumb}>
                <img src="/video_4.png" alt="Importance of Our Culture" />
                <div className={styles.videoDuration}>5:50</div>
                <div className={styles.playIcon}><Play size={24} /></div>
              </div>
              <h3 className={styles.videoTitle}>Importance of Our Culture</h3>
              <p className={styles.videoMeta}>1.8K views • 1 week ago</p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className={`section-padding`}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionSubtitle}>FEATURED PRODUCTS</div>
              <h2 className={styles.sectionTitle}>Shop the Best</h2>
            </div>
            <Link href="/shop" className="btn btn-outline">VIEW ALL PRODUCTS</Link>
          </div>

          <div className="product-slider">
            {featuredProducts.slice(0, 4).map((product: any) => {
              const productImage = product.images?.[0]?.src || "https://images.unsplash.com/photo-1605335949573-3e1150c95094?auto=format&fit=crop&q=80";
              return (
                <div key={product.id} className="hover-card" style={{ border: "1px solid var(--border-color)", borderRadius: "12px", padding: "16px", textAlign: "center", backgroundColor: "var(--white)", display: "flex", flexDirection: "column" }}>
                  <Link href={`/products/${product.id}`} style={{ display: "block", height: "200px", borderRadius: "8px", marginBottom: "16px", overflow: "hidden", backgroundColor: "#f9f9f9" }}>
                    <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={productImage} alt={product.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                    </div>
                  </Link>
                  <Link href={`/products/${product.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-playfair)", marginBottom: "8px", minHeight: "40px", color: "var(--text-main)" }}>{product.name}</h3>
                  </Link>
                  <p style={{ color: "var(--primary-color)", fontWeight: "600", marginTop: "auto", marginBottom: "16px", fontSize: "1.1rem" }}>₹{parseFloat(product.price || "0").toLocaleString()}</p>
                  <Link href={`/products/${product.id}`} className="btn btn-outline" style={{ width: "100%", fontSize: "0.85rem", padding: "10px", display: "inline-block", textAlign: "center", borderRadius: "6px" }}>
                    VIEW DETAILS
                  </Link>
                </div>
              );
            })}
            
            {featuredProducts.length === 0 && (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                Products are currently being updated. Please check back later.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CONNECT SECTION */}
      <section className={`section-padding ${styles.connectSection}`}>
        <div className="container flex">
          <div className={styles.connectInfo}>
            <div className={styles.sectionSubtitle}>STAY CONNECTED</div>
            <h2 className={styles.sectionTitle}>Connect With Us</h2>
            <p>Follow us on social media and be a part of our spiritual journey.</p>
            <button className={`btn btn-outline ${styles.followBtn}`}>FOLLOW US</button>
          </div>
          <div className={styles.connectGrid}>
            <div className={styles.socialCard}>
              <FaInstagram className={styles.socialIcon} size={32} />
              <h4>Instagram</h4>
              <p>@punyam.store</p>
            </div>
            <div className={styles.socialCard}>
              <FaYoutube className={styles.socialIcon} size={32} />
              <h4>YouTube</h4>
              <p>Punyam Official</p>
            </div>
            <div className={styles.socialCard}>
              <FaFacebook className={styles.socialIcon} size={32} />
              <h4>Facebook</h4>
              <p>@punyam.store</p>
            </div>
            <div className={styles.socialCard}>
              <FaWhatsapp className={styles.socialIcon} size={32} />
              <h4>WhatsApp</h4>
              <p>Join Channel</p>
            </div>
            <div className={styles.socialCard}>
              <FaTelegram className={styles.socialIcon} size={32} />
              <h4>Telegram</h4>
              <p>Punyam Community</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className={`section-padding ${styles.testimonialsSection}`}>
        <div className="container">
          <div className="text-center">
            <div className={styles.sectionSubtitle} style={{ justifyContent: 'center' }}>
              <span className={styles.line}></span> TESTIMONIALS <span className={styles.line}></span>
            </div>
            <h2 className={styles.sectionTitle}>What People Say</h2>
          </div>

          <div className="grid-4" style={{ marginTop: '40px' }}>
            <div className={styles.testimonialCard}>
              <div className={styles.quoteIcon}>"</div>
              <p className={styles.testimonialText}>
                Punyam Store has everything I need for my daily pooja. Products are authentic and delivered with great care.
              </p>
              <div className={styles.testimonialAuthor}>
                <img src="/avatar_1.png" alt="Anitha R." />
                <div>
                  <h4>Anitha R.</h4>
                  <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.quoteIcon}>"</div>
              <p className={styles.testimonialText}>
                The astrology consultation was very insightful and accurate. Highly recommend the expert guidance!
              </p>
              <div className={styles.testimonialAuthor}>
                <img src="/avatar_2.png" alt="Ramesh K." />
                <div>
                  <h4>Ramesh K.</h4>
                  <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.quoteIcon}>"</div>
              <p className={styles.testimonialText}>
                Our Kedarnath yatra was beautifully organized. Truly a blessed experience.
              </p>
              <div className={styles.testimonialAuthor}>
                <img src="/avatar_1.png" alt="Vijay S." />
                <div>
                  <h4>Vijay S.</h4>
                  <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            </div>
            <div className={styles.testimonialCard}>
              <div className={styles.quoteIcon}>"</div>
              <p className={styles.testimonialText}>
                Love the ebooks! They are well written and very easy to understand.
              </p>
              <div className={styles.testimonialAuthor}>
                <img src="/avatar_2.png" alt="Meera Iyer" />
                <div>
                  <h4>Meera Iyer</h4>
                  <div className={styles.stars}>⭐⭐⭐⭐⭐</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
}
