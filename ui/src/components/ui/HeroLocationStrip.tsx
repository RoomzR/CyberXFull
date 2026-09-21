import { MapPin } from 'lucide-react';

interface HeroLocationStripProps {
  city: string;
  country: string;
}

export function HeroLocationStrip({ city, country }: HeroLocationStripProps) {
  return (
    <div className="hero-location">
      <div className="hero-location__pill">
        <span className="hero-location__live">
          <span className="hero-location__ping-wrap">
            <span className="hero-location__ping" />
            <span className="hero-location__dot" />
          </span>
          LIVE
        </span>
        <span className="hero-location__sep" />
        <MapPin size={12} strokeWidth={1.5} className="text-white/30" />
        <span className="mono-label hero-location__city">
          {city}, {country}
        </span>
      </div>
      <div className="hero-location__track">
        <div className="hero-location__beam" />
      </div>
    </div>
  );
}
