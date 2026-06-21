'use client';
import { useState, useEffect } from 'react';

const PARTY = new Date('2026-07-18T00:00:00');

function pad(n) { return String(n).padStart(2, '0'); }

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const tick = () => {
      const diff = PARTY - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000)  / 60000),
        seconds: Math.floor((diff % 60000)    / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!timeLeft) return null;

  if (PARTY <= Date.now()) {
    return <p className="countdown-party-time">🎉 It&apos;s Party Time! 🎉</p>;
  }

  return (
    <div className="countdown-strip">
      <span className="countdown-label">Party starts in</span>
      <div className="countdown-cells">
        {[
          { value: timeLeft.days,    unit: 'Days'  },
          { value: timeLeft.hours,   unit: 'Hours' },
          { value: timeLeft.minutes, unit: 'Min'   },
          { value: timeLeft.seconds, unit: 'Sec'   },
        ].map(({ value, unit }) => (
          <div key={unit} className="countdown-cell">
            <span className="countdown-num">{pad(value)}</span>
            <span className="countdown-unit">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
