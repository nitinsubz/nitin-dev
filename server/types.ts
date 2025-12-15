export interface TimelineItem {
  id?: string;
  dateValue: string; // ISO date str for sorting (e.g., "2025-11-01")
  title: string;
  content: string;
  tag: string;
  color: string;
}

export interface CareerItem {
  id?: string;
  role: string;
  company: string;
  period: string;
  description: string;
  stack: string[];
  order?: number;
}

export interface Shitpost {
  id?: string;
  content: string;
  likes: string;
  date: string;
  subtext?: string;
  order?: number;
}

