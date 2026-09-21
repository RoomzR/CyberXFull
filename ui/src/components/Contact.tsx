import type { ClubInfo } from '../types/api';
import { ContactSectionHeader } from './ui/ContactSectionHeader';
import { ContactShowcase } from './ui/ContactShowcase';

interface ContactProps {
  club: ClubInfo;
}

export function Contact({ club }: ContactProps) {
  return (
    <section id="contact" className="contact-section anchor-section">
      <div className="contact-section__ambient" aria-hidden />
      <div className="contact-section__grid-bg" aria-hidden />

      <div className="contact-section__inner">
        <ContactSectionHeader />
        <ContactShowcase club={club} />
      </div>
    </section>
  );
}
