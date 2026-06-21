'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_KEY   = 'mickey_rsvp';
const FORMSPREE_URL = 'https://formspree.io/f/xlgyrnpj';

// ── Mickey icons ────────────────────────────────────────────────────────────

// Large Mickey for modal header + celebration panel
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

// Small Mickey used inside each guest-count button; fill follows CSS currentColor
function TinyMickey() {
  return (
    <svg
      className="guest-mickey-svg"
      width="34"
      height="30"
      viewBox="0 0 200 175"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="52"   cy="50"  r="46"      fill="currentColor" />
      <circle cx="148"  cy="50"  r="46"      fill="currentColor" />
      <ellipse cx="100" cy="122" rx="78" ry="60" fill="currentColor" />
    </svg>
  );
}

// ── Reusable guest-count button ──────────────────────────────────────────────
function GuestBtn({ value, selected, onClick }) {
  return (
    <button
      className={`guest-btn${selected ? ' guest-btn--selected' : ''}`}
      onClick={() => onClick(value)}
      aria-pressed={selected}
    >
      <TinyMickey />
      <span className="guest-num">{value}</span>
      <span className="guest-label">{value === 1 ? 'guest' : 'guests'}</span>
    </button>
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

const EMPTY_FORM = {
  yourName: '',
  guest1: '',
  guest2: '',
  guest3: '',
  additionalGuests: '',
  notes: '',
};

// ── Main component ───────────────────────────────────────────────────────────

export default function RSVPSection() {
  const [total,        setTotal]        = useState(null);
  const [displayTotal, setDisplayTotal] = useState(0);
  const [hasRSVPd,     setHasRSVPd]     = useState(false);
  // modalStep: null | 'size' | 'form'
  const [modalStep,    setModalStep]    = useState(null);
  const [guestCount,   setGuestCount]   = useState(null);
  const [showMore,     setShowMore]     = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [submitting,   setSubmitting]   = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [formError,    setFormError]    = useState(null);
  const [formData,     setFormData]     = useState(EMPTY_FORM);
  const prevTotalRef = useRef(0);
  const magnetRef    = useRef(null);

  // Fetch current total + hydrate localStorage state
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY)) setHasRSVPd(true);
    } catch {}

    fetch('/api/rsvp')
      .then((r) => r.json())
      .then((data) => setTotal(data.total ?? 0))
      .catch(() => setTotal(0))
      .finally(() => setLoading(false));
  }, []);

  // Count-up animation whenever `total` changes
  useEffect(() => {
    if (total === null) return;
    const from = prevTotalRef.current;
    const to   = total;
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
  }, [total]);

  // Close modal on Escape key
  useEffect(() => {
    if (!modalStep) return;
    const onKey = (e) => { if (e.key === 'Escape') setModalStep(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modalStep]);

  // ── Step 1: user picks group size → advance to form ───────────────────────

  const handleGuestCountSelect = useCallback((count) => {
    setGuestCount(count);
    setFormData(EMPTY_FORM);
    setFormError(null);
    setModalStep('form');
  }, []);

  // ── Form helpers ───────────────────────────────────────────────────────────

  const updateField = useCallback(
    (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value })),
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
    // Auto-expand "More" section if their previous pick was 5+
    if (guestCount !== null && guestCount >= 5) setShowMore(true);
    setModalStep('size');
  }, [guestCount]);

  // ── Step 2: submit Formspree + increment Redis counter ────────────────────

  const handleFormSubmit = useCallback(async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      // Build Formspree payload
      const payload = {
        '_subject':                     `RSVP: ${formData.yourName} (party of ${guestCount})`,
        'Your Name':                    formData.yourName,
        'Guest Count':                  String(guestCount),
        'Notes / Dietary Restrictions': formData.notes || 'None',
      };
      if (guestCount >= 2)  payload['Guest 1 Name']     = formData.guest1;
      if (guestCount >= 3)  payload['Guest 2 Name']     = formData.guest2;
      if (guestCount >= 4) {
        payload['Guest 3 Name'] = formData.guest3;
        if (formData.additionalGuests) payload['Additional Guests'] = formData.additionalGuests;
      }

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

      // 2. Increment Redis counter (non-critical — ignore 429 / network failures)
      try {
        const apiRes = await fetch('/api/rsvp', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ guests: guestCount }),
        });
        if (apiRes.ok) {
          const apiData = await apiRes.json();
          setTotal(apiData.total);
        }
      } catch { /* counter update is non-critical */ }

      // 3. Mark locally & celebrate
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ guests: guestCount, ts: Date.now() }));
      setHasRSVPd(true);
      setModalStep(null);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1600);
    } catch (err) {
      setFormError(err?.message ?? 'Something went wrong — please try again!');
    } finally {
      setSubmitting(false);
    }
  }, [formData, guestCount]);

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

        {/* Live counter with count-up animation */}
        <div className="counter-display" aria-live="polite" aria-label="Guest attendance count">
          {loading ? (
            <span className="spinner" aria-label="Loading guest count" />
          ) : (
            <>🎉 {displayTotal.toLocaleString()} guests attending!</>
          )}
        </div>

        {/* CTA — three states: celebrated / submitting / default */}
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
              setGuestCount(null);
              setShowMore(false);
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

      {/* ── Modal ──────────────────────────────────────────── */}
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

            {/* ── Step 1: group size picker ── */}
            {modalStep === 'size' ? (
              <>
                <h3 className="modal-title" id="modal-title">
                  How many in your group?
                </h3>
                <p className="modal-sub">We want to make sure we have room for everyone!</p>

                {/* Initial 4 buttons */}
                <div className="guest-grid">
                  {[1, 2, 3, 4].map((n) => (
                    <GuestBtn
                      key={n}
                      value={n}
                      selected={guestCount === n}
                      onClick={handleGuestCountSelect}
                    />
                  ))}
                </div>

                {/* More... / Less toggle */}
                <button
                  className="guest-more-btn"
                  onClick={() => setShowMore((v) => !v)}
                  aria-expanded={showMore}
                >
                  {showMore ? 'Less ▲' : 'More... ▼'}
                </button>

                {/* Expandable 5–10 */}
                <div className={`guest-grid-more${showMore ? ' guest-grid-more--open' : ''}`}>
                  {[5, 6, 7, 8, 9, 10].map((n) => (
                    <GuestBtn
                      key={n}
                      value={n}
                      selected={guestCount === n}
                      onClick={handleGuestCountSelect}
                    />
                  ))}
                </div>

                <button
                  className="modal-cancel"
                  style={{ marginTop: 16 }}
                  onClick={() => setModalStep(null)}
                >
                  Cancel
                </button>
              </>
            ) : (
              /* ── Step 2: name form ── */
              <form className="rsvp-form" onSubmit={handleFormSubmit}>
                <h3 className="modal-title" id="modal-title">
                  Almost there! 🎉
                </h3>
                <p className="modal-sub">
                  Party of {guestCount} — tell us your name{guestCount > 1 ? 's' : ''}!
                </p>

                {formError && <p className="modal-error">⚠️ {formError}</p>}

                <div className="form-field">
                  <label className="form-label" htmlFor="yourName">Your Name *</label>
                  <input
                    id="yourName"
                    className="form-input"
                    type="text"
                    required
                    placeholder="Your name"
                    value={formData.yourName}
                    onChange={updateField('yourName')}
                  />
                </div>

                {guestCount >= 2 && (
                  <div className="form-field">
                    <label className="form-label" htmlFor="guest1">Guest 1 Name</label>
                    <input
                      id="guest1"
                      className="form-input"
                      type="text"
                      placeholder="Guest's name"
                      value={formData.guest1}
                      onChange={updateField('guest1')}
                    />
                  </div>
                )}

                {guestCount >= 3 && (
                  <div className="form-field">
                    <label className="form-label" htmlFor="guest2">Guest 2 Name</label>
                    <input
                      id="guest2"
                      className="form-input"
                      type="text"
                      placeholder="Guest's name"
                      value={formData.guest2}
                      onChange={updateField('guest2')}
                    />
                  </div>
                )}

                {guestCount >= 4 && (
                  <>
                    <div className="form-field">
                      <label className="form-label" htmlFor="guest3">Guest 3 Name</label>
                      <input
                        id="guest3"
                        className="form-input"
                        type="text"
                        placeholder="Guest's name"
                        value={formData.guest3}
                        onChange={updateField('guest3')}
                      />
                    </div>
                    <div className="form-field">
                      <label className="form-label" htmlFor="additionalGuests">
                        Additional Guests {guestCount > 4 ? `(guests 4–${guestCount})` : ''}
                      </label>
                      <input
                        id="additionalGuests"
                        className="form-input"
                        type="text"
                        placeholder="Names of any additional guests"
                        value={formData.additionalGuests}
                        onChange={updateField('additionalGuests')}
                      />
                    </div>
                  </>
                )}

                <div className="form-field">
                  <label className="form-label" htmlFor="notes">Notes / Dietary Restrictions</label>
                  <textarea
                    id="notes"
                    className="form-textarea"
                    placeholder="Any allergies, dietary needs, or notes for us?"
                    value={formData.notes}
                    onChange={updateField('notes')}
                  />
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
