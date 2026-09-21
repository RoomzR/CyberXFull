import { AtSign, Send, type LucideIcon } from 'lucide-react';
import type { ClubInfo } from '../types/api';

export interface ClubSocialLink {
  key: 'instagram' | 'telegram';
  label: string;
  href: string;
  handle: string;
  icon: LucideIcon;
}

export function getSocialHandle(url: string, key: 'instagram' | 'telegram'): string {
  if (key === 'instagram') {
    const match = url.match(/instagram\.com\/([^/?#]+)/i);
    return match ? `@${match[1]}` : 'Instagram';
  }

  const match = url.match(/t\.me\/([^/?#]+)/i);
  return match ? `@${match[1]}` : 'Telegram';
}

export function getClubSocialLinks(
  club: ClubInfo,
  labels: { instagram: string; telegram: string },
): ClubSocialLink[] {
  return [
    {
      key: 'instagram',
      label: labels.instagram,
      href: club.instagramUrl,
      handle: getSocialHandle(club.instagramUrl, 'instagram'),
      icon: AtSign,
    },
    {
      key: 'telegram',
      label: labels.telegram,
      href: club.telegramUrl,
      handle: getSocialHandle(club.telegramUrl, 'telegram'),
      icon: Send,
    },
  ];
}
