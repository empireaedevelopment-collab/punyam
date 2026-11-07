import { getProducts, getProductCategories } from "../../lib/woocommerce";
import ProductListClient from "../../components/ProductListClient";

export const metadata = {
  title: 'Products | Punyam Store',
  description: 'Browse our authentic spiritual products.',
};

export default async function ProductsPage() {
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
      <div className="text-center" style={{ marginBottom: "40px" }}>
        <div className="sectionSubtitle">
          <span className="line" style={{ display: 'inline-block' }}></span> SHOP <span className="line" style={{ display: 'inline-block' }}></span>
        </div>
        <h1 className="sectionTitle">Our Products</h1>
      </div>

      <ProductListClient initialProducts={initialProducts} categories={categories} />
    </div>
  );
}
