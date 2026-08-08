export type SettingsCategory = 'general' | 'contact' | 'branding';

export interface StoreSetting {
  id: number;
  category: SettingsCategory;
  key: string;
  value: string | null;
  updated_by: number | null;
  updated_at: string;
}

export interface SettingsAuditLog {
  id: number;
  category: SettingsCategory;
  key: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: number | null;
  changed_at: string;
}

export interface GeneralSettingsMap {
  store_name?: string;
  store_type?: string;
  store_tagline?: string;
  currency_code?: string;
  [key: string]: string | undefined;
}

export interface ContactSettingsMap {
  admin_email?: string;
  support_email?: string;
  phone?: string;
  gstin?: string;
  store_address?: string;
  [key: string]: string | undefined;
}

export interface BrandingSettingsMap {
  logo_url?: string;
  favicon_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  primary_background?: string;
  secondary_background?: string;
  surface_color?: string;
  hover_surface?: string;
  page_background?: string;
  elevated_background?: string;
  major_text_color?: string;
  minor_text_color?: string;
  soft_text_color?: string;
  muted_text_color?: string;
  accent_color?: string;
  accent_hover_color?: string;
  accent_text_color?: string;
  success_color?: string;
  info_color?: string;
  warning_color?: string;
  danger_color?: string;
  purple_status_color?: string;
  orange_status_color?: string;
  neutral_status_color?: string;
  [key: string]: string | undefined;
}

export interface UpdateSettingsRequest {
  category: SettingsCategory;
  values: Record<string, string | null>;
}
