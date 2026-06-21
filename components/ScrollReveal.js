'use client';

import { useEffect } from 'react';

export default function ScrollReveal() {
  useEffect(() => {
    // Signal to CSS that JS is ready — initial hidden states activate
    document.documentElement.classList.add('scroll-reveal-ready');

    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = el.dataset.revealDelay ?? '0';
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add('is-visible');
          io.unobserve(el); // fire once only
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' },
    );

    els.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      document.documentElement.classList.remove('scroll-reveal-ready');
    };
  }, []);

  return null;
}
