"use client";

import { useState } from 'react';
import { Sparkles, MapPin, Calendar, Clock, Loader2, ArrowRight, Moon, User, Star } from 'lucide-react';
import styles from './astrology.module.css';

const CITIES = [
  // All Indian States
  { name: 'Andhra Pradesh (Amaravati)', coords: '16.5062,80.6480' },
  { name: 'Arunachal Pradesh (Itanagar)', coords: '27.0844,93.6053' },
  { name: 'Assam (Dispur)', coords: '26.1433,91.7898' },
  { name: 'Bihar (Patna)', coords: '25.5941,85.1376' },
  { name: 'Chhattisgarh (Raipur)', coords: '21.2514,81.6296' },
  { name: 'Goa (Panaji)', coords: '15.4909,73.8278' },
  { name: 'Gujarat (Gandhinagar)', coords: '23.2156,72.6369' },
  { name: 'Haryana (Chandigarh)', coords: '30.7333,76.7794' },
  { name: 'Himachal Pradesh (Shimla)', coords: '31.1048,77.1734' },
  { name: 'Jharkhand (Ranchi)', coords: '23.3441,85.3096' },
  { name: 'Karnataka (Bangalore)', coords: '12.9716,77.5946' },
  { name: 'Kerala (Thiruvananthapuram)', coords: '8.5241,76.9366' },
  { name: 'Madhya Pradesh (Bhopal)', coords: '23.2599,77.4126' },
  { name: 'Maharashtra (Mumbai)', coords: '19.0760,72.8777' },
  { name: 'Manipur (Imphal)', coords: '24.8170,93.9368' },
  { name: 'Meghalaya (Shillong)', coords: '25.5788,91.8933' },
  { name: 'Mizoram (Aizawl)', coords: '23.7271,92.7176' },
  { name: 'Nagaland (Kohima)', coords: '25.6751,94.1086' },
  { name: 'Odisha (Bhubaneswar)', coords: '20.2961,85.8245' },
  { name: 'Punjab (Chandigarh)', coords: '30.7333,76.7794' },
  { name: 'Rajasthan (Jaipur)', coords: '26.9124,75.7873' },
  { name: 'Sikkim (Gangtok)', coords: '27.3389,88.6065' },
  { name: 'Tamil Nadu (Chennai)', coords: '13.0827,80.2707' },
  { name: 'Telangana (Hyderabad)', coords: '17.3850,78.4867' },
  { name: 'Tripura (Agartala)', coords: '23.8315,91.2868' },
  { name: 'Uttar Pradesh (Lucknow)', coords: '26.8467,80.9462' },
  { name: 'Uttarakhand (Dehradun)', coords: '30.3165,78.0322' },
  { name: 'West Bengal (Kolkata)', coords: '22.5726,88.3639' },

  // Indian Union Territories
  { name: 'Andaman & Nicobar (Port Blair)', coords: '11.6234,92.7265' },
  { name: 'Chandigarh', coords: '30.7333,76.7794' },
  { name: 'Dadra & Nagar Haveli and Daman & Diu', coords: '20.3974,72.8328' },
  { name: 'Delhi (New Delhi)', coords: '28.6139,77.2090' },
  { name: 'Jammu & Kashmir (Srinagar)', coords: '34.0837,74.7973' },
  { name: 'Ladakh (Leh)', coords: '34.1526,77.5771' },
  { name: 'Lakshadweep (Kavaratti)', coords: '10.5667,72.6369' },
  { name: 'Puducherry', coords: '11.9416,79.8083' },
  
  // Other Important Hubs
  { name: 'Varanasi, Uttar Pradesh', coords: '25.3176,82.9739' },
  { name: 'Ahmedabad, Gujarat', coords: '23.0225,72.5714' },
  
  // International Cities
  { name: 'New York, USA', coords: '40.7128,-74.0060' },
  { name: 'London, UK', coords: '51.5074,-0.1278' },
  { name: 'Dubai, UAE', coords: '25.2048,55.2708' },
  { name: 'Singapore', coords: '1.3521,103.8198' },
  { name: 'Sydney, Australia', coords: '-33.8688,151.2093' },
  { name: 'Toronto, Canada', coords: '43.6510,-79.3470' },
];

export default function AstrologyPage() {
  const [activeTab, setActiveTab] = useState<'panchang' | 'kundli'>('panchang');
  const [city, setCity] = useState(CITIES[0].coords);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('12:00');
  
  const [loading, setLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAstrologyDataInternal = async () => {
    try {
      const datetime = `${date}T${time}:00Z`;
      let res;
      let data;
      
      try {
        const endpoint = activeTab === 'panchang' ? 'panchang' : 'kundli';
        res = await fetch(`/api/astrology/${endpoint}?coordinates=${city}&datetime=${datetime}`);
        
        const contentType = res.headers.get("content-type");
        if (!res.ok || (contentType && contentType.indexOf("text/html") !== -1)) {
           throw new Error("Next.js API missing, falling back to PHP");
        }
        
        data = await res.json();
      } catch (e) {
        res = await fetch(`/astrology-api.php?action=${activeTab}&coordinates=${city}&datetime=${datetime}`);
        data = await res.json();
      }

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      setResultData(data.data || data);
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

  const fetchAstrologyData = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResultData(null);

    try {
      // Load Razorpay
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

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Failed to load Razorpay. Please check your internet connection.");
      }

      // Create Razorpay order server-side
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 99, bookingId: `ASTRO_${Date.now()}` }) // 99 Rs for Instant Report
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initiate payment");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Punyam Astrology",
        description: `Instant Astro Report - ${activeTab === 'panchang' ? 'Panchang' : 'Kundli'}`,
        order_id: orderData.orderId,
        theme: { color: "#c19b63" },
        handler: async (response: any) => {
          // Payment successful, now fetch the report
          await fetchAstrologyDataInternal();
        },
        modal: {
          ondismiss: () => { setLoading(false); }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setError(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="container section-padding">
      <div className={`text-center ${styles.heroSection}`}>
        <div className={styles.subtitle}>
          <span className={styles.line}></span> 
          <Sparkles size={16} />
          ASTROLOGY 
          <span className={styles.line}></span>
        </div>
        <h1 className={styles.title}>Divine Guidance</h1>
        <p className={styles.description}>
          Access precise daily Panchang, accurate birth charts, and stellar insights integrated directly with our ProKerala backend.
        </p>
      </div>

      <div className={styles.tabsContainer}>
        <button 
          onClick={() => { setActiveTab('panchang'); setResultData(null); setError(null); }}
          className={`${styles.tabBtn} ${activeTab === 'panchang' ? styles.tabBtnActive : ''}`}
        >
          <Calendar size={18} /> Daily Panchang
        </button>
        <button 
          onClick={() => { setActiveTab('kundli'); setResultData(null); setError(null); }}
          className={`${styles.tabBtn} ${activeTab === 'kundli' ? styles.tabBtnActive : ''}`}
        >
          <Star size={18} /> Kundli (Birth Chart)
        </button>
      </div>

      <div className="grid-2">
        {/* Input Form */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            {activeTab === 'panchang' ? (
              <><Calendar className={styles.cardTitleIcon} size={28} /> Panchang Calculator</>
            ) : (
              <><User className={styles.cardTitleIcon} size={28} /> Birth Details</>
            )}
          </h2>
          <form onSubmit={fetchAstrologyData}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Select Location</label>
              <div className={styles.inputWrapper}>
                <MapPin className={styles.inputIcon} size={20} />
                <select 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={styles.input}
                >
                  {CITIES.map(c => (
                    <option key={c.name} value={c.coords}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{activeTab === 'panchang' ? 'Select Date' : 'Date of Birth'}</label>
              <div className={styles.inputWrapper}>
                <Calendar className={styles.inputIcon} size={20} />
                <input 
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>{activeTab === 'panchang' ? 'Time (Optional)' : 'Time of Birth'}</label>
              <div className={styles.inputWrapper}>
                <Clock className={styles.inputIcon} size={20} />
                <input 
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className={styles.input}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`btn btn-primary ${styles.submitBtn}`}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <Loader2 size={20} className={styles.spin} /> : (activeTab === 'panchang' ? 'Get Panchang' : 'Generate Kundli')}
              {!loading && <ArrowRight size={20} />}
            </button>
          </form>
        </div>

        {/* Results Area */}
        <div className={`${styles.card} ${styles.resultsArea}`}>
          {error && (
            <div className={styles.errorState}>
              <p style={{ fontWeight: 600, marginBottom: '5px' }}>Error fetching data</p>
              <p>{error}</p>
              <p style={{ marginTop: '10px', fontSize: '12px', opacity: 0.8 }}>Make sure your Prokerala credentials are correct in .env.local.</p>
            </div>
          )}

          {!resultData && !error && !loading && (
            <div className={styles.emptyState}>
              {activeTab === 'panchang' ? <Moon size={48} className={styles.emptyIcon} /> : <Star size={48} className={styles.emptyIcon} />}
              <p>Enter your details and click the button to reveal your astrological insights.</p>
            </div>
          )}

          {loading && (
            <div className={styles.emptyState}>
              <Loader2 size={40} className={`${styles.emptyIcon} ${styles.spin}`} style={{ color: 'var(--primary-color)' }} />
              <p>Consulting the stars...</p>
            </div>
          )}

          {resultData && activeTab === 'panchang' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 className={styles.resultTitle}>Today's Panchang</h3>
              <div className={styles.scrollArea}>
                <div className={styles.resultItem}>
                  <p className={styles.resultLabel}>Sunrise & Sunset</p>
                  <p className={styles.resultValue}>
                    {resultData.sunrise ? new Date(resultData.sunrise).toLocaleTimeString() : 'N/A'} - {resultData.sunset ? new Date(resultData.sunset).toLocaleTimeString() : 'N/A'}
                  </p>
                </div>
                
                <div className={styles.resultItem}>
                  <p className={styles.resultLabel}>Nakshatra</p>
                  {resultData.nakshatra?.length ? resultData.nakshatra.map((n: any, idx: number) => (
                    <div key={idx} style={{ marginBottom: '10px' }}>
                      <p className={styles.resultValue}>{n.name}</p>
                      <p className={styles.resultSubValue}>Lord: {n?.lord?.name || 'N/A'}</p>
                    </div>
                  )) : <p className={styles.resultSubValue}>Not available</p>}
                </div>

                <div className={styles.resultItem}>
                  <p className={styles.resultLabel}>Tithi</p>
                  {resultData.tithi?.length ? resultData.tithi.map((t: any, idx: number) => (
                    <div key={idx} style={{ marginBottom: '10px' }}>
                      <p className={styles.resultValue}>{t.name}</p>
                    </div>
                  )) : <p className={styles.resultSubValue}>Not available</p>}
                </div>
              </div>
            </div>
          )}

          {resultData && activeTab === 'kundli' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 className={styles.resultTitle}>Birth Details (Kundli)</h3>
              <div className={styles.scrollArea}>
                {/* For /v2/astrology/kundli format */}
                {resultData.nakshatra_details ? (
                  <>
                    <div className={styles.resultItem}>
                      <p className={styles.resultLabel}>Nakshatra (Birth Star)</p>
                      <p className={styles.resultValue}>{resultData.nakshatra_details.nakshatra?.name || 'N/A'}</p>
                      <p className={styles.resultSubValue}>Pada: {resultData.nakshatra_details.nakshatra?.pada || 'N/A'} | Lord: {resultData.nakshatra_details.nakshatra?.lord?.name || 'N/A'}</p>
                    </div>

                    <div className={styles.resultItem}>
                      <p className={styles.resultLabel}>Chandra Rasi (Moon Sign)</p>
                      <p className={styles.resultValue}>{resultData.nakshatra_details.chandra_rasi?.name || 'N/A'}</p>
                      <p className={styles.resultSubValue}>Lord: {resultData.nakshatra_details.chandra_rasi?.lord?.name || 'N/A'}</p>
                    </div>

                    <div className={styles.resultItem}>
                      <p className={styles.resultLabel}>Surya Rasi (Sun Sign)</p>
                      <p className={styles.resultValue}>{resultData.nakshatra_details.surya_rasi?.name || 'N/A'}</p>
                      <p className={styles.resultSubValue}>Lord: {resultData.nakshatra_details.surya_rasi?.lord?.name || 'N/A'}</p>
                    </div>
                    
                    {resultData.mangal_dosha && (
                      <div className={styles.resultItem}>
                        <p className={styles.resultLabel}>Mangal Dosha</p>
                        <p className={styles.resultValue}>{resultData.mangal_dosha.has_dosha ? 'Yes' : 'No'}</p>
                        <p className={styles.resultSubValue}>{resultData.mangal_dosha.description || ''}</p>
                      </div>
                    )}
                    
                    {resultData.yoga_details && resultData.yoga_details.length > 0 && (
                      <div className={styles.resultItem}>
                        <p className={styles.resultLabel}>Yoga Details</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px' }}>
                          {resultData.yoga_details.slice(0, 4).map((yoga: any, idx: number) => (
                            <div key={idx}>
                              <span className={styles.badge}>{yoga.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                  {/* Fallback to original birth-details format */}
                  <div className={styles.resultItem}>
                    <p className={styles.resultLabel}>Nakshatra (Birth Star)</p>
                    <p className={styles.resultValue}>{resultData.nakshatra?.name || 'N/A'}</p>
                    <p className={styles.resultSubValue}>Pada: {resultData.nakshatra?.pada || 'N/A'} | Lord: {resultData.nakshatra?.lord?.name || 'N/A'}</p>
                  </div>

                  <div className={styles.resultItem}>
                    <p className={styles.resultLabel}>Rasi (Moon Sign)</p>
                    <p className={styles.resultValue}>{resultData.rasi?.name || 'N/A'}</p>
                    <p className={styles.resultSubValue}>Lord: {resultData.rasi?.lord?.name || 'N/A'}</p>
                  </div>

                  <div className={styles.resultItem}>
                    <p className={styles.resultLabel}>Zodiac (Sun Sign)</p>
                    <p className={styles.resultValue}>{resultData.zodiac?.name || 'N/A'}</p>
                    <p className={styles.resultSubValue}>Lord: {resultData.zodiac?.lord?.name || 'N/A'}</p>
                  </div>

                  <div className={styles.resultItem}>
                    <p className={styles.resultLabel}>Additional Details</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px' }}>
                      <div>
                        <span className={styles.badge}>Tithi: {resultData.tithi?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className={styles.badge}>Karan: {resultData.karan?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className={styles.badge}>Yoga: {resultData.yoga?.name || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
