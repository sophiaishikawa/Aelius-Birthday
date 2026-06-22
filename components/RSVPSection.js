'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY   = 'mickey_rsvp';
const FORMSPREE_URL = 'https://formspree.io/f/xlgyrnpj';

// ── Mickey icons ────────────────────────────────────────────────────────────

function ModalMickey() {
  return (
    <svg
      width="64"
      height="56"
      viewBox="0 0 200 175"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="52"   cy="50"  r="46"      fill="#1c1c1c" />
      <circle cx="148"  cy="50"  r="46"      fill="#1c1c1c" />
      <ellipse cx="100" cy="122" rx="78" ry="60" fill="#1c1c1c" />
    </svg>
  );
}

// ── Counter Mickey icons (gold, inline) ──────────────────────────────────────

function MickeyAdult() {
  return (
    <svg width="22" height="20" viewBox="0 0 200 175" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}>
      <circle cx="52"  cy="50"  r="46"     fill="#ffd700" />
      <circle cx="148" cy="50"  r="46"     fill="#ffd700" />
      <ellipse cx="100" cy="122" rx="78" ry="60" fill="#ffd700" />
    </svg>
  );
}

function MickeyKid() {
  return (
    <svg width="16" height="14" viewBox="0 0 200 175" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 4 }}>
      <circle cx="52"  cy="50"  r="46"     fill="#ffd700" />
      <circle cx="148" cy="50"  r="46"     fill="#ffd700" />
      <ellipse cx="100" cy="122" rx="78" ry="60" fill="#ffd700" />
    </svg>
  );
}

// ── Stepper icons ────────────────────────────────────────────────────────────

function AdultIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="6" r="4" fill="#1c1c1c" />
      <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#1c1c1c" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function KidIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="7" r="3.5" fill="#1c1c1c" />
      <path d="M6 21c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke="#1c1c1c" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ── Stepper component ────────────────────────────────────────────────────────

function Stepper({ label, value, min, max, onChange }) {
  return (
    <div className="stepper-row">
      <span className="stepper-label">{label}</span>
      <div className="stepper-controls">
        <button
          type="button"
          className="stepper-btn"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
        >
          −
        </button>
        <span className="stepper-value">{value}</span>
        <button
          type="button"
          className="stepper-btn"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}

// ── Static data ──────────────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#e8262d', '#ffd700', '#ffffff', '#ff9eb5', '#a8d8ff'];
const CONFETTI_PIECES = Array.from({ length: 48 }, (_, i) => {
  const angle    = (i / 48) * 360 + (Math.random() * 12 - 6);
  const distance = 80 + Math.random() * 160;
  const rad      = (angle * Math.PI) / 180;
  return {
    id:       i,
    color:    CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    x:        Math.cos(rad) * distance,
    y:        Math.sin(rad) * distance,
    rotation: Math.random() * 720 - 360,
    w:        6 + Math.random() * 6,
    h:        8 + Math.random() * 10,
    delay:    (Math.random() * 0.25).toFixed(2),
  };
});

const BALLOONS = [
  { emoji: '🎈', left: '5%',  delay: '0s',   dur: '9s'  },
  { emoji: '⭐', left: '15%', delay: '1.2s', dur: '11s' },
  { emoji: '🎈', left: '28%', delay: '2.5s', dur: '8s'  },
  { emoji: '🎊', left: '42%', delay: '0.7s', dur: '12s' },
  { emoji: '⭐', left: '60%', delay: '3.1s', dur: '9s'  },
  { emoji: '🎈', left: '73%', delay: '1.7s', dur: '10s' },
  { emoji: '🎊', left: '85%', delay: '0.4s', dur: '11s' },
  { emoji: '⭐', left: '93%', delay: '2.2s', dur: '8s'  },
];

const EMPTY_FORM = { adultNames: [''], kidsNames: '' };

// ── Main component ───────────────────────────────────────────────────────────

export default function RSVPSection() {
  const [totalCount,   setTotalCount]   = useState(null);
  const [adultsCount,  setAdultsCount]  = useState(0);
  const [kidsCount,    setKidsCount]    = useState(0);
  const [displayTotal, setDisplayTotal] = useState(0);
  const [hasRSVPd,     setHasRSVPd]     = useState(false);
  // modalStep: null | 'size' | 'form'
  const [modalStep,    setModalStep]    = useState(null);
  const [adults,       setAdults]       = useState(1);
  const [kids,         setKids]         = useState(0);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [formError,    setFormError]    = useState(null);
  const [formData,     setFormData]     = useState(EMPTY_FORM);
  const prevTotalRef = useRef(0);
  const magnetRef    = useRef(null);

  // Fetch current totals + hydrate localStorage state
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) setHasRSVPd(true);
    } catch {}

    fetch('/api/rsvp')
      .then((r) => r.json())
      .then((data) => {
        setTotalCount(data.total   ?? 0);
        setAdultsCount(data.adults ?? 0);
        setKidsCount(data.kids     ?? 0);
      })
      .catch(() => setTotalCount(0))
      .finally(() => setLoading(false));
  }, []);

  // Count-up animation whenever `totalCount` changes
  useEffect(() => {
    if (totalCount === null) return;
    const from = prevTotalRef.current;
    const to   = totalCount;
    prevTotalRef.current = to;
    if (from === to) { setDisplayTotal(to); return; }
    const duration  = 1000;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      setDisplayTotal(Math.round(from + (to - from) * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [totalCount]);

  // Close modal on Escape key
  useEffect(() => {
    if (!modalStep) return;
    const onKey = (e) => { if (e.key === 'Escape') setModalStep(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modalStep]);

  // ── Step 1 → Step 2 ──────────────────────────────────────────────────────

  const handleConfirmSize = useCallback(() => {
    setFormData({ adultNames: Array(adults).fill(''), kidsNames: '' });
    setFormError(null);
    setModalStep('form');
  }, [adults]);

  // ── Form helpers ──────────────────────────────────────────────────────────

  const updateField = useCallback(
    (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value })),
    [],
  );

  const updateAdultName = useCallback(
    (index) => (e) => setFormData((prev) => {
      const adultNames = [...prev.adultNames];
      adultNames[index] = e.target.value;
      return { ...prev, adultNames };
    }),
    [],
  );

  // ── Magnetic RSVP button ──────────────────────────────────────────────────

  const handleMagnet = useCallback((e) => {
    const btn = magnetRef.current;
    if (!btn || hasRSVPd) return;
    const rect = btn.getBoundingClientRect();
    const dx = (e.clientX - (rect.left + rect.width  / 2)) * 0.2;
    const dy = (e.clientY - (rect.top  + rect.height / 2)) * 0.2;
    btn.style.transform = `translate(${dx}px, ${dy}px) scale(1.05)`;
    btn.style.animation = 'none';
  }, [hasRSVPd]);

  const handleMagnetLeave = useCallback(() => {
    const btn = magnetRef.current;
    if (!btn) return;
    btn.style.transform = '';
    btn.style.animation = '';
  }, []);

  const goBackToSize = useCallback(() => {
    setModalStep('size');
  }, []);

  // ── Step 2: submit Formspree + increment Redis ────────────────────────────

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const total = adults + kids;

    try {
      const adultNameEntries = formData.adultNames.reduce((acc, name, i) => {
        acc[adults === 1 ? 'Your Name' : `Adult ${i + 1} Name`] = name;
        return acc;
      }, {});

      const payload = {
        '_subject':    `RSVP: ${formData.adultNames[0]} (${adults} adult${adults !== 1 ? 's' : ''}, ${kids} kid${kids !== 1 ? 's' : ''})`,
        ...adultNameEntries,
        'Adults':      String(adults),
        'Kids':        String(kids),
        'Total Guests': String(total),
        "Kids' Names": formData.kidsNames || 'N/A',
      };

      // 1. Submit to Formspree
      const formRes = await fetch(FORMSPREE_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (!formRes.ok) {
        const data = await formRes.json().catch(() => ({}));
        throw new Error(data.error ?? 'Submission failed — please try again!');
      }

      // 2. Increment Redis counters (non-critical)
      try {
        const apiRes = await fetch('/api/rsvp', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ adults, kids }),
        });
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          setTotalCount(apiData.total);
          setAdultsCount(apiData.adults);
          setKidsCount(apiData.kids);
        } else {
          const errData = await apiRes.json().catch(() => ({}));
          console.error('[rsvp] counter API non-ok:', apiRes.status, errData);
        }
      } catch (err) { console.error('[rsvp] counter fetch failed:', err); }

      // 3. Mark locally & celebrate
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ adults, kids, total, ts: Date.now() }));
      setHasRSVPd(true);
      setModalStep(null);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1600);
    } catch (err) {
      setFormError(err?.message ?? 'Something went wrong — please try again!');
    } finally {
      setSubmitting(false);
    }
  }, [formData, adults, kids]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <section className="rsvp-section" id="rsvp">

        {/* Floating balloons — only after RSVP */}
        {hasRSVPd && (
          <div className="rsvp-balloons" aria-hidden="true">
            {BALLOONS.map((b, i) => (
              <span
                key={i}
                className="rsvp-balloon"
                style={{ left: b.left, animationDelay: b.delay, animationDuration: b.dur }}
              >
                {b.emoji}
              </span>
            ))}
          </div>
        )}

        {/* Confetti burst on successful RSVP */}
        {showConfetti && (
          <div className="confetti-container" aria-hidden="true">
            {CONFETTI_PIECES.map((p) => (
              <span
                key={p.id}
                className="confetti-piece"
                style={{
                  '--x': `${p.x}px`,
                  '--y': `${p.y}px`,
                  '--r': `${p.rotation}deg`,
                  background: p.color,
                  width: p.w,
                  height: p.h,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}
          </div>
        )}

        <h2 className="rsvp-heading">Will you be there?</h2>
        <p className="rsvp-sub">Let us know you&apos;re coming — every guest counts! 🎈</p>

        {/* Live counter */}
        <div className="counter-display" aria-live="polite" aria-label="Guest attendance count">
          {loading ? (
            <span className="spinner" aria-label="Loading guest count" />
          ) : (
            <div className="counter-grid">
              <div className="counter-total">🎉 {displayTotal.toLocaleString()} total guests</div>
              <div className="counter-breakdown">
                <span><MickeyAdult />{adultsCount.toLocaleString()} adults</span>
                <span className="counter-divider">·</span>
                <span><MickeyKid />{kidsCount.toLocaleString()} kids</span>
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        {hasRSVPd ? (
          <div className="rsvp-celebration">
            <div className="celebration-mickey"><ModalMickey /></div>
            <p className="celebration-heading">Yay! See you at Aelius Ry&apos;s party! 🎉</p>
            <p className="celebration-sub">We can&apos;t wait to celebrate with you!</p>
          </div>
        ) : submitting ? (
          <div className="rsvp-submitting">
            <span className="spinner" />
            Sending your RSVP...
          </div>
        ) : (
          <button
            ref={magnetRef}
            className="attend-btn"
            onClick={() => {
              setAdults(1);
              setKids(0);
              setModalStep('size');
            }}
            onMouseMove={handleMagnet}
            onMouseLeave={handleMagnetLeave}
            aria-label="RSVP to the party"
          >
            I&apos;m Attending! 🎉
          </button>
        )}
      </section>

      {/* ── Modal ──────────────────────────────────────── */}
      {modalStep && (
        <div
          className="modal-overlay"
          onClick={() => setModalStep(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-ears">
              <ModalMickey />
            </div>

            {/* ── Step 1: adults / kids steppers ── */}
            {modalStep === 'size' ? (
              <>
                <h3 className="modal-title" id="modal-title">
                  Who&apos;s coming?
                </h3>
                <p className="modal-sub">Tell us how many adults and kids!</p>

                <div className="stepper-group">
                  <Stepper
                    label={<><AdultIcon /> Adults</>}
                    value={adults}
                    min={1}
                    max={10}
                    onChange={setAdults}
                  />
                  <Stepper
                    label={<><KidIcon /> Kids</>}
                    value={kids}
                    min={0}
                    max={10}
                    onChange={setKids}
                  />
                </div>

                <p className="stepper-total">
                  Total: <strong>{adults + kids}</strong> {adults + kids === 1 ? 'guest' : 'guests'}
                </p>

                <button className="stepper-confirm-btn" onClick={handleConfirmSize}>
                  Confirm →
                </button>

                <button
                  className="modal-cancel"
                  style={{ marginTop: 12 }}
                  onClick={() => setModalStep(null)}
                >
                  Cancel
                </button>
              </>
            ) : (
              /* ── Step 2: name + notes form ── */
              <form className="rsvp-form" onSubmit={handleFormSubmit}>
                <h3 className="modal-title" id="modal-title">
                  Almost there! 🎉
                </h3>

                {formError && <p className="modal-error">⚠️ {formError}</p>}

                {formData.adultNames.map((name, i) => (
                  <div className="form-field" key={i}>
                    <label className="form-label" htmlFor={`adult-${i}`}>
                      {adults === 1 ? 'Your Name' : `Adult ${i + 1} Name`} *
                    </label>
                    <input
                      id={`adult-${i}`}
                      className="form-input"
                      type="text"
                      required
                      placeholder={adults === 1 ? 'Your name' : `Adult ${i + 1} name`}
                      value={name}
                      onChange={updateAdultName(i)}
                    />
                  </div>
                ))}

                {kids > 0 && (
                  <div className="form-field">
                    <label className="form-label" htmlFor="kidsNames">What are your kids&apos; names?</label>
                    <input
                      id="kidsNames"
                      className="form-input"
                      type="text"
                      placeholder="e.g. Emma, Lucas, Anna..."
                      value={formData.kidsNames}
                      onChange={updateField('kidsNames')}
                    />
                  </div>
                )}

                <div className="rsvp-summary">
                  You&apos;re bringing {adults} adult{adults !== 1 ? 's' : ''} and {kids} kid{kids !== 1 ? 's' : ''} 🎉
                </div>

                <button
                  type="submit"
                  className="form-submit-btn"
                  disabled={submitting}
                >
                  {submitting ? '✨ Sending...' : 'Confirm RSVP 🎉'}
                </button>

                <button
                  type="button"
                  className="modal-cancel"
                  onClick={goBackToSize}
                  disabled={submitting}
                >
                  ← Back
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
