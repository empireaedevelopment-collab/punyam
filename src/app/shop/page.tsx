import { getProducts, getProductCategories } from "../../lib/woocommerce";
import ProductListClient from "../../components/ProductListClient";

export const metadata = {
  title: 'Store | Punyam Marketplace',
  description: 'Explore our exclusive range of authentic spiritual products.',
};

export default async function ShopPage() {
  let initialProducts = [];
  let categories = [];
  
  try {
    const [productsData, categoriesData] = await Promise.all([
      getProducts(),
      getProductCategories()
    ]);
    
    if (Array.isArray(productsData)) {
      initialProducts = productsData;
    }
    
    if (Array.isArray(categoriesData)) {
      categories = categoriesData.filter((c: any) => c.slug !== 'uncategorized');
    }
  } catch (error) {
    console.error("Error loading products:", error);
  }

  return (
    <div className="container section-padding" style={{ marginTop: "80px", minHeight: "80vh" }}>
      <div className="text-center" style={{ marginBottom: "60px" }}>
        <div className="sectionSubtitle" style={{ justifyContent: 'center' }}>
          <span className="line" style={{ display: 'inline-block' }}></span> PUNYAM STORE <span className="line" style={{ display: 'inline-block' }}></span>
        </div>
        <h1 className="sectionTitle" style={{ marginBottom: "1rem" }}>All Products</h1>
        <p style={{ color: "var(--text-muted)", maxWidth: "600px", margin: "0 auto", fontSize: "1.1rem" }}>
          Explore our exclusive range of authentic spiritual products.
        </p>
      </div>

      <ProductListClient initialProducts={initialProducts} categories={categories} />
      
      {initialProducts.length === 0 && (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <h3 style={{ fontFamily: "var(--font-playfair)", fontSize: "1.8rem", marginBottom: "1rem" }}>No Products Found</h3>
          <p style={{ color: "var(--text-muted)" }}>There are currently no products available in the store.</p>
        </div>
      )}
    </div>
  );
}
