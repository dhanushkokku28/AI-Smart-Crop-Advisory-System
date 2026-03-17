export const colors = {
  primary: '#2E7D32',
  secondary: '#66BB6A',
  background: '#F1F8E9',
  surface: '#FFFFFF',
  textPrimary: '#1B4332',
  textSecondary: '#52796F',
  accent: '#A5D6A7',
  warning: '#F9A825',
  danger: '#C62828',
  border: '#DCECCF',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
};

export const radii = {
  sm: 10,
  md: 16,
  lg: 22,
  pill: 999,
};

export const shadows = {
  card: {
    shadowColor: '#0B3D0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
};

export const typography = {
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  body: {
    fontSize: 15,
    color: colors.textPrimary,
  },
};

export const theme = {
  colors,
  spacing,
  radii,
  shadows,
  typography,
};
