"use client";

import { Calendar, Star, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import BookingModal from "../../components/BookingModal";

export default function ConsultationPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAstrologer, setSelectedAstrologer] = useState({ name: "", id: 1 });
  const [astrologers, setAstrologers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/backend/astrologers")
      .then(res => res.ok ? res.json() : { results: [] })
      .then(data => {
        const list = data?.results || (Array.isArray(data) ? data : []);
        setAstrologers(list);
      })
      .catch(() => setAstrologers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleBookNow = (name: string, id: number) => {
    setSelectedAstrologer({ name, id });
    setIsModalOpen(true);
  };

  return (
    <div className="container section-padding text-center">
      <h1 style={{ fontSize: 'clamp(28px, 8vw, 42px)', color: '#222', marginBottom: '15px' }}>Book a Consultation</h1>
      <p style={{ color: '#666', fontSize: '18px', maxWidth: '600px', margin: '0 auto', marginBottom: '40px' }}>
        Connect directly with our verified, expert Vedic Astrologers to find guidance and clarity for your life's journey.
      </p>

      {loading ? (
        <p style={{ color: '#888', fontSize: '16px' }}>Loading astrologers...</p>
      ) : astrologers.length === 0 ? (
        <p style={{ color: '#888', fontSize: '16px' }}>No astrologers available right now.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '30px' }}>
          {astrologers.map((astro: any) => (
            <div key={astro.id} style={{ background: '#fff', border: '1px solid #eaeaea', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f5f5f5', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {astro.profile_image
                  ? <img src={astro.profile_image} alt={astro.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: '32px' }}>👨‍⚕️</span>
                }
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '5px' }}>{astro.name}</h3>
              <p style={{ color: '#c19b63', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>
                {astro.bio?.slice(0, 60) || 'Expert Vedic Astrologer'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '15px', color: '#666', fontSize: '13px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {astro.experience_years}+ Yrs
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Star size={13} color="#f5a623" fill="#f5a623" /> {astro.rating || '4.5'}
                </span>
                <span>₹{astro.price_per_minute}/min</span>
              </div>
              {astro.languages?.length > 0 && (
                <p style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>
                  {astro.languages.map((l: any) => l.name).join(', ')}
                </p>
              )}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: 'auto', paddingTop: '16px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => handleBookNow(astro.name, astro.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px' }}
                >
                  <Calendar size={16} /> Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mounted only while open and keyed by astrologer, so every booking starts
          from a clean form instead of the previous customer's details. */}
      {isModalOpen && (
        <BookingModal
          key={selectedAstrologer.id}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          astrologerName={selectedAstrologer.name}
          astrologerId={selectedAstrologer.id}
        />
      )}
    </div>
  );
}
