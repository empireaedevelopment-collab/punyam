"use client";
import Link from "next/link";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useEffect, useState } from "react";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="container section-padding" style={{ marginTop: "80px", minHeight: "70vh" }}>Loading...</div>;
  }

  const tax = cartTotal * 0.18;
  const shipping = 40;
  const grandTotal = cartTotal + tax + shipping;

  return (
    <div className="container section-padding" style={{ marginTop: "80px", minHeight: "70vh" }}>
      <h1 className="sectionTitle" style={{ marginBottom: "40px" }}>Your Shopping Cart</h1>
      
      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <p style={{ fontSize: "18px", color: "var(--text-muted)", marginBottom: "20px" }}>Your cart is empty.</p>
          <Link href="/shop" className="btn btn-primary" style={{ display: "inline-block" }}>
            BROWSE PRODUCTS
          </Link>
        </div>
      ) : (
        <div className="grid-3" style={{ gap: "40px" }}>
          <div style={{ gridColumn: "span 2" }}>
            {/* Cart Items */}
            {items.map((item) => (
              <div key={item.id} style={{ display: "flex", gap: "24px", padding: "24px", border: "1px solid var(--border-color)", borderRadius: "8px", marginBottom: "16px", backgroundColor: "var(--white)", alignItems: "center" }}>
                <div style={{ width: "100px", height: "100px", backgroundColor: "#f9f9f9", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={item.image} alt={item.name} style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain" }} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: "18px", fontFamily: "var(--font-playfair)", marginBottom: "8px" }}>{item.name}</h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ display: "flex", border: "1px solid var(--border-color)", borderRadius: "4px", overflow: "hidden", height: "32px" }}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: "0 12px", backgroundColor: "#f9f9f9", borderRight: "1px solid var(--border-color)", cursor: "pointer", border: "none" }}>-</button>
                      <div style={{ padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px" }}>{item.quantity}</div>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: "0 12px", backgroundColor: "#f9f9f9", borderLeft: "1px solid var(--border-color)", cursor: "pointer", border: "none" }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} style={{ color: "red", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", border: "none", background: "none", cursor: "pointer" }}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
                
                <div style={{ fontSize: "18px", fontWeight: "600", color: "var(--primary-color)" }}>
                  ₹{(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}

            <Link href="/shop" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--primary-color)", marginTop: "16px", fontSize: "14px", fontWeight: "500" }}>
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
          </div>
          
          {/* Order Summary */}
          <div style={{ gridColumn: "span 1" }}>
            <div style={{ backgroundColor: "var(--bg-color)", padding: "32px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <h3 style={{ fontSize: "20px", fontFamily: "var(--font-playfair)", marginBottom: "24px" }}>Order Summary</h3>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "var(--text-muted)", fontSize: "14px" }}>
                <span>Subtotal</span>
                <span>₹{cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", color: "var(--text-muted)", fontSize: "14px" }}>
                <span>Shipping</span>
                <span style={{ color: "var(--text-main)" }}>₹{shipping}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px", color: "var(--text-muted)", fontSize: "14px" }}>
                <span>GST (18%)</span>
                <span>₹{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              <div style={{ width: "100%", height: "1px", backgroundColor: "var(--border-color)", marginBottom: "24px" }}></div>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "32px", fontSize: "18px", fontWeight: "600", color: "var(--text-main)" }}>
                <span>Total</span>
                <span>₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              <Link href="/checkout" className="btn btn-primary" style={{ display: "block", textAlign: "center", width: "100%", padding: "16px", fontSize: "14px", cursor: "pointer", border: "none", textDecoration: "none" }}>
                PROCEED TO CHECKOUT
              </Link>
              
              <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "16px" }}>
                Secure payments powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
