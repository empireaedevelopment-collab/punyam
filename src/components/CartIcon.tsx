"use client";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";

export default function CartIcon() {
  const { cartCount } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Link href="/cart" style={{ position: "relative" }}>
      <ShoppingCart size={20} />
      {mounted && cartCount > 0 && (
        <span style={{
          position: "absolute",
          top: "-8px",
          right: "-8px",
          backgroundColor: "var(--primary-color)",
          color: "white",
          borderRadius: "50%",
          width: "16px",
          height: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "10px",
          fontWeight: "bold"
        }}>
          {cartCount}
        </span>
      )}
    </Link>
  );
}
