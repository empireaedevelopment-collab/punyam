"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, MapPin, Calendar, Clock, Loader2, ArrowRight, User, Mail, Phone, FileText } from 'lucide-react';
import styles from './instant.module.css';

const CITIES = [
  { name: 'New Delhi', coords: '28.6139,77.2090' },
  { name: 'Mumbai', coords: '19.0760,72.8777' },
  { name: 'Bangalore', coords: '12.9716,77.5946' },
  { name: 'Chennai', coords: '13.0827,80.2707' },
  { name: 'Kolkata', coords: '22.5726,88.3639' },
  { name: 'Hyderabad', coords: '17.3850,78.4867' },
  { name: 'Pune', coords: '18.5204,73.8567' },
  { name: 'Ahmedabad', coords: '23.0225,72.5714' },
  { name: 'Jaipur', coords: '26.9124,75.7873' },
  { name: 'Surat', coords: '21.1702,72.8311' },
  { name: 'Lucknow', coords: '26.8467,80.9462' },
  { name: 'Kanpur', coords: '26.4499,80.3319' },
  { name: 'Nagpur', coords: '21.1458,79.0882' },
  { name: 'Indore', coords: '22.7196,75.8577' },
  { name: 'Bhopal', coords: '23.2599,77.4126' },
  { name: 'Patna', coords: '25.5941,85.1376' },
  { name: 'Ludhiana', coords: '30.9010,75.8523' },
  { name: 'Agra', coords: '27.1767,78.0081' },
  { name: 'Varanasi', coords: '25.3176,83.0039' },
  { name: 'Chandigarh', coords: '30.7333,76.7794' },
  { name: 'Kochi', coords: '9.9312,76.2673' },
  { name: 'Guwahati', coords: '26.1445,91.7362' },
  { name: 'Bhubaneswar', coords: '20.2961,85.8245' }
];

export default function InstantReportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    date: new Date().toISOString().split('T')[0],
    time: '12:00',
    city: CITIES[0].coords
  });
  
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      setError("Please accept the Terms & Conditions to proceed.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResultData(null);

    try {
      // 1. Create Razorpay order
      const amount = 299 * 1.18; // 299 + 18% GST
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, bookingId: `ASTRO_${Date.now()}` })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to create order");

      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay. Check your connection.");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Punyam Astrology",
        description: "Instant Astro Report (Kundli + Predictions)",
        order_id: orderData.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: { color: "#c19b63" },
        handler: async (_response: any) => {
          // Payment successful!
          setIsPaid(true);
          await fetchAstrologyData();
        },
        modal: {
          ondismiss: () => { setLoading(false); }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  const fetchAstrologyData = async () => {
    try {
      const datetime = `${formData.date}T${formData.time}:00Z`;
      const res = await fetch(`/api/astrology/birth-details?coordinates=${formData.city}&datetime=${datetime}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      setResultData(data.data || data);
      
      // Simulate saving report in user account
      console.log("Report saved to user account.");

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    await new Promise(resolve => setTimeout(resolve, 100)); // wait for React to render

    const element = document.getElementById('report-content');
    if (!element) {
      setIsGeneratingPdf(false);
      return;
    }

    try {
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 15,
        filename: `${formData.name || 'Kundli'}_Report.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };
      
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("Failed to generate PDF:", err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Kundli Astro Report',
          text: 'Check out my detailed astrological birth chart and predictions on Punyam!',
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing", err);
      }
    } else {
      alert("Sharing is not supported on this browser. You can copy the link!");
    }
  };

  return (
    <div className="container section-padding">
      <div className={`text-center ${styles.heroSection}`}>
        <div className={styles.subtitle}>
          <span className={styles.line}></span> 
          <Sparkles size={16} />
          INSTANT ASTRO REPORT
          <span className={styles.line}></span>
        </div>
        <h1 className={styles.title}>Your Personalized Kundli</h1>
        <p className={styles.description}>
          Enter your birth details accurately to generate an instant, comprehensive birth chart and astrological report utilizing the ProKerala Engine.
        </p>
      </div>

      <div className="grid-2">
        {/* Input Form */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            <FileText className={styles.cardTitleIcon} size={28} /> Birth Details Form
          </h2>
          <form onSubmit={handleGenerateReport}>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <div className={styles.inputWrapper}>
                <User className={styles.inputIcon} size={20} />
                <input 
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={styles.input}
                  required
                />
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrapper}>
                  <Mail className={styles.inputIcon} size={20} />
                  <input 
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={styles.input}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <div className={styles.inputWrapper}>
                  <Phone className={styles.inputIcon} size={20} />
                  <input 
                    type="tel"
                    placeholder="+91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={styles.input}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Gender</label>
              <div className={styles.selectGroup}>
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="gender" 
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  /> Male
                </label>
                <label className={styles.radioLabel}>
                  <input 
                    type="radio" 
                    name="gender" 
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  /> Female
                </label>
              </div>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Date of Birth</label>
                <div className={styles.inputWrapper}>
                  <Calendar className={styles.inputIcon} size={20} />
                  <input 
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Time of Birth</label>
                <div className={styles.inputWrapper}>
                  <Clock className={styles.inputIcon} size={20} />
                  <input 
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    className={styles.input}
                    required
                  />
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Place of Birth</label>
              <div className={styles.inputWrapper}>
                <MapPin className={styles.inputIcon} size={20} />
                <select 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  className={styles.input}
                >
                  {CITIES.map(c => (
                    <option key={c.name} value={c.coords}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '10px', display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '20px' }}>
              <input 
                type="checkbox" 
                id="terms" 
                checked={acceptTerms} 
                onChange={(e) => setAcceptTerms(e.target.checked)} 
                style={{ marginTop: '4px', accentColor: 'var(--primary-color)' }} 
              />
              <label htmlFor="terms" style={{ fontSize: '13px', color: '#666', cursor: 'pointer' }}>
                I agree to the Terms & Conditions and understand that this report is computer-generated.
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`btn btn-primary ${styles.submitBtn}`}
              style={{ opacity: loading ? 0.7 : 1, width: '100%' }}
            >
              {loading ? <Loader2 size={20} className={styles.spin} /> : 'Generate Report - ₹299 + GST'}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className={`${styles.card} ${styles.resultsArea}`}>
          {error && (
            <div className={styles.errorState}>
              <p style={{ fontWeight: 600, marginBottom: '5px' }}>Generation Failed</p>
              <p>{error}</p>
            </div>
          )}

          {!resultData && !error && !loading && (
            <div className={styles.emptyState}>
              <FileText size={48} className={styles.emptyIcon} />
              <p>Complete the payment to instantly view and download your 30+ page PDF astrology report.</p>
            </div>
          )}

          {loading && (
            <div className={styles.emptyState}>
              <Loader2 size={40} className={`${styles.emptyIcon} ${styles.spin}`} style={{ color: 'var(--primary-color)' }} />
              <p>Synthesizing Astrological Data...</p>
            </div>
          )}

          {resultData && !loading && (
            <div id="report-content" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: isGeneratingPdf ? '20px' : '0', backgroundColor: isGeneratingPdf ? '#fff' : 'transparent', borderRadius: '8px' }}>
              
              {isGeneratingPdf && (
                <div style={{ textAlign: 'center', marginBottom: '25px', borderBottom: '2px solid #cca43b', paddingBottom: '20px' }}>
                  <img src="/logo.png" alt="Punyam Logo" style={{ height: '60px', margin: '0 auto', display: 'block' }} />
                  <h2 style={{ marginTop: '15px', color: '#cca43b', fontSize: '24px' }}>Comprehensive Astrological Report</h2>
                  <p style={{ color: '#555', fontSize: '14px', marginTop: '5px' }}>
                    <strong>Name:</strong> {formData.name} | <strong>DOB:</strong> {formData.date} | <strong>Time:</strong> {formData.time}
                  </p>
                </div>
              )}

              <h3 className={styles.resultTitle}>{isGeneratingPdf ? 'Astrology Snapshot' : `Astrology Snapshot for ${formData.name || 'User'}`}</h3>
              
              <div className={styles.resultSection}>
                <div className={styles.resultGrid}>
                  <div className={styles.dataPoint}>
                    <div className={styles.dataLabel}>Nakshatra (Birth Star)</div>
                    <div className={styles.dataValue}>{resultData.nakshatra?.name || 'N/A'}</div>
                    <div className={styles.dataSub}>Lord: {resultData.nakshatra?.lord?.name || 'N/A'}</div>
                  </div>
                  <div className={styles.dataPoint}>
                    <div className={styles.dataLabel}>Chandra Rasi (Moon Sign)</div>
                    <div className={styles.dataValue}>{resultData.chandra_rasi?.name || 'N/A'}</div>
                    <div className={styles.dataSub}>Lord: {resultData.chandra_rasi?.lord?.name || 'N/A'}</div>
                  </div>
                  <div className={styles.dataPoint}>
                    <div className={styles.dataLabel}>Soorya Rasi (Sun Sign)</div>
                    <div className={styles.dataValue}>{resultData.soorya_rasi?.name || 'N/A'}</div>
                    <div className={styles.dataSub}>Lord: {resultData.soorya_rasi?.lord?.name || 'N/A'}</div>
                  </div>
                  <div className={styles.dataPoint}>
                    <div className={styles.dataLabel}>Zodiac Sign</div>
                    <div className={styles.dataValue}>{resultData.zodiac?.name || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {resultData.additional_info && (
                <div className={styles.resultSection} style={{ marginTop: '20px' }}>
                  <h4 style={{ marginBottom: '15px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '8px', fontSize: '18px' }}>Detailed Cosmological Analysis</h4>
                  <div className={styles.resultGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '15px' }}>
                    {Object.entries(resultData.additional_info).map(([key, value]) => (
                      <div className={styles.dataPoint} key={key} style={{ padding: '12px', backgroundColor: '#faf8f5', borderRadius: '6px', border: '1px solid #eee' }}>
                        <div className={styles.dataLabel} style={{ textTransform: 'capitalize', fontSize: '11px', color: '#888', marginBottom: '4px' }}>{key.replace('_', ' ')}</div>
                        <div className={styles.dataValue} style={{ fontSize: '14px', color: '#222', fontWeight: '500' }}>{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Placeholders for advanced data elements in workflow */}
              <div className={styles.resultSection} style={{ marginTop: '20px' }}>
                <h4 style={{ marginBottom: '15px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '8px', fontSize: '18px' }}>Planetary Positions & Dasha</h4>
                <div style={{ padding: '12px', backgroundColor: '#faf8f5', borderRadius: '6px', border: '1px solid #eee', fontSize: '14px', color: '#555' }}>
                  Vimshottari Dasha, current transits, and detailed planetary charts will be populated here when the advanced Kundli API is fully connected.
                </div>
              </div>

              <div className={styles.resultSection} style={{ marginTop: '20px' }}>
                <h4 style={{ marginBottom: '15px', color: '#333', borderBottom: '1px solid #eee', paddingBottom: '8px', fontSize: '18px' }}>Predictions & Remedies</h4>
                <div style={{ padding: '12px', backgroundColor: '#faf8f5', borderRadius: '6px', border: '1px solid #eee', fontSize: '14px', color: '#555' }}>
                  Personalized life predictions and Vedic remedies (gemstones, mantras) will be displayed here based on your birth chart analysis.
                </div>
              </div>

              <div style={{ marginTop: 'auto', textAlign: 'center', paddingTop: '30px' }} data-html2canvas-ignore>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                  <button onClick={handleDownloadPdf} className="btn btn-primary" style={{ width: '100%', fontSize: '14px', padding: '12px' }}>Download Full PDF</button>
                  <button onClick={handleShare} className="btn" style={{ width: '100%', fontSize: '14px', padding: '12px', backgroundColor: '#eee', color: '#333' }}>Share Report</button>
                </div>
                
                <div style={{ backgroundColor: '#fdfbf7', border: '1px solid #cca43b', padding: '20px', borderRadius: '8px', marginTop: '10px' }}>
                  <h4 style={{ color: '#cca43b', marginBottom: '10px', fontSize: '18px' }}>Need Deeper Guidance?</h4>
                  <p style={{ fontSize: '13px', color: '#555', marginBottom: '15px' }}>Talk to our expert Vedic astrologers to understand your chart in depth and get personalized remedies.</p>
                  <Link href="/consultation" style={{ display: 'block', width: '100%', textDecoration: 'none' }}>
                    <button className="btn btn-primary" style={{ width: '100%' }}>Book Consultation Now</button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
