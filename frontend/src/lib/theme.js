export const BRANDING_STORAGE_KEY = "tharani-branding-settings";

export const DEFAULT_BRANDING_THEME = {
  primaryColor: "#5A1F2F",
  secondaryColor: "#471825",
  surfaceColor: "#FFFFFF",
  surfaceHoverColor: "#F4ECE1",
  pageBackgroundColor: "#FAF6F0",
  elevatedBackgroundColor: "#FFFFFF",
  borderColor: "#E8DCC8",
  strongBorderColor: "#D4AF37",
  accentColor: "#D4AF37",
  accentHoverColor: "#C49B24",
  accentTextColor: "#FFFFFF",
  majorTextColor: "#2F2B27",
  minorTextColor: "#7C7267",
  softTextColor: "#5C544B",
  mutedTextColor: "#8A8175",
  successColor: "#1E7E34",
  infoColor: "#1A73E8",
  warningColor: "#B06000",
  dangerColor: "#C5221F",
  purpleColor: "#8430CE",
  orangeColor: "#C05621",
  neutralColor: "#5F6368",
  logoUrl: "",
  faviconUrl: "",
  socialFacebook: "https://facebook.com/tharanitex",
  socialInstagram: "https://instagram.com/tharanitex",
  socialTwitter: "https://twitter.com/tharanitex",
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
  if (Number.isNaN(value)) return "47 43 39";

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
  return DEFAULT_BRANDING_THEME;
};
