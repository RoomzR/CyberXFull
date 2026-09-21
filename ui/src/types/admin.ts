export interface TournamentAdmin {
  id: number;
  titleRu: string;
  titleEn: string;
  descriptionRu: string;
  descriptionEn: string;
  game: string;
  status: string;
  startDate: string;
  endDate?: string;
  prizePool: number;
  registrationUrl: string;
  rulesUrl: string;
  isFeatured: boolean;
}

export interface TournamentFormData {
  titleRu: string;
  titleEn: string;
  descriptionRu: string;
  descriptionEn: string;
  game: string;
  status: string;
  startDate: string;
  endDate: string;
  prizePool: number;
  registrationUrl: string;
  rulesUrl: string;
  isFeatured: boolean;
}
