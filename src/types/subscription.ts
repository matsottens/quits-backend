export interface SubscriptionData {
  id: string;
  provider: string;
  price: number | null;
  frequency: 'monthly' | 'yearly' | string;
  renewal_date: string | null;
  term_months: number | null;
  is_price_increase: boolean;
  lastDetectedDate: string;
  title?: string;
  category?: string;
  last_payment_date?: string;
}

export interface PriceChange {
  oldPrice: number;
  newPrice: number;
  change: number;
  percentageChange: number;
  term_months: number | null;
  renewal_date: string | null;
  provider: string;
  firstDetected?: string;
  lastUpdated?: string;
}

export interface UpcomingRenewal {
  provider: string;
  renewal_date: string;
  daysUntilRenewal: number;
  price: number;
  frequency: string;
} 