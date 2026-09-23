export interface Banner {
  id: string;
  imageUrl: string;
  headline: string;
  subtext: string | null;
  ctaLabel: string | null;
  ctaLink: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}
