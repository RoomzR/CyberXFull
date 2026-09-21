import { useEffect, useState } from 'react';

interface CountdownProps {
  targetDate: string;
  label: string;
  featured?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(target: Date): TimeLeft | null {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function Countdown({ targetDate, label, featured = false }: CountdownProps) {
  const [left, setLeft] = useState<TimeLeft | null>(() => getTimeLeft(new Date(targetDate)));

  useEffect(() => {
    const tick = () => setLeft(getTimeLeft(new Date(targetDate)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (!left) return null;

  const units: { value: number; label: string }[] = [
    { value: left.days, label: 'D' },
    { value: left.hours, label: 'H' },
    { value: left.minutes, label: 'M' },
    { value: left.seconds, label: 'S' },
  ];

  return (
    <div className={`tournament-countdown${featured ? ' tournament-countdown--featured' : ''}`}>
      <p className="tournament-countdown__label">{label}</p>
      <div className="tournament-countdown__grid">
        {units.map(({ value, label: unitLabel }) => (
          <div key={unitLabel} className="tournament-countdown__unit">
            <span className="tournament-countdown__value">{String(value).padStart(2, '0')}</span>
            <span className="tournament-countdown__suffix">{unitLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
