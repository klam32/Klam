//TYPES.TS
export type View = 'landing' | 'chat' | 'payment' | 'admin' | 'profile' | 'calendar' | 'prediction' | 'contact' | 'terms' | 'faq' | 'guide' | 'details';

export interface User {
  id: number;
  username: string;
  email: string;
  token_balance: number;
  is_admin: boolean;
  full_name?: string;
  picture_url?: string;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string | null; 
  timestamp: Date;
  tokens_charged?: number;
  sources?: string[];
  answer?: string | null;
  chart?: string | null;
  compatibility?: number | null;
  chart_svg?: string | null;
  partner_chart_svg?: string | null;
  analysis?: string | null;
  conversation_id?: number;

  sections?: {
    agent: string;
    interpretation: string;
  }[];
}

export interface Conversation {
  id: number
  title: string
  messages?: any[]
  is_pinned?: boolean
  created_at?: string
}

export interface AstrologyRequest {

  conversation_id?: number | null; // 🔥 FIX

  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  country: string;
  field: string;
  context: string;
  compatibility?: number | null;
  chart_svg?: string | null;
  partner_chart_svg?: string | null;
}

export interface ChatResponse {

  answer: string;
  chart?: string;
  tokens_charged: number;
  user_token_balance: number;
  label?: string;
  conversation_id?: number;
  compatibility?: number | null;
  chart_svg?: string | null;
  partner_chart_svg?: string | null;
  mode?: "init" | "chat" | "love";
  chart_summary?: {
    sun: string;
    moon: string;
    ascendant: string;
    planets: Array<{ name: string, sign: string, house: number }>;
  };
    sections?: {
    agent: string;
    interpretation: string;
  }[];
}

export interface PaymentPackage {
  id: number;
  name: string;
  tokens: number;
  amount_vnd: number;
}

export interface PaymentInvoice {
  payment_id: number;
  amount_vnd: number;
  qr_url: string;
  note: string;
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed';
  tokens: number;
}
export interface SiteSettings {
  rate_per_1000: number;
  logo_url: string;
  background_url: string;
  site_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_author: string;
  favicon_url: string;
  no_answer_fallback: string;
}