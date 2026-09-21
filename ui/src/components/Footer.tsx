import { useTranslation } from 'react-i18next';
import type { ClubInfo } from '../types/api';
import { ClubSocialLinks } from './ui/ClubSocialLinks';

interface FooterProps {
  club: ClubInfo;
}

export function Footer({ club }: FooterProps) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__ambient" aria-hidden />
      <div className="site-footer__grid-bg" aria-hidden />

      <div className="site-footer__inner">
        <div className="site-footer__deck">
          <div className="site-footer__deck-glow" aria-hidden />
          <div className="site-footer__corners" aria-hidden>
            <span className="site-footer__corner site-footer__corner--tl" />
            <span className="site-footer__corner site-footer__corner--tr" />
            <span className="site-footer__corner site-footer__corner--bl" />
            <span className="site-footer__corner site-footer__corner--br" />
          </div>

          <div className="site-footer__deck-body">
            <div className="site-footer__brand">
              <a href="#home" className="site-logo site-logo--footer">
                <span className="site-logo__cyber">CYBER</span>
                <span className="site-logo__x">X</span>
              </a>
              <p className="site-footer__tagline">{t('footer.made')}</p>
            </div>

            <ClubSocialLinks club={club} variant="footer" />
          </div>

          <div className="site-footer__deck-meta">
            <nav className="site-footer__nav" aria-label="Footer">
              <a href="#faq" className="site-footer__nav-link">
                {t('footer.rules', { defaultValue: 'Rules' })}
              </a>
              <span className="site-footer__nav-sep" aria-hidden />
              <a href="#contact" className="site-footer__nav-link">
                {t('nav.contact')}
              </a>
            </nav>
            <p className="site-footer__copyright">
              © {year} {t('footer.rights')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
