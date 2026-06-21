'use client';

import { useEffect, useRef, useState } from 'react';

export default function MickeyCursor() {
  const cursorRef = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    // Only on fine-pointer (mouse) devices — skip touch / mobile
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    let x = -100, y = -100;
    let rafId;

    document.body.classList.add('custom-cursor');
    setActive(true);

    const onMove = (e) => { x = e.clientX; y = e.clientY; };

    const render = () => {
      // Center the 40×35 SVG on the tip-point (between the ears)
      cursor.style.transform = `translate(${x - 20}px, ${y - 18}px)`;
      rafId = requestAnimationFrame(render);
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    rafId = requestAnimationFrame(render);

    return () => {
      document.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(rafId);
      document.body.classList.remove('custom-cursor');
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className={`mickey-cursor${active ? ' mickey-cursor--active' : ''}`}
      aria-hidden="true"
    >
      <svg
        width="40"
        height="35"
        viewBox="0 0 200 175"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="52"   cy="50"  r="46"      fill="#1c1c1c" />
        <circle cx="148"  cy="50"  r="46"      fill="#1c1c1c" />
        <ellipse cx="100" cy="122" rx="78" ry="60" fill="#1c1c1c" />
      </svg>
    </div>
  );
}
