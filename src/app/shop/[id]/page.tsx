import { getProductById, mockProducts } from "../../../lib/wordpress";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AddToCartButton from "../../../components/AddToCartButton";

export async function generateStaticParams() {
  return mockProducts.map((product) => ({
    id: product.id.toString(),
  }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const product = await getProductById(resolvedParams.id);

  if (!product) {
    return (
      <div className="container section-padding" style={{ marginTop: "80px", textAlign: "center", minHeight: "50vh" }}>
        <h1>Product Not Found</h1>
        <Link href="/shop" style={{ color: "var(--primary-color)", marginTop: "20px", display: "inline-block" }}>
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container section-padding" style={{ marginTop: "80px", minHeight: "70vh" }}>
      <Link href="/shop" style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", marginBottom: "30px", fontSize: "14px" }}>
        <ArrowLeft size={16} /> Back to Marketplace
      </Link>
      
      <div className="grid-2">
        <div style={{ backgroundColor: "#f9f9f9", borderRadius: "12px", padding: "40px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "400px", border: "1px solid var(--border-color)" }}>
          <img src={product.image} alt={product.title.rendered} style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain" }} />
        </div>
        
        <div style={{ padding: "20px 0" }}>
          <div className="sectionSubtitle">SPIRITUAL GOODS</div>
          <h1 style={{ fontSize: "clamp(26px, 7vw, 36px)", fontFamily: "var(--font-playfair)", margin: "16px 0", color: "var(--text-main)" }}>
            {product.title.rendered}
          </h1>
          <p style={{ fontSize: "28px", color: "var(--primary-color)", fontWeight: "600", marginBottom: "24px" }}>
            {product.price}
          </p>
          
          <div style={{ width: "100%", height: "1px", backgroundColor: "var(--border-color)", margin: "24px 0" }}></div>
          
          <p style={{ color: "var(--text-muted)", lineHeight: "1.8", marginBottom: "32px", fontSize: "15px" }}>
            {product.description}
          </p>
          
          <AddToCartButton product={product} />
          
          <div style={{ backgroundColor: "var(--bg-color)", padding: "24px", borderRadius: "8px", fontSize: "13px", color: "var(--text-muted)" }}>
            <p style={{ marginBottom: "8px" }}><strong>🚚 Fast Delivery:</strong> Ships within 24-48 hours across India.</p>
            <p style={{ marginBottom: "8px" }}><strong>🛡️ Authentic:</strong> 100% genuine and blessed products.</p>
            <p><strong>🔄 Returns:</strong> Easy 7-day return policy.</p>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      <div style={{ marginTop: "80px", paddingTop: "60px", borderTop: "1px solid var(--border-color)" }}>
        <h2 style={{ fontSize: "28px", fontFamily: "var(--font-playfair)", marginBottom: "32px", textAlign: "center", color: "var(--text-main)" }}>
          You May Also Like
        </h2>
        <div className="grid-4">
          {mockProducts
            .filter((p) => p.id.toString() !== resolvedParams.id)
            .slice(0, 4)
            .map((item) => (
              <div key={item.id} style={{ border: "1px solid var(--border-color)", borderRadius: "8px", padding: "16px", textAlign: "center", backgroundColor: "var(--white)", display: "flex", flexDirection: "column" }}>
                <Link href={`/shop/${item.id}`} style={{ display: "block", height: "180px", borderRadius: "4px", marginBottom: "16px", overflow: "hidden", backgroundColor: "#f9f9f9" }}>
                  <div style={{ height: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={item.image} alt={item.title.rendered} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                  </div>
                </Link>
                <Link href={`/shop/${item.id}`}>
                  <h3 style={{ fontSize: "14px", fontFamily: "var(--font-playfair)", marginBottom: "8px", minHeight: "40px", color: "var(--text-main)" }}>{item.title.rendered}</h3>
                </Link>
                <p style={{ color: "var(--primary-color)", fontWeight: "600", marginTop: "auto", marginBottom: "16px" }}>{item.price}</p>
                <Link href={`/shop/${item.id}`} className="btn btn-outline" style={{ width: "100%", fontSize: "11px", padding: "8px", display: "inline-block", textAlign: "center" }}>
                  VIEW DETAILS
                </Link>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
}
