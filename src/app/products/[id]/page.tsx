import { getProductById, getProducts } from "../../../lib/woocommerce";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AddToCartButton from "../../../components/AddToCartButton";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  let product: any = null;
  let similarProducts: any[] = [];

  try {
    product = await getProductById(parseInt(resolvedParams.id));
    
    // Fallback to mock product if woo commerce isn't working or product not found
    if (!product || product.data?.status === 404) {
      const MOCK_PRODUCTS = [
        { id: 101, name: "Premium Brass Rudraksha Mala", price: "1499", description: "Authentic 108 bead brass rudraksha mala, sourced directly from the Himalayas. Perfect for daily japa and meditation.", category: "rudraksha", image: "https://images.unsplash.com/photo-1605335949573-3e1150c95094?auto=format&fit=crop&q=80", inStock: true },
        { id: 102, name: "Copper Pooja Thali Set", price: "2199", description: "Beautiful handcrafted copper pooja thali set including diya, incense holder, and traditional bell for your daily rituals.", category: "pooja-essentials", image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80", inStock: true },
        { id: 103, name: "Carved Wooden Incense Holder", price: "599", description: "Intricately carved wooden incense holder that catches ash and spreads fragrance evenly throughout your sacred space.", category: "pooja-essentials", image: "https://images.unsplash.com/photo-1615569427027-e17f53f3e1bf?auto=format&fit=crop&q=80", inStock: true },
        { id: 104, name: "Clear Sphatik Shivling", price: "3499", description: "Premium quality, crystal clear quartz (sphatik) shivling. Brings positive energy, peace, and prosperity to your home.", category: "idols", image: "https://images.unsplash.com/photo-1614088924300-344cbcc63e52?auto=format&fit=crop&q=80", inStock: false },
        { id: 105, name: "Sacred 5 Mukhi Rudraksha", price: "999", description: "Traditional 5 mukhi rudraksha mala strung on durable thread. A must-have for every spiritual practitioner.", category: "rudraksha", image: "https://images.unsplash.com/photo-1605335949573-3e1150c95094?auto=format&fit=crop&q=80", inStock: true },
        { id: 106, name: "Antique Diya Set", price: "1299", description: "Set of 2 antique-finished diyas. Perfect for Diwali, festivals, or daily evening pooja.", category: "pooja-essentials", image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80", inStock: true },
      ];
      
      const mockProd = MOCK_PRODUCTS.find(p => p.id === parseInt(resolvedParams.id));
      if (mockProd) {
        product = {
          id: mockProd.id,
          name: mockProd.name,
          price: mockProd.price,
          description: mockProd.description,
          images: [{ src: mockProd.image }],
          stock_status: mockProd.inStock ? 'instock' : 'outofstock'
        };
        similarProducts = MOCK_PRODUCTS.filter(p => p.id !== mockProd.id).map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            images: [{ src: p.image }]
        }));
      }
    } else {
        // Fetch real similar products if the product is real
        const allProducts = await getProducts();
        if (Array.isArray(allProducts)) {
            similarProducts = allProducts.filter((p: any) => p.id !== product.id);
        }
    }
  } catch (error) {
    console.error("Error loading product:", error);
  }

  if (!product) {
    return (
      <div className="container section-padding" style={{ marginTop: "80px", textAlign: "center", minHeight: "50vh" }}>
        <h1>Product Not Found</h1>
        <Link href="/products" style={{ color: "var(--primary-color)", marginTop: "20px", display: "inline-block" }}>
          Return to Shop
        </Link>
      </div>
    );
  }

  const inStock = product.stock_status === 'instock';
  const productImage = product.images?.[0]?.src || "https://images.unsplash.com/photo-1605335949573-3e1150c95094?auto=format&fit=crop&q=80";
  // WooCommerce description often contains HTML tags
  const descriptionHtml = product.description || "Authentic spiritual product carefully sourced and verified for your spiritual journey.";

  // Format cart product to match what AddToCartButton expects
  const cartProduct = {
      id: product.id,
      title: { rendered: product.name },
      price: product.price,
      image: productImage
  };

  return (
    <div className="container section-padding" style={{ marginTop: "80px", minHeight: "70vh" }}>
      <Link href="/products" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", marginBottom: "30px", fontSize: "14px", textDecoration: "none" }}>
        <ArrowLeft size={16} /> Back to Products
      </Link>
      
      <div className="grid-2 product-layout">
        <div style={{ backgroundColor: "var(--white)", borderRadius: "16px", padding: "40px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "500px", border: "1px solid var(--border-color)", boxShadow: "0 4px 12px rgba(0,0,0,0.03)", position: "relative" }}>
          <img src={productImage} alt={product.name} style={{ maxWidth: "100%", maxHeight: "500px", objectFit: "contain" }} />
          {!inStock && (
            <div style={{
                position: "absolute", top: "20px", right: "20px",
                backgroundColor: "rgba(0,0,0,0.8)", color: "white",
                padding: "8px 16px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "bold",
                letterSpacing: "1px"
            }}>
                OUT OF STOCK
            </div>
          )}
        </div>
        
        <div className="product-details-card">
          <div className="sectionSubtitle" style={{ marginBottom: "1rem" }}>AUTHENTIC SPIRITUAL ITEM</div>
          <h1 style={{ fontSize: "2.5rem", fontFamily: "var(--font-playfair)", margin: "0 0 1rem 0", color: "var(--text-main)", lineHeight: "1.2" }}>
            {product.name}
          </h1>
          <p style={{ fontSize: "2rem", color: "var(--primary-color)", fontWeight: "600", marginBottom: "2rem" }}>
            ₹{parseFloat(product.price).toLocaleString()}
          </p>
          
          <div style={{ width: "100%", height: "1px", backgroundColor: "var(--border-color)", margin: "2rem 0" }}></div>
          
          <div style={{ marginBottom: "2.5rem" }}>
            {inStock ? (
              <AddToCartButton product={cartProduct} />
            ) : (
               <button disabled style={{ width: "100%", padding: "16px", backgroundColor: "#e0e0e0", color: "#888", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "600", cursor: "not-allowed" }}>
                 CURRENTLY UNAVAILABLE
               </button>
            )}
          </div>
          
          <div 
            style={{ color: "var(--text-muted)", lineHeight: "1.8", marginBottom: "2.5rem", fontSize: "1rem" }}
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
          
          <div style={{ backgroundColor: "var(--bg-color)", padding: "1.5rem", borderRadius: "12px", fontSize: "0.95rem", color: "var(--text-muted)", marginTop: "2.5rem", border: "1px solid var(--border-color)" }}>
            <div style={{ marginBottom: "12px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ fontSize: "1.2rem" }}>🚚</span> 
              <span><strong>Fast Delivery:</strong> Ships within 24-48 hours.</span>
            </div>
            <div style={{ marginBottom: "12px", display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ fontSize: "1.2rem" }}>🛡️</span> 
              <span><strong>Authenticity Guaranteed:</strong> 100% genuine and blessed.</span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <span style={{ fontSize: "1.2rem" }}>🔄</span> 
              <span><strong>Easy Returns:</strong> 7-day hassle-free return policy.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      {similarProducts && similarProducts.length > 0 && (
          <div style={{ marginTop: "100px", paddingTop: "60px", borderTop: "1px solid var(--border-color)" }}>
            <h2 style={{ fontSize: "2rem", fontFamily: "var(--font-playfair)", marginBottom: "3rem", textAlign: "center", color: "var(--text-main)" }}>
              You May Also Like
            </h2>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 250px), 1fr))",
                gap: "2rem"
            }}>
              {similarProducts.slice(0, 4).map((item: any) => {
                  const itemImage = item.images?.[0]?.src || "https://images.unsplash.com/photo-1605335949573-3e1150c95094?auto=format&fit=crop&q=80";
                  return (
                    <div key={item.id} className="hover-card" style={{ border: "1px solid var(--border-color)", borderRadius: "12px", padding: "16px", textAlign: "center", backgroundColor: "var(--white)", display: "flex", flexDirection: "column" }}>
                        <Link href={`/products/${item.id}`} style={{ display: "block", height: "200px", borderRadius: "8px", marginBottom: "16px", overflow: "hidden", backgroundColor: "#f9f9f9" }}>
                        <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img src={itemImage} alt={item.name} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                        </div>
                        </Link>
                        <Link href={`/products/${item.id}`}>
                        <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-playfair)", marginBottom: "8px", minHeight: "40px", color: "var(--text-main)" }}>{item.name}</h3>
                        </Link>
                        <p style={{ color: "var(--primary-color)", fontWeight: "600", marginTop: "auto", marginBottom: "16px", fontSize: "1.1rem" }}>₹{parseFloat(item.price).toLocaleString()}</p>
                        <Link href={`/products/${item.id}`} className="btn btn-outline" style={{ width: "100%", fontSize: "0.85rem", padding: "10px", display: "inline-block", textAlign: "center", borderRadius: "6px" }}>
                        VIEW DETAILS
                        </Link>
                    </div>
                  );
              })}
            </div>
          </div>
      )}
    </div>
  );
}
