
export type TimeEntry = {
  id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  hourlyRate: number;
  currency: string;
  breakTime: number;
}

export type UserProfile = {
  id: string;
  name: string | null;
  email: string;
}

export type Currency = {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Currency[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
];

export type TimeStatistics = {
  totalHours: number;
  totalEarnings: number;
  averageHourlyRate: number;
  currency: string;
  entriesCount: number;
  periodStart: string;
  periodEnd: string;
}

export type UserPreferences = {
  id: string;
  userId: string;
  defaultHourlyRate: number;
  defaultCurrency: string;
}

export type TimesheetReport = {
  startDate: string;
  endDate: string;
  entries: TimeEntry[];
  totalPay: number;
  currency: string;
}
