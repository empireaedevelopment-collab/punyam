"use client";

import React from 'react';
import styles from './report.module.css';
import { 
  Sparkles, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Star, 
  Moon, 
  Sun, 
  Activity, 
  Briefcase, 
  Heart, 
  BookOpen, 
  Users, 
  Compass, 
  ShieldAlert,
  Info
} from 'lucide-react';
import Link from 'next/link';

export default function HoroscopeReportPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const reportId = "PUN-" + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

  return (
    <div className="container section-padding" style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', padding: '40px 20px' }}>
      
      {/* Navigation / Header - Optional back button */}
      <div style={{ marginBottom: '20px' }}>
        <Link href="/astrology" className="btn btn-outline" style={{ fontSize: '12px', padding: '8px 16px' }}>
          &larr; Back to Astrology
        </Link>
      </div>

      <div className={styles.reportContainer}>
        
        {/* --- SECTION 1: Cover Page --- */}
        <div className={styles.coverPage}>
          <div className={styles.logo}>
            <Sparkles size={32} />
            PUNYAM
          </div>
          <h1 className={styles.reportTitle}>Premium Vedic Horoscope Report</h1>
          <h2 className={styles.customerName}>Prepared exclusively for: <br/><strong style={{color: 'var(--text-main)'}}>John Doe</strong></h2>
          
          <div className={styles.metaInfo}>
            <div><strong>Date of Generation:</strong> {currentDate}</div>
            <div><strong>Report ID:</strong> {reportId}</div>
          </div>
        </div>

        {/* --- SECTION 2: Welcome Note --- */}
        <div className={styles.section}>
          <div className={styles.welcomeNote}>
            <h3 style={{ marginBottom: '10px', color: 'var(--primary-color)' }}>Welcome to your personal astrological guide</h3>
            <p>This report is based on the birth details you provided and calculated using traditional Vedic astrology principles. It is intended to offer insight and guidance into various aspects of your life journey. For a deeper, personalized interpretation, we encourage you to book a consultation with one of our expert astrologers.</p>
          </div>
        </div>

        {/* --- SECTION 3: Customer Details & Basic Horoscope Summary --- */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}><User size={24} /> Birth Details & Horoscope Summary</h2>
          <div className={styles.grid2} style={{ marginBottom: '30px' }}>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Full Name</div>
              <div className={styles.infoValue}>John Doe</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Gender</div>
              <div className={styles.infoValue}>Male</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Date of Birth</div>
              <div className={styles.infoValue}>15 August 1990</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Time of Birth</div>
              <div className={styles.infoValue}>14:30 (2:30 PM)</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Place of Birth</div>
              <div className={styles.infoValue}>New Delhi, India</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Time Zone</div>
              <div className={styles.infoValue}>IST (UTC +5:30)</div>
            </div>
          </div>

          <h3 style={{ fontSize: '20px', marginBottom: '20px', fontFamily: 'var(--font-playfair)' }}>Astrological Snapshot</h3>
          <div className={styles.grid3}>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Ascendant (Lagna)</div>
              <div className={styles.infoValue}>Scorpio</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Moon Sign (Rashi)</div>
              <div className={styles.infoValue}>Taurus</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Sun Sign</div>
              <div className={styles.infoValue}>Leo</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Nakshatra</div>
              <div className={styles.infoValue}>Rohini</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Nakshatra Pada</div>
              <div className={styles.infoValue}>2</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Birth Tithi</div>
              <div className={styles.infoValue}>Navami</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Yoga</div>
              <div className={styles.infoValue}>Dhruva</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Karana</div>
              <div className={styles.infoValue}>Taitila</div>
            </div>
            <div className={styles.infoCard}>
              <div className={styles.infoLabel}>Weekday</div>
              <div className={styles.infoValue}>Wednesday</div>
            </div>
          </div>
        </div>

        {/* --- SECTION 4: Planetary Positions --- */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}><Star size={24} /> Planetary Positions</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Planet</th>
                  <th>Sign</th>
                  <th>House</th>
                  <th>Degree</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Sun</td><td>Leo</td><td>10th</td><td>12° 45'</td></tr>
                <tr><td>Moon</td><td>Taurus</td><td>7th</td><td>18° 22'</td></tr>
                <tr><td>Mars</td><td>Aries</td><td>6th</td><td>05° 11'</td></tr>
                <tr><td>Mercury</td><td>Virgo</td><td>11th</td><td>22° 34'</td></tr>
                <tr><td>Jupiter</td><td>Cancer</td><td>9th</td><td>14° 09'</td></tr>
                <tr><td>Venus</td><td>Libra</td><td>12th</td><td>29° 50'</td></tr>
                <tr><td>Saturn</td><td>Capricorn</td><td>3rd</td><td>08° 15'</td></tr>
                <tr><td>Rahu</td><td>Gemini</td><td>8th</td><td>11° 02'</td></tr>
                <tr><td>Ketu</td><td>Sagittarius</td><td>2nd</td><td>11° 02'</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* --- SECTION 5: House-wise Analysis --- */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}><Activity size={24} /> House-wise Analysis</h2>
          <p style={{ marginBottom: '30px', color: 'var(--text-muted)' }}>An overview of the key areas of your life based on the 12 houses of your Kundli.</p>
          
          <div className={styles.grid2}>
            <div className={styles.houseCard}>
              <User className={styles.houseIcon} size={24} />
              <h4 className={styles.houseTitle}>1st House (Personality & Self)</h4>
              <p className={styles.houseDesc}>Represents your physical appearance, vitality, and general disposition. A strong placement here indicates robust health and strong leadership qualities.</p>
            </div>
            <div className={styles.houseCard}>
              <Star className={styles.houseIcon} size={24} />
              <h4 className={styles.houseTitle}>2nd House (Wealth & Speech)</h4>
              <p className={styles.houseDesc}>Governs your accumulated wealth, family lineage, and speech. Indicates a stable financial foundation with careful planning.</p>
            </div>
            <div className={styles.houseCard}>
              <Briefcase className={styles.houseIcon} size={24} />
              <h4 className={styles.houseTitle}>10th House (Career & Profession)</h4>
              <p className={styles.houseDesc}>The house of career, status, and public reputation. Strong influences here suggest significant professional achievements and recognition.</p>
            </div>
            <div className={styles.houseCard}>
              <Heart className={styles.houseIcon} size={24} />
              <h4 className={styles.houseTitle}>7th House (Marriage & Partnerships)</h4>
              <p className={styles.houseDesc}>Relates to marriage, business partnerships, and public dealings. Points to a supportive spouse and fruitful collaborative ventures.</p>
            </div>
          </div>
        </div>

        {/* --- SECTION 6: Dasha Timeline & Yogas --- */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}><Clock size={24} /> Dasha Analysis & Yogas</h2>
          
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '20px', fontFamily: 'var(--font-playfair)' }}>Current Mahadasha Overview</h3>
            <div className={styles.grid2}>
              <div className={styles.infoCard}>
                <div className={styles.infoLabel}>Current Mahadasha</div>
                <div className={styles.infoValue}>Jupiter (Guru)</div>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.infoLabel}>Current Antardasha</div>
                <div className={styles.infoValue}>Saturn (Shani)</div>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.infoLabel}>Remaining Period</div>
                <div className={styles.infoValue}>2 Years, 4 Months</div>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.infoLabel}>Next Dasha</div>
                <div className={styles.infoValue}>Saturn Mahadasha</div>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '20px', fontFamily: 'var(--font-playfair)' }}>Important Yogas</h3>
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              <li style={{ marginBottom: '15px', padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--primary-color)', display: 'block', marginBottom: '5px' }}>Gajakesari Yoga</strong>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Jupiter and Moon are in mutual angles. This grants intelligence, respect, and prosperity.</span>
              </li>
              <li style={{ marginBottom: '15px', padding: '15px', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--primary-color)', display: 'block', marginBottom: '5px' }}>Ruchaka Yoga</strong>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Mars is in its own sign in a kendra house. Bestows courage, physical strength, and success in competitive fields.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* --- SECTION 7: Dosha Analysis --- */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}><ShieldAlert size={24} /> Dosha Analysis</h2>
          <div className={styles.grid3}>
            <div className={styles.infoCard} style={{ borderColor: '#e74c3c' }}>
              <div className={styles.infoLabel}>Mangal Dosha</div>
              <div className={styles.infoValue} style={{ color: '#e74c3c' }}>Low (Anshik)</div>
              <p style={{ fontSize: '13px', marginTop: '10px', color: 'var(--text-muted)' }}>Mild influence on marriage timing. Generally nullified after age 28.</p>
            </div>
            <div className={styles.infoCard} style={{ borderColor: '#2ecc71' }}>
              <div className={styles.infoLabel}>Kaal Sarp Dosha</div>
              <div className={styles.infoValue} style={{ color: '#2ecc71' }}>Not Present</div>
              <p style={{ fontSize: '13px', marginTop: '10px', color: 'var(--text-muted)' }}>All planets are outside the Rahu-Ketu axis.</p>
            </div>
            <div className={styles.infoCard} style={{ borderColor: '#2ecc71' }}>
              <div className={styles.infoLabel}>Pitra Dosha</div>
              <div className={styles.infoValue} style={{ color: '#2ecc71' }}>Not Present</div>
              <p style={{ fontSize: '13px', marginTop: '10px', color: 'var(--text-muted)' }}>Sun and Jupiter are well placed without malefic afflictions.</p>
            </div>
          </div>
        </div>

        {/* --- SECTION 8: Career & Financial Overview --- */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}><Briefcase size={24} /> Career & Financial Overview</h2>
          <div className={styles.grid2}>
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '15px', color: 'var(--secondary-color)' }}>Professional Trajectory</h3>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '15px' }}>
                <li style={{ marginBottom: '10px' }}><strong>Strengths:</strong> Analytical thinking, leadership, persistence.</li>
                <li style={{ marginBottom: '10px' }}><strong>Directions:</strong> Finance, technology, administration, or independent consulting.</li>
                <li style={{ marginBottom: '10px' }}><strong>Business vs Employment:</strong> Strong tendencies towards eventual entrepreneurship after a period of stable employment.</li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: '18px', marginBottom: '15px', color: 'var(--secondary-color)' }}>Financial Outlook</h3>
              <ul style={{ paddingLeft: '20px', color: 'var(--text-muted)', fontSize: '15px' }}>
                <li style={{ marginBottom: '10px' }}><strong>Wealth Indicators:</strong> Steady accumulation of wealth; real estate investments look favorable.</li>
                <li style={{ marginBottom: '10px' }}><strong>Savings:</strong> Disciplined approach to savings, though occasional luxury expenses may arise.</li>
                <li style={{ marginBottom: '10px' }}><strong>Major Periods:</strong> Significant financial growth expected during the upcoming Saturn Mahadasha.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* --- SECTION 9: Specific Overviews --- */}
        <div className={styles.section}>
          <div className={styles.grid2}>
            <div>
              <h2 className={styles.sectionTitle}><Heart size={24} /> Relationships</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7' }}>
                Your chart indicates a deep desire for stability in relationships. You value loyalty and intellectual connection. While early life may see some fluctuations, marriage brings a grounded and supportive partner who will contribute positively to your personal and professional growth.
              </p>
            </div>
            <div>
              <h2 className={styles.sectionTitle}><Activity size={24} /> Health Overview</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7' }}>
                Overall vitality is strong. However, planetary transits suggest being mindful of digestive health and stress management. Incorporating regular yoga and a balanced diet will yield excellent long-term benefits. (Note: Astrological indications do not replace medical advice).
              </p>
            </div>
          </div>
          <div className={styles.grid2} style={{ marginTop: '40px' }}>
            <div>
              <h2 className={styles.sectionTitle}><BookOpen size={24} /> Education</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7' }}>
                A lifelong learner. You possess a sharp intellect and a penchant for research. Higher education or continuous skill development in technical or analytical fields will be highly rewarding.
              </p>
            </div>
            <div>
              <h2 className={styles.sectionTitle}><Users size={24} /> Family</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7' }}>
                Family bonds are significant to your overall happiness. You are likely to take on responsibilities early and serve as a pillar of support for your relatives. Harmonious relations with siblings are indicated.
              </p>
            </div>
          </div>
        </div>

        {/* --- SECTION 10: General & Panchang Snapshot --- */}
        <div className={styles.section}>
          <div className={styles.grid2}>
            <div>
              <h2 className={styles.sectionTitle}><Compass size={24} /> Favourable Elements</h2>
              <ul style={{ padding: 0, listStyle: 'none' }}>
                <li style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Lucky Colours</span>
                  <span style={{ fontWeight: 500 }}>White, Light Blue, Green</span>
                </li>
                <li style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Lucky Numbers</span>
                  <span style={{ fontWeight: 500 }}>2, 5, 7</span>
                </li>
                <li style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Lucky Days</span>
                  <span style={{ fontWeight: 500 }}>Monday, Wednesday, Friday</span>
                </li>
                <li style={{ padding: '10px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Favourable Directions</span>
                  <span style={{ fontWeight: 500 }}>North, North-West</span>
                </li>
              </ul>
            </div>
            <div>
              <h2 className={styles.sectionTitle}><Sun size={24} /> Transit & General Guidance</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7', marginBottom: '15px' }}>
                <strong>Current Transits:</strong> Jupiter's transit is currently blessing your house of fortune, bringing opportunities for travel and learning. Saturn requires patience and hard work in your career sector over the next 18 months.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.7' }}>
                <strong>General Advice:</strong> Trust your intuition, but rely on your analytical skills before making major financial commitments. Cultivating patience will be your greatest asset during challenging planetary periods.
              </p>
            </div>
          </div>
        </div>

        {/* --- SECTION 11: Call to Action --- */}
        <div className={styles.section}>
          <div className={styles.callToAction}>
            <h3>Ready for deeper insights?</h3>
            <p style={{ marginBottom: '24px', fontSize: '16px', opacity: 0.9 }}>
              This report provides a structured overview of your birth chart. For a detailed interpretation tailored to your personal circumstances, you may book a consultation with a Punyam astrologer.
            </p>
            <Link href="/astrology" className="btn" style={{ backgroundColor: 'var(--white)', color: 'var(--primary-color)', fontSize: '16px', padding: '14px 32px' }}>
              Book Expert Consultation
            </Link>
          </div>
        </div>

        {/* --- SECTION 12: About & Disclaimer --- */}
        <div className={styles.disclaimer}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '15px', color: 'var(--primary-color)', fontWeight: 600 }}>
            <Info size={16} /> About Punyam
          </div>
          <p style={{ maxWidth: '800px', margin: '0 auto 20px', lineHeight: '1.6' }}>
            Punyam is a premier platform dedicated to providing authentic Vedic astrology services, spiritual products, and guidance to help individuals navigate their life journey with clarity and purpose.
          </p>
          <div style={{ width: '50px', height: '1px', backgroundColor: '#ccc', margin: '0 auto 20px' }}></div>
          <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '11px', color: '#888', lineHeight: '1.5' }}>
            <strong>Disclaimer:</strong> Astrology is an interpretive science. This report is provided for informational and guidance purposes only. It should not be treated as a substitute for professional advice in legal, financial, or medical matters. Punyam accepts no liability for any actions taken based on the contents of this report.
          </p>
        </div>

      </div>
    </div>
  );
}
