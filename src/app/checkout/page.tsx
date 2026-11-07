"use client";
import React, { useState, useEffect, useRef } from "react";
import { useCart } from "../../context/CartContext";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShoppingBag } from "lucide-react";

export default function CheckoutPage() {
  const { items, cartTotal, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    address: "", city: "", state: "", pinCode: ""
  });

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="container section-padding" style={{ marginTop: "80px", minHeight: "70vh" }}>Loading...</div>;

  const tax = cartTotal * 0.18;
  const shipping = 40;
  const grandTotal = cartTotal + tax + shipping;

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create Razorpay order server-side
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Math.round(grandTotal), bookingId: `ORDER_${Date.now()}` })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay. Check your connection.");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Punyam Store",
        description: `Order for ${items.length} item(s)`,
        order_id: orderData.orderId,
        prefill: {
          name: `${form.firstName} ${form.lastName}`.trim(),
          email: form.email,
          contact: `+91${form.phone}`,
        },
        notes: {
          address: `${form.address}, ${form.city} - ${form.pinCode}`,
        },
        theme: { color: "#c19b63" },
        handler: async (response: any) => {
          // Payment successful
          try {
            const wcRes = await fetch('/api/woocommerce/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items,
                form,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
              })
            });
            const wcData = await wcRes.json();
            if (!wcRes.ok) {
              console.error('WooCommerce order failed:', wcData);
            }
          } catch (e) {
            console.error('Error sending order to WooCommerce:', e);
          }

          clearCart();
          setIsSuccess(true);
          setIsLoading(false);
        },
        modal: {
          ondismiss: () => { setIsLoading(false); }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        alert(`Payment failed: ${response.error.description}`);
        setIsLoading(false);
      });
      rzp.open();

    } catch (err: any) {
      alert(err.message);
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="container section-padding" style={{ marginTop: "80px", minHeight: "70vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        <CheckCircle2 size={90} color="#8ba145" style={{ marginBottom: "24px" }} />
        <h1 className="sectionTitle" style={{ marginBottom: "16px" }}>Payment Successful!</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "8px", maxWidth: "460px", fontSize: "16px" }}>
          Thank you, <strong>{form.firstName}</strong>! Your order has been placed successfully.
        </p>
        <p style={{ color: "var(--text-muted)", marginBottom: "32px", maxWidth: "460px", fontSize: "14px" }}>
          A confirmation will be sent to <strong>{form.email}</strong>. Your spiritual goods will be dispatched shortly.
        </p>
        <Link href="/shop" className="btn btn-primary">
          CONTINUE SHOPPING
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container section-padding" style={{ marginTop: "80px", minHeight: "70vh", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "24px" }}>
        <ShoppingBag size={64} color="var(--text-muted)" />
        <h1 className="sectionTitle">Your cart is empty</h1>
        <p style={{ color: "var(--text-muted)" }}>Add some items before checking out.</p>
        <Link href="/shop" className="btn btn-primary">BACK TO SHOP</Link>
      </div>
    );
  }

  return (
    <div className="container section-padding" style={{ marginTop: "80px", minHeight: "70vh" }}>
      <Link href="/cart" style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "var(--text-muted)", marginBottom: "24px", fontSize: "14px" }}>
        <ArrowLeft size={16} /> Back to Cart
      </Link>
      <h1 className="sectionTitle" style={{ marginBottom: "40px" }}>Checkout</h1>

      <div className="grid-3" style={{ gap: "40px" }}>
        {/* Left: Form */}
        <div style={{ gridColumn: "span 2" }}>
          <form id="checkout-form" ref={formRef} onSubmit={handlePlaceOrder}>
            <div style={{ backgroundColor: "var(--white)", padding: "32px", borderRadius: "8px", border: "1px solid var(--border-color)", marginBottom: "24px" }}>
              <h3 style={{ fontSize: "20px", fontFamily: "var(--font-playfair)", marginBottom: "24px" }}>Billing & Shipping Details</h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "8px", color: "var(--text-main)" }}>First Name *</label>
                  <input required type="text" value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} style={{ width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "4px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "8px", color: "var(--text-main)" }}>Last Name *</label>
                  <input required type="text" value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} style={{ width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "4px" }} />
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "8px", color: "var(--text-main)" }}>Email Address *</label>
                <input required type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} style={{ width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "4px" }} />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "8px", color: "var(--text-main)" }}>Phone Number *</label>
                <input required type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} style={{ width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "4px" }} />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", marginBottom: "8px", color: "var(--text-main)" }}>Street Address *</label>
                <input required type="text" placeholder="House number and street name" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} style={{ width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "4px" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "8px", color: "var(--text-main)" }}>Town / City *</label>
                  <input required type="text" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} style={{ width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "4px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "8px", color: "var(--text-main)" }}>State *</label>
                  <input required type="text" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} style={{ width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "4px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", marginBottom: "8px", color: "var(--text-main)" }}>PIN Code *</label>
                  <input required type="text" value={form.pinCode} onChange={e => setForm(p => ({ ...p, pinCode: e.target.value }))} style={{ width: "100%", padding: "12px", border: "1px solid var(--border-color)", borderRadius: "4px" }} />
                </div>
              </div>
            </div>

            {/* Payment section */}
            <div style={{ backgroundColor: "var(--white)", padding: "32px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <h3 style={{ fontSize: "20px", fontFamily: "var(--font-playfair)", marginBottom: "24px" }}>Payment Method</h3>
              <div style={{ padding: "16px", border: "2px solid var(--primary-color)", borderRadius: "8px", backgroundColor: "var(--bg-color)", display: "flex", alignItems: "center", gap: "12px" }}>
                <input type="radio" name="payment" defaultChecked readOnly style={{ accentColor: "var(--primary-color)", width: "18px", height: "18px" }} />
                <div>
                  <span style={{ fontWeight: 600, fontSize: "15px" }}>Razorpay — Cards, UPI, NetBanking, Wallets</span>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Pay securely via Razorpay. 100% safe & encrypted.</p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div style={{ gridColumn: "span 1" }}>
          <div style={{ backgroundColor: "var(--bg-color)", padding: "32px", borderRadius: "8px", border: "1px solid var(--border-color)", position: "sticky", top: "100px" }}>
            <h3 style={{ fontSize: "20px", fontFamily: "var(--font-playfair)", marginBottom: "24px" }}>Your Order</h3>

            <div style={{ marginBottom: "24px" }}>
              {items.map((item, index) => (
                <div key={`${item.id}-${index}`} style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", fontSize: "14px" }}>
                  <span style={{ color: "var(--text-main)" }}>{item.name} <span style={{ color: "var(--text-muted)" }}>x {item.quantity}</span></span>
                  <span style={{ fontWeight: 500 }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div style={{ width: "100%", height: "1px", backgroundColor: "var(--border-color)", marginBottom: "16px" }} />

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: "var(--text-muted)", fontSize: "14px" }}>
              <span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: "var(--text-muted)", fontSize: "14px" }}>
              <span>Shipping</span><span style={{ color: "var(--text-main)" }}>₹{shipping}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", color: "var(--text-muted)", fontSize: "14px" }}>
              <span>GST (18%)</span><span>₹{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div style={{ width: "100%", height: "1px", backgroundColor: "var(--border-color)", marginBottom: "20px" }} />

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "28px", fontSize: "18px", fontWeight: 700, color: "var(--text-main)" }}>
              <span>Total</span>
              <span>₹{grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <button
              type="submit"
              form="checkout-form"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: "100%", padding: "16px", fontSize: "15px", cursor: isLoading ? "not-allowed" : "pointer", border: "none", opacity: isLoading ? 0.7 : 1, fontWeight: 700 }}
            >
              {isLoading ? "Processing..." : `PAY ₹${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            </button>
            <p style={{ textAlign: "center", fontSize: "12px", color: "var(--text-muted)", marginTop: "16px" }}>
              🔒 Secured by Razorpay. Your payment details are encrypted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
