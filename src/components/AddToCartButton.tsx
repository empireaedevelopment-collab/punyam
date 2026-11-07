"use client";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";

export default function AddToCartButton({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const router = useRouter();

  // Parse price like "₹1,499" into number 1499
  const numericPrice = Number(product.price.replace(/[^0-9.-]+/g,""));

  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart({
      id: product.id.toString(),
      name: product.title.rendered,
      price: numericPrice,
      image: product.image,
      quantity
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart({
      id: product.id.toString(),
      name: product.title.rendered,
      price: numericPrice,
      image: product.image,
      quantity
    });
    router.push('/checkout');
  };

  return (
    <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "40px", flexWrap: "wrap" }}>
      <div style={{ display: "flex", border: "1px solid var(--border-color)", borderRadius: "4px", overflow: "hidden", height: "48px" }}>
        <button 
          onClick={() => setQuantity(Math.max(1, quantity - 1))}
          style={{ width: "40px", backgroundColor: "#f9f9f9", borderRight: "1px solid var(--border-color)", cursor: "pointer", border: "none", fontSize: "18px" }}
        >-</button>
        <div style={{ width: "50px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>{quantity}</div>
        <button 
          onClick={() => setQuantity(quantity + 1)}
          style={{ width: "40px", backgroundColor: "#f9f9f9", borderLeft: "1px solid var(--border-color)", cursor: "pointer", border: "none", fontSize: "18px" }}
        >+</button>
      </div>
      
      <button onClick={handleAddToCart} className="btn btn-outline" style={{ height: "48px", padding: "0 32px", fontSize: "14px", cursor: "pointer", border: "2px solid var(--primary-color)", color: "var(--primary-color)", backgroundColor: "transparent", fontWeight: "bold", borderRadius: "4px", textTransform: "uppercase" }}>
        {isAdded ? "ADDED ✓" : "ADD TO CART"}
      </button>

      <button onClick={handleBuyNow} className="btn btn-primary" style={{ height: "48px", padding: "0 32px", fontSize: "14px", cursor: "pointer", border: "none", backgroundColor: "var(--primary-color)", color: "white", fontWeight: "bold", borderRadius: "4px", textTransform: "uppercase" }}>
        BUY NOW
      </button>
    </div>
  );
}
