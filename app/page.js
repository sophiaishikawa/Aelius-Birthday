import RSVPSection from '@/components/RSVPSection';
import CountdownTimer from '@/components/CountdownTimer';
import MickeyCursor from '@/components/MickeyCursor';
import ScrollReveal from '@/components/ScrollReveal';

// ── Toggle sparkles on/off — change to false to remove ───────────────────────
const SHOW_SPARKLES = true;

// ── Mickey Mouse head silhouette (pure SVG, no external assets) ──────────────
function MickeySilhouette({ width = 180 }) {
  const height = Math.round(width * 0.92);
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 185"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mickey-silhouette"
      aria-hidden="true"
    >
      <circle cx="52" cy="50" r="46" fill="#1c1c1c" />
      <circle cx="148" cy="50" r="46" fill="#1c1c1c" />
      <ellipse cx="100" cy="122" rx="78" ry="65" fill="#1c1c1c" />
      <ellipse cx="86" cy="110" rx="11" ry="13" fill="white" opacity="0.08" />
      <ellipse cx="114" cy="110" rx="11" ry="13" fill="white" opacity="0.08" />
    </svg>
  );
}

function MickeyEarsSmall() {
  return (
    <svg
      width="32"
      height="22"
      viewBox="0 0 80 55"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 8 }}
    >
      <circle cx="20" cy="20" r="18" fill="#1c1c1c" />
      <circle cx="60" cy="20" r="18" fill="#1c1c1c" />
      <ellipse cx="40" cy="44" rx="30" ry="22" fill="#1c1c1c" />
    </svg>
  );
}

const SPARKLES = [
  { top: '8%',  left: '7%',   size: '0.55rem', delay: '0s',    dur: '2.8s', color: '#ffd700' },
  { top: '14%', left: '82%',  size: '0.45rem', delay: '0.5s',  dur: '3.2s', color: '#ffffff' },
  { top: '28%', left: '4%',   size: '0.7rem',  delay: '1.1s',  dur: '2.5s', color: '#ffd700' },
  { top: '35%', left: '91%',  size: '0.5rem',  delay: '1.8s',  dur: '3s',   color: '#ffffff' },
  { top: '52%', left: '2%',   size: '0.6rem',  delay: '0.3s',  dur: '3.4s', color: '#ffd700' },
  { top: '60%', left: '94%',  size: '0.4rem',  delay: '2.1s',  dur: '2.7s', color: '#ffffff' },
  { top: '72%', left: '8%',   size: '0.5rem',  delay: '0.9s',  dur: '3.1s', color: '#ffd700' },
  { top: '78%', left: '88%',  size: '0.65rem', delay: '1.5s',  dur: '2.9s', color: '#ffffff' },
  { top: '20%', left: '48%',  size: '0.4rem',  delay: '2.4s',  dur: '3.3s', color: '#ffd700' },
  { top: '85%', left: '52%',  size: '0.45rem', delay: '0.7s',  dur: '2.6s', color: '#ffffff' },
  { top: '45%', left: '96%',  size: '0.55rem', delay: '1.3s',  dur: '3s',   color: '#ffd700' },
  { top: '6%',  left: '55%',  size: '0.5rem',  delay: '1.9s',  dur: '2.8s', color: '#ffffff' },
];

const STARS = [
  { top: '12%',  left: '6%',   delay: '0s',    size: '1.3rem' },
  { top: '22%',  right: '8%',  delay: '0.6s',  size: '1.1rem' },
  { top: '55%',  left: '4%',   delay: '1.1s',  size: '1.4rem' },
  { top: '70%',  right: '6%',  delay: '1.7s',  size: '1.6rem' },
  { top: '38%',  left: '3%',   delay: '2.1s',  size: '0.9rem' },
  { top: '80%',  left: '14%',  delay: '0.8s',  size: '1rem'   },
  { top: '18%',  right: '18%', delay: '1.4s',  size: '1.2rem' },
  { top: '62%',  right: '4%',  delay: '0.3s',  size: '1rem'   },
  { top: '48%',  right: '16%', delay: '2.5s',  size: '0.85rem'},
];

const GIFTS = [
  { emoji: '🐣', bg: '#e8f4ff', category: 'Diapers',          desc: 'Any brand, size 2 and above'        },
  { emoji: '🛁', bg: '#f0e8ff', category: 'Lotion & Baby Wash', desc: 'Gentle, fragrance-free preferred'  },
  { emoji: '🧦', bg: '#e8fff4', category: 'Clothing',          desc: 'Size 12–18 months and up'          },
  { emoji: '🌙', bg: '#fff8e8', category: 'Books',             desc: 'Board books and picture books'      },
  { emoji: '🧸', bg: '#ffe8f0', category: 'Toys',              desc: 'Age-appropriate toys for 1 year old'},
];

const DRESS_COLORS = [
  { hex: '#E8262D', label: 'Mickey Red'    },
  { hex: '#1C1C1C', label: 'Mickey Black'  },
  { hex: '#FFD700', label: 'Mickey Gold'   },
  { hex: '#FFFFFF', label: 'Classic White' },
  { hex: '#FF69B4', label: 'Party Pink'    },
];

export default function Home() {
  return (
    <main>
      {/* Client-side enhancements — render nothing visually */}
      <MickeyCursor />
      <ScrollReveal />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="hero">
        {/* Grain texture overlay */}
        <div className="hero-grain" aria-hidden="true" />

        {/* Sparkles */}
        {SHOW_SPARKLES && (
          <div className="hero-sparkles" aria-hidden="true">
            {SPARKLES.map((s, i) => (
              <span
                key={i}
                className="hero-sparkle"
                style={{
                  top: s.top, left: s.left,
                  fontSize: s.size, color: s.color,
                  animationDelay: s.delay, animationDuration: s.dur,
                }}
              >✦</span>
            ))}
          </div>
        )}

        {/* Floating stars */}
        <div className="hero-stars" aria-hidden="true">
          {STARS.map((s, i) => (
            <span
              key={i}
              className="hero-star"
              style={{
                top: s.top, left: s.left, right: s.right,
                fontSize: s.size, animationDelay: s.delay,
              }}
            >⭐</span>
          ))}
        </div>

        {/* Large Mickey silhouette background */}
        <div className="mickey-bg">
          <MickeySilhouette width={380} />
        </div>

        {/* Staggered hero content */}
        <div className="hero-content">
          <div className="birthday-tag hero-reveal-0">✨ First Birthday ✨</div>

          <div className="photo-frame hero-reveal-1">
            <div className="photo-placeholder">
              <span className="photo-emoji">👶</span>
              <span className="photo-label">Aelius Ry&apos;s Photo</span>
            </div>
          </div>

          <h1 className="hero-name hero-reveal-2">Aelius Ry&apos;s</h1>
        </div>
      </section>

      {/* ── EVENT DETAILS ─────────────────────────────────── */}
      <section className="event-details">
        <h2 className="section-heading" data-reveal>
          <MickeyEarsSmall />
          Party Details
        </h2>
        <div className="section-rule" data-reveal data-reveal-delay="80" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '860px', margin: '0 auto 40px' }}>
          <div className="detail-card date-card" data-reveal data-reveal-delay="0"
            style={{ width: '100%', minHeight: '160px' }}>
            <span className="detail-icon">📅</span>
            <div className="detail-label">Date</div>
            <div className="detail-value">July 18, 2026</div>
          </div>

          <div className="detail-card time-card" data-reveal data-reveal-delay="130"
            style={{ width: '100%', minHeight: '160px' }}>
            <span className="detail-icon">🕐</span>
            <div className="detail-label">Time</div>
            <div className="detail-value">Coming Soon</div>
            <div className="detail-hint">Replace with your time</div>
          </div>

          <div className="detail-card" data-reveal data-reveal-delay="260"
            style={{ width: '100%', minHeight: '160px', background: '#1c1c1c', borderColor: 'rgba(255,255,255,0.15)' }}>
            <span className="detail-icon">📍</span>
            <div className="detail-label" style={{ color: 'rgba(255,255,255,0.6)' }}>Venue</div>
            <div className="detail-value" style={{ color: '#ffffff' }}>Coming Soon</div>
            <div className="detail-hint" style={{ color: 'rgba(255,255,255,0.4)' }}>Replace with your venue</div>
          </div>
        </div>

        <div data-reveal data-reveal-delay="120">
          <CountdownTimer />
        </div>

        <div className="description-card" data-reveal data-reveal-delay="180">
          🎈{' '}
          <em>
            Event description coming soon! Replace this with your party details — dress code, gift
            info, food, activities, and anything else your guests need to know!
          </em>{' '}
          🎈
        </div>
      </section>

      {/* ── LOCATION ──────────────────────────────────────── */}
      <section className="location-section">
        <h2 className="section-heading" data-reveal>
          <MickeyEarsSmall />
          How to Find Us 📍
        </h2>
        <div className="section-rule" data-reveal data-reveal-delay="80" />

        <div className="map-illustrated" role="img" aria-label="Map coming soon" data-reveal data-reveal-delay="160">
          <div className="map-road-h" />
          <div className="map-road-v" />
          <div className="map-road-h map-road-h2" />
          <div className="map-road-v map-road-v2" />
          <div className="map-road-h map-road-h3" />
          <div className="map-road-v map-road-v3" />
          <div className="map-building mb1" />
          <div className="map-building mb2" />
          <div className="map-building mb3" />
          <div className="map-building mb4" />
          <div className="map-pin-center">
            <div className="map-pin-ring" />
            <span className="map-pin-emoji">📍</span>
          </div>
          <p className="map-coming-soon">Map coming soon</p>
        </div>

        <div className="location-chips" data-reveal data-reveal-delay="120">
          {['🅿️ Free Parking', '👶 Baby-friendly', '👗 Casual Dress', '🎂 Cake provided'].map((chip) => (
            <span key={chip} className="location-chip">{chip}</span>
          ))}
        </div>

        <div className="venue-card" data-reveal data-reveal-delay="200">
          <div className="venue-name">Venue Name Placeholder</div>
          <div className="venue-address">123 Party Lane, Celebration City, CA 90210</div>
          <a href="#" className="directions-btn">🗺️ Get Directions</a>
        </div>
      </section>

      {/* ── GIFT WISHES ────────────────────────────────────── */}
      <section className="gift-section">
        <h2 className="section-heading gift-heading" data-reveal>
          <MickeyEarsSmall />
          Gift Wishes 🎁
        </h2>
        <div className="section-rule" data-reveal data-reveal-delay="80" />

        <p className="gift-intro" data-reveal data-reveal-delay="120">
          Your presence is all that matters to us! But if you&apos;d like to bring a little
          something, Aelius Ry would love any of the following:
        </p>

        <div className="gift-grid">
          {GIFTS.map(({ emoji, bg, category, desc }, i) => (
            <div key={category} className="gift-card" data-reveal data-reveal-delay={String(i * 90)}>
              <span className="gift-emoji-bg" style={{ background: bg }}>
                <span className="gift-emoji">{emoji}</span>
              </span>
              <div className="gift-category">{category}</div>
              <div className="gift-description">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DRESS CODE ────────────────────────────────────── */}
      <section className="dress-code-section">
        <h2 className="section-heading" data-reveal>
          <MickeyEarsSmall />
          Dress Code
        </h2>
        <div className="section-rule" data-reveal data-reveal-delay="80" />
        <p className="dress-code-sub" data-reveal data-reveal-delay="130">
          Come dressed in our party colors!
        </p>

        <div className="dress-code-swatches">
          {DRESS_COLORS.map(({ hex, label }, i) => (
            <div key={hex} className="swatch-item" data-reveal data-reveal-delay={String(i * 80)}>
              <div className="swatch-circle" style={{ background: hex }} />
              <span className="swatch-hex">{hex}</span>
              <span className="swatch-label">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── RSVP (client component, loads its own data) ───── */}
      <RSVPSection />

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="footer">
        <p>Made with ❤️ for Aelius Ry&apos;s First Birthday 🎉</p>
      </footer>
    </main>
  );
}
