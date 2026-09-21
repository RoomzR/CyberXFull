import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getClubSocialLinks } from '../../lib/clubSocial';
import type { ClubInfo } from '../../types/api';

interface ClubSocialLinksProps {
  club: ClubInfo;
  variant: 'footer' | 'contact';
}

export function ClubSocialLinks({ club, variant }: ClubSocialLinksProps) {
  const { t } = useTranslation();

  const links = getClubSocialLinks(club, {
    instagram: t('social.instagram'),
    telegram: t('social.telegram'),
  });

  if (variant === 'footer') {
    return (
      <div className="site-footer__social">
        {links.map(({ key, label, href, handle, icon: Icon }) => (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="site-footer__social-item"
          >
            <span className="site-footer__social-item-icon">
              <Icon size={14} strokeWidth={1.5} />
            </span>
            <span className="site-footer__social-item-text">
              <span className="site-footer__social-item-label">{label}</span>
              <span className="site-footer__social-item-handle">{handle}</span>
            </span>
            <ArrowUpRight size={13} strokeWidth={1.5} className="site-footer__social-item-arrow" />
          </a>
        ))}
      </div>
    );
  }

  return (
    <div className="contact-card__social">
      {links.map(({ key, href, handle, icon: Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-card__social-link"
        >
          <Icon size={13} strokeWidth={1.5} />
          <span>{handle}</span>
          <ArrowUpRight size={12} strokeWidth={1.5} />
        </a>
      ))}
    </div>
  );
}
