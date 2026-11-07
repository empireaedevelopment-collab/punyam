"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Sparkles, User } from "lucide-react";
import "./BottomNav.css";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Store", href: "/shop", icon: ShoppingBag },
    { name: "Astrology", href: "/services", icon: Sparkles },
    { name: "Profile", href: "/dashboard", icon: User }, // /profile does not exist; dashboard sends guests to login
  ];

  return (
    <div className="bottom-nav-container">
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`bottom-nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={24} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
