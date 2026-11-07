"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, ArrowRight, CheckCircle2, Phone, Eye, EyeOff } from "lucide-react";
import styles from "./login.module.css";

export default function AuthPortal() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    email: "",
    password: "",
    confirm_password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const endpoint = isLogin ? "auth/login" : "auth/register";
      const url = `/api/backend/${endpoint}`;
      
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { ...formData };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || data.message || JSON.stringify(data) || "Something went wrong");
      }

      setSuccess(isLogin ? "Logged in successfully!" : "Registered successfully! Please login.");
      if (isLogin) {
        if (data.token || data.access) {
          localStorage.setItem('token', data.token || data.access);
        }
        if (data.user_id || data.id || data.user?.id) {
          localStorage.setItem('user_id', data.user_id || data.id || data.user?.id);
        }
        const name = data.first_name || data.user?.first_name || data.name || data.user?.name;
        if (name) {
          localStorage.setItem('user_name', name);
        }
        router.push("/");
      } else {
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section-padding" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '85vh', marginTop: "40px" }}>
      <div className={styles.card} style={{
        width: '100%',
        maxWidth: '900px',
        backgroundColor: 'var(--white)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        border: '1px solid var(--border-color)'
      }}>
        
        {/* Left Side: Illustration / Branding */}
        <div className={styles.brand} style={{
          flex: 1,
          backgroundColor: 'var(--primary-color)',
          color: 'var(--white)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background circle */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-20%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.1)',
            zIndex: 0
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-10%',
            left: '-20%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            backgroundColor: 'rgba(0,0,0,0.05)',
            zIndex: 0
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link href="/" style={{ display: 'inline-block', marginBottom: '20px' }}>
              <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '28px', color: 'var(--white)', margin: 0 }}>Punyam</h2>
            </Link>
            <h1 className={styles.brandTitle} style={{ fontFamily: 'var(--font-playfair)', lineHeight: 1.2, marginTop: '20px' }}>
              {isLogin ? "Welcome back to your spiritual journey." : "Begin your spiritual journey with us."}
            </h1>
            <p className={styles.brandText} style={{ marginTop: '20px', fontSize: '16px', opacity: 0.9, lineHeight: 1.6 }}>
              {isLogin 
                ? "Access your dashboard, track your orders, and consult with our expert astrologers seamlessly."
                : "Create an account to track orders, save your favorite spiritual products, and book consultations."
              }
            </p>
          </div>

          <div className={styles.brandPoints} style={{ position: 'relative', zIndex: 1, marginTop: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <CheckCircle2 size={20} style={{ color: '#fff' }} />
              <span style={{ fontSize: '15px' }}>100% Authentic Products</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <CheckCircle2 size={20} style={{ color: '#fff' }} />
              <span style={{ fontSize: '15px' }}>Verified Expert Astrologers</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={20} style={{ color: '#fff' }} />
              <span style={{ fontSize: '15px' }}>Secure & Private Experience</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className={styles.form} style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#fff'
        }}>
          {/* Toggle Buttons */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-color)', padding: '6px', borderRadius: '12px', marginBottom: '40px' }}>
            <button 
              onClick={() => setIsLogin(true)}
              style={{
                flex: 1, padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: 600,
                backgroundColor: isLogin ? '#fff' : 'transparent',
                color: isLogin ? 'var(--primary-color)' : 'var(--text-muted)',
                boxShadow: isLogin ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              style={{
                flex: 1, padding: '12px', borderRadius: '8px', fontSize: '15px', fontWeight: 600,
                backgroundColor: !isLogin ? '#fff' : 'transparent',
                color: !isLogin ? 'var(--primary-color)' : 'var(--text-muted)',
                boxShadow: !isLogin ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              Register
            </button>
          </div>

          <h2 style={{ fontSize: '28px', fontFamily: 'var(--font-playfair)', marginBottom: '30px', color: 'var(--text-main)' }}>
            {isLogin ? "Sign In to Punyam" : "Create an Account"}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {error && <div style={{ color: 'red', fontSize: '14px', textAlign: 'center', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px' }}>{error}</div>}
            {success && <div style={{ color: 'green', fontSize: '14px', textAlign: 'center', backgroundColor: '#dcfce3', padding: '10px', borderRadius: '8px' }}>{success}</div>}
            
            {!isLogin && (
              <>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>First Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} placeholder="John" style={{ width: '100%', padding: '14px 16px 14px 44px', border: '1px solid var(--border-color)', borderRadius: '10px', outline: 'none', fontSize: '15px', backgroundColor: 'var(--bg-color)', transition: 'border-color 0.3s' }} required={!isLogin} />
                    </div>
                  </div>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Last Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} placeholder="Doe" style={{ width: '100%', padding: '14px 16px 14px 44px', border: '1px solid var(--border-color)', borderRadius: '10px', outline: 'none', fontSize: '15px', backgroundColor: 'var(--bg-color)', transition: 'border-color 0.3s' }} required={!isLogin} />
                    </div>
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Phone Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" style={{ width: '100%', padding: '14px 16px 14px 44px', border: '1px solid var(--border-color)', borderRadius: '10px', outline: 'none', fontSize: '15px', backgroundColor: 'var(--bg-color)', transition: 'border-color 0.3s' }} required={!isLogin} />
                  </div>
                </div>
              </>
            )}

            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="you@example.com" style={{ width: '100%', padding: '14px 16px 14px 44px', border: '1px solid var(--border-color)', borderRadius: '10px', outline: 'none', fontSize: '15px', backgroundColor: 'var(--bg-color)', transition: 'border-color 0.3s' }} required />
              </div>
            </div>
            
            <div style={{ position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleInputChange} placeholder="••••••••" style={{ width: '100%', padding: '14px 44px 14px 44px', border: '1px solid var(--border-color)', borderRadius: '10px', outline: 'none', fontSize: '15px', backgroundColor: 'var(--bg-color)', transition: 'border-color 0.3s' }} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {showPassword ? <EyeOff size={18} color="var(--text-muted)" /> : <Eye size={18} color="var(--text-muted)" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div style={{ position: 'relative' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input type={showConfirmPassword ? "text" : "password"} name="confirm_password" value={formData.confirm_password} onChange={handleInputChange} placeholder="••••••••" style={{ width: '100%', padding: '14px 44px 14px 44px', border: '1px solid var(--border-color)', borderRadius: '10px', outline: 'none', fontSize: '15px', backgroundColor: 'var(--bg-color)', transition: 'border-color 0.3s' }} required={!isLogin} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {showConfirmPassword ? <EyeOff size={18} color="var(--text-muted)" /> : <Eye size={18} color="var(--text-muted)" />}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '16px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '10px', opacity: loading ? 0.7 : 1 }}>
              {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
