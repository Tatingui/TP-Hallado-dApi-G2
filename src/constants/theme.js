export const Colors = {
  primary: '#1A56DB',
  primaryDark: '#1342B0',
  primaryLight: '#E1EFFE',
  accent: '#0EA5E9',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  textOnPrimary: '#FFFFFF',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  success: '#16A34A',
  border: '#E2E8F0',
  inputBackground: '#F1F5F9',
  disabled: '#94A3B8',
  badgeBackground: '#FFF8E7',
  badgeBorder: '#F3D89D',
  badgeText: '#B47100',
  badgeStar: '#E5A93C',

  // Grises (escala Tailwind para consistencia)
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Semánticos extra
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  successDark: '#15803D',
  errorDark: '#B91C1C',

  // Claim / encuentro (violeta)
  purple50: '#F5F3FF',
  purple100: '#F3E8FF',
  purple200: '#DDD6FE',
  purple700: '#6D28D9',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FontSize = {
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

// Alias para compatibilidad con componentes que usan COLORS (ej: punto 3)
export const COLORS = Colors;
