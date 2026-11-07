"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Filter, Search, ChevronDown, ShoppingBag } from "lucide-react";
import { useCart } from "../context/CartContext";
import styles from "./ProductListClient.module.css";

const MOCK_PRODUCTS: any[] = [];

export default function ProductListClient({ initialProducts, categories }: { initialProducts: any[], categories: any[] }) {
  const { addToCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  // Initialize priceRange very high, will be corrected in useEffect if needed, 
  // but better to just use derived max value for the slider bounds.
  const [priceRange, setPriceRange] = useState<number>(Infinity);
  const [sortBy, setSortBy] = useState("latest");
  // On small screens the filters collapse behind a toggle instead of a fixed sidebar.
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Use real products if available, else empty array
  const productsToUse = initialProducts && initialProducts.length > 0 
    ? initialProducts.map(p => ({
        id: p.id,
        name: p.name,
        price: parseFloat(p.price || p.regular_price || "0"),
        category: p.categories?.[0]?.slug || "uncategorized",
        image: p.images?.[0]?.src || "https://images.unsplash.com/photo-1605335949573-3e1150c95094?auto=format&fit=crop&q=80",
        inStock: p.stock_status === "instock",
      }))
    : MOCK_PRODUCTS;

  // Use real categories, else empty
  const displayCategories = categories && categories.length > 0 
    ? categories 
    : [];

  const filteredProducts = useMemo(() => {
    let result = [...productsToUse];

    // Category Filter
    if (selectedCategory !== "all") {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Search Filter
    if (searchQuery) {
      result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    // Price Filter
    result = result.filter(p => p.price <= priceRange);

    // Sort
    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [productsToUse, selectedCategory, searchQuery, priceRange, sortBy]);

  const maxProductPrice = useMemo(() => {
    if (productsToUse.length === 0) return 10000;
    return Math.ceil(Math.max(...productsToUse.map(p => p.price)));
  }, [productsToUse]);

  const minProductPrice = useMemo(() => {
    if (productsToUse.length === 0) return 0;
    return Math.floor(Math.min(...productsToUse.map(p => p.price)));
  }, [productsToUse]);

  // Use the actual range based on products if priceRange is Infinity
  const currentMaxPrice = priceRange === Infinity ? maxProductPrice : priceRange;
  return (
    <div className={styles.layout}>

      {/* Phones and small tablets: filters open from this button. */}
      <button
        type="button"
        className={styles.filterToggle}
        onClick={() => setFiltersOpen(open => !open)}
        aria-expanded={filtersOpen}
      >
        <Filter size={16} /> {filtersOpen ? "Hide filters" : "Filter products"}
      </button>
      
      {/* LEFT CONTENT: PRODUCTS GRID */}
      <div className={styles.products}>
        
        {/* Top Bar for Mobile Filter Toggle & Sort */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "2rem",
          padding: "1rem", flexWrap: "wrap", gap: "0.75rem",
          backgroundColor: "var(--white)",
          borderRadius: "8px",
          border: "1px solid var(--border-color)"
        }}>
          <div style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Showing <strong>{filteredProducts.length}</strong> products
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Sort by:</span>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: "1px solid var(--border-color)",
                outline: "none",
                cursor: "pointer",
                backgroundColor: "var(--bg-color)"
              }}
            >
              <option value="latest">Latest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <div key={product.id} style={{
                backgroundColor: "var(--white)",
                border: "1px solid var(--border-color)",
                borderRadius: "12px",
                overflow: "hidden",
                transition: "box-shadow 0.3s ease",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"}
              >
                <Link href={`/products/${product.id}`} style={{ display: "block", position: "relative", height: "240px" }}>
                  <img src={product.image} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {!product.inStock && (
                    <div style={{
                      position: "absolute", top: "12px", left: "12px",
                      backgroundColor: "rgba(0,0,0,0.7)", color: "white",
                      padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold"
                    }}>
                      OUT OF STOCK
                    </div>
                  )}
                </Link>
                <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <Link href={`/products/${product.id}`}>
                    <h3 style={{ fontSize: "1.1rem", fontFamily: "var(--font-playfair)", color: "var(--text-main)", marginBottom: "0.5rem", lineHeight: "1.4" }}>
                      {product.name}
                    </h3>
                  </Link>
                  <p style={{ color: "var(--primary-color)", fontWeight: "600", fontSize: "1.1rem", marginTop: "auto", marginBottom: "1rem" }}>
                    ₹{product.price.toLocaleString()}
                  </p>
                  <button 
                    onClick={() => product.inStock && addToCart({ id: product.id, name: product.name, price: product.price, image: product.image, quantity: 1 })}
                    disabled={!product.inStock}
                    style={{
                      width: "100%", padding: "0.75rem", borderRadius: "6px",
                      backgroundColor: product.inStock ? "var(--primary-color)" : "#e0e0e0",
                      color: product.inStock ? "white" : "#888",
                      border: "none", cursor: product.inStock ? "pointer" : "not-allowed",
                      fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                      transition: "background-color 0.2s"
                    }}
                  >
                    <ShoppingBag size={18} /> {product.inStock ? "ADD TO CART" : "UNAVAILABLE"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "clamp(1.5rem, 6vw, 4rem)", backgroundColor: "var(--white)", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
            <ShoppingBag size={48} color="var(--border-color)" style={{ margin: "0 auto 1rem" }} />
            <h3 style={{ fontSize: "1.5rem", fontFamily: "var(--font-playfair)", marginBottom: "0.5rem" }}>No Products Found</h3>
            <p style={{ color: "var(--text-muted)" }}>Try adjusting your filters or search query to find what you're looking for.</p>
            <button 
              onClick={() => { setSelectedCategory("all"); setSearchQuery(""); setPriceRange(Infinity); }}
              className="btn btn-outline" style={{ marginTop: "1.5rem" }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR: FILTERS */}
      <div
        className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ""}`}
        style={{
          backgroundColor: "var(--white)",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          padding: "1.5rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
          <Filter size={20} color="var(--primary-color)" />
          <h2 style={{ fontSize: "1.2rem", fontFamily: "var(--font-playfair)", margin: 0 }}>Filter Products</h2>
        </div>

        {/* Search Filter */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "1rem", color: "var(--text-main)" }}>Search</h3>
          <div style={{ position: "relative" }}>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem",
                borderRadius: "6px", border: "1px solid var(--border-color)",
                outline: "none", backgroundColor: "var(--bg-color)"
              }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
          </div>
        </div>

        {/* Category Filter */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "1rem", color: "var(--text-main)" }}>Categories</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label style={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
              <input 
                type="radio" 
                name="category" 
                checked={selectedCategory === "all"} 
                onChange={() => setSelectedCategory("all")}
                style={{ marginRight: "10px", accentColor: "var(--primary-color)" }}
              />
              <span style={{ color: selectedCategory === "all" ? "var(--primary-color)" : "var(--text-main)", fontWeight: selectedCategory === "all" ? "600" : "400" }}>
                All Categories
              </span>
            </label>
            {displayCategories.map(cat => (
              <label key={cat.slug} style={{ display: "flex", alignItems: "center", cursor: "pointer", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center" }}>
                  <input 
                    type="radio" 
                    name="category" 
                    checked={selectedCategory === cat.slug} 
                    onChange={() => setSelectedCategory(cat.slug)}
                    style={{ marginRight: "10px", accentColor: "var(--primary-color)" }}
                  />
                  <span style={{ color: selectedCategory === cat.slug ? "var(--primary-color)" : "var(--text-main)", fontWeight: selectedCategory === cat.slug ? "600" : "400" }}>
                    {cat.name}
                  </span>
                </div>
                {cat.count !== undefined && (
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", backgroundColor: "var(--bg-color)", padding: "2px 8px", borderRadius: "10px" }}>
                    {cat.count}
                  </span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div style={{ marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.95rem", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "1rem", color: "var(--text-main)" }}>Max Price: ₹{currentMaxPrice.toLocaleString()}</h3>
          <input 
            type="range" 
            min={minProductPrice} 
            max={maxProductPrice} 
            step="100"
            value={currentMaxPrice}
            onChange={(e) => setPriceRange(parseInt(e.target.value))}
            style={{ width: "100%", accentColor: "var(--primary-color)", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
            <span>₹{minProductPrice.toLocaleString()}</span>
            <span>₹{maxProductPrice.toLocaleString()}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
