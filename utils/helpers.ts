import Colors from '@/constants/colors';

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  if (!Number.isFinite(amount)) return formatCurrency(0, currency);
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch (e) {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function formatDate(date: string | number | Date): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getDaysBetween(start: string | Date, end: string | Date): number {
  const s = typeof start === 'string' ? new Date(start) : start;
  const e = typeof end === 'string' ? new Date(end) : end;
  if (!s || !e || Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return 0;
  const msPerDay = 1000 * 60 * 60 * 24;
  // normalize to UTC midnight to avoid DST/timezone issues
  const utcStart = Date.UTC(s.getFullYear(), s.getMonth(), s.getDate());
  const utcEnd = Date.UTC(e.getFullYear(), e.getMonth(), e.getDate());
  const diff = Math.floor((utcEnd - utcStart) / msPerDay) + 1;
  return diff > 0 ? diff : 0;
}

export function getTripStatus(startDate: string | Date, endDate: string | Date): 'planning' | 'active' | 'completed' {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  if (today < start) return "planning";
  if (today <= end) return "active";
  return "completed";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return Colors.primary;
    case 'planning':
      return Colors.warning;
    case 'completed':
      return Colors.success;
    default:
      return Colors.textLight;
  }
}

export function getBudgetPercentage(spent: number, budget: number): number {
  if (!Number.isFinite(spent) || !Number.isFinite(budget) || budget <= 0) return 0;
  return Math.round((spent / budget) * 100);
}

type TripLike = {
  startDate?: string;
  endDate?: string;
  itinerary?: Array<{ items?: Array<unknown> }>;
  notes?: Array<unknown>;
  expenses?: Array<{ amount?: number; category?: string }>;
};

export function getTripSummary(trip: TripLike) {
  const daysCount = getDaysBetween(trip.startDate ?? new Date(), trip.endDate ?? new Date());
  const placesVisited = (trip.itinerary || []).reduce((sum, day) => sum + (day.items?.length ?? 0), 0);
  const notesCount = (trip.notes || []).length;
  const totalExpenses = (trip.expenses || []).reduce((s, e) => s + (Number.isFinite(Number(e.amount)) ? Number(e.amount) : 0), 0);

  const categories = ['transport', 'accommodation', 'food', 'sightseeing', 'shopping', 'health', 'other'] as const;
  const expensesByCategory: Record<string, number> = {};
  categories.forEach(c => (expensesByCategory[c] = 0));
  (trip.expenses || []).forEach(e => {
    const cat = e.category || 'other';
    const amt = Number.isFinite(Number(e.amount)) ? Number(e.amount) : 0;
    expensesByCategory[cat] = (expensesByCategory[cat] || 0) + amt;
  });

  return {
    daysCount,
    placesVisited,
    notesCount,
    totalExpenses,
    expensesByCategory,
  };
}

export default {
  generateId,
  formatCurrency,
  formatDate,
  getDaysBetween,
  getTripStatus,
  getStatusColor,
  getBudgetPercentage,
  getTripSummary,
};
