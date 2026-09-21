import type { ClubInfo } from '../types/api';
import { AboutSectionHeader } from './ui/AboutSectionHeader';
import { AboutShowcase } from './ui/AboutShowcase';

interface AboutProps {
  club: ClubInfo;
}

export function About({ club }: AboutProps) {
  return (
    <section id="about" className="about-section anchor-section">
      <div className="about-section__ambient" aria-hidden />
      <div className="about-section__grid-bg" aria-hidden />

      <div className="about-section__inner">
        <AboutSectionHeader />
        <AboutShowcase club={club} />
      </div>
    </section>
  );
}
