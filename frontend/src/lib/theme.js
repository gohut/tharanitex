export const BRANDING_STORAGE_KEY = "tharani-branding-settings";

export const DEFAULT_BRANDING_THEME = {
  primaryColor: "#0B3D2E",
  secondaryColor: "#0D4733",
  surfaceColor: "#145C3E",
  surfaceHoverColor: "#1E7D50",
  pageBackgroundColor: "#0C1A10",
  elevatedBackgroundColor: "#060E09",
  borderColor: "#145C3E",
  strongBorderColor: "#1E7D50",
  accentColor: "#D4AF37",
  accentHoverColor: "#E0C050",
  accentTextColor: "#0B3D2E",
  majorTextColor: "#FFFFFF",
  minorTextColor: "#4EC48A",
  softTextColor: "#72D4A4",
  mutedTextColor: "#2DAD6E",
  successColor: "#2DAD6E",
  infoColor: "#60A5FA",
  warningColor: "#FACC15",
  dangerColor: "#F87171",
  purpleColor: "#C084FC",
  orangeColor: "#FB923C",
  neutralColor: "#9CA3AF",
  logoUrl: "",
  faviconUrl: "",
  socialFacebook: "https://facebook.com/aeux",
  socialInstagram: "https://instagram.com/aeux",
  socialTwitter: "https://twitter.com/aeux",
};

const CSS_VARIABLES = {
  primaryColor: "--brand-primary",
  secondaryColor: "--brand-secondary",
  surfaceColor: "--brand-surface",
  surfaceHoverColor: "--brand-surface-hover",
  pageBackgroundColor: "--brand-page-bg",
  elevatedBackgroundColor: "--brand-elevated-bg",
  borderColor: "--brand-border",
  strongBorderColor: "--brand-border-strong",
  accentColor: "--brand-accent",
  accentHoverColor: "--brand-accent-hover",
  accentTextColor: "--brand-accent-text",
  majorTextColor: "--brand-text-major",
  minorTextColor: "--brand-text-minor",
  softTextColor: "--brand-text-soft",
  mutedTextColor: "--brand-text-muted",
  successColor: "--brand-success",
  infoColor: "--brand-info",
  warningColor: "--brand-warning",
  dangerColor: "--brand-danger",
  purpleColor: "--brand-purple",
  orangeColor: "--brand-orange",
  neutralColor: "--brand-neutral",
};

const hexToRgb = (hex) => {
  const normalized = hex.replace("#", "").trim();
  const full = normalized.length === 3
    ? normalized.split("").map((char) => `${char}${char}`).join("")
    : normalized;

  const value = Number.parseInt(full, 16);
  if (Number.isNaN(value)) return "255 255 255";

  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
};

export const applyBrandingTheme = (branding = DEFAULT_BRANDING_THEME) => {
  if (typeof document === "undefined") return;

  const theme = { ...DEFAULT_BRANDING_THEME, ...branding };

  Object.entries(CSS_VARIABLES).forEach(([key, variable]) => {
    document.documentElement.style.setProperty(variable, theme[key]);
    document.documentElement.style.setProperty(`${variable}-rgb`, hexToRgb(theme[key]));
  });
};

export const getSavedBrandingTheme = () => {
  if (typeof window === "undefined") return DEFAULT_BRANDING_THEME;

  try {
    const saved = JSON.parse(localStorage.getItem(BRANDING_STORAGE_KEY) || "null");
    return saved ? { ...DEFAULT_BRANDING_THEME, ...saved } : DEFAULT_BRANDING_THEME;
  } catch {
    return DEFAULT_BRANDING_THEME;
  }
};
