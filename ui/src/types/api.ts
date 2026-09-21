export interface ClubInfo {
  name: string;
  tagline: string;
  about: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  instagramUrl: string;
  telegramUrl: string;
  supportedGames: string[];
}

export interface Tournament {
  id: number;
  title: string;
  description: string;
  game: string;
  status: string;
  startDate: string;
  endDate?: string;
  prizePool: number;
  registrationUrl: string;
  rulesUrl: string;
  isFeatured: boolean;
}

export interface Team {
  id: number;
  name: string;
  tag: string;
  rating: number;
  wins: number;
  losses: number;
  primaryGame: string;
  logoColor: string;
}

export interface ClubEvent {
  id: number;
  title: string;
  description: string;
  type: string;
  date: string;
  imageGradient: string;
}

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export interface HomePage {
  club: ClubInfo;
  featuredTournaments: Tournament[];
  recentEvents: ClubEvent[];
  topTeams: Team[];
  faq: FaqItem[];
}
