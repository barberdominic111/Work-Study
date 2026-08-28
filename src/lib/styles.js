// Inline style objects modeled directly on the TimeStudy app's design system.
// Colors are pulled through CSS variables (see theme.css) so the same shapes
// work across the Light / Warm / Dark themes.

export const card = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-card)',
  borderRadius: 16,
  padding: 20,
  marginBottom: 12,
};

export const sectionLabel = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '0.1em',
  color: 'var(--text-placeholder)',
  textTransform: 'uppercase',
  marginBottom: 8,
};

export const btnPrimary = {
  background: 'var(--brand)',
  color: '#FFFFFF',
  border: 'none',
  borderRadius: 12,
  padding: '16px',
  fontSize: 16,
  fontWeight: 800,
  letterSpacing: '0.03em',
  width: '100%',
};

export const btnDestructive = {
  background: 'var(--status-red-bg)',
  color: 'var(--status-red)',
  border: '1.5px solid var(--status-red-border)',
  borderRadius: 8,
  padding: '6px 14px',
  fontWeight: 700,
  fontSize: 13,
};

export const btnSecondary = {
  background: 'var(--bg-card)',
  border: '1.5px solid var(--border-card)',
  borderRadius: 10,
  color: 'var(--text-muted)',
  fontWeight: 700,
  padding: '10px 14px',
  fontSize: 14,
};

export const btnActive = {
  background: 'var(--brand-light-bg)',
  border: '1.5px solid var(--brand)',
  color: 'var(--brand)',
  fontWeight: 700,
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 14,
};

export const statGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 10,
  marginTop: 14,
};

export const statCell = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-card)',
  borderRadius: 10,
  padding: '14px 10px',
  textAlign: 'center',
};

export const statValue = {
  fontFamily: 'var(--font-mono)',
  fontSize: 16,
  fontWeight: 700,
  color: 'var(--text-heading)',
};

export const statLabel = {
  fontSize: 11,
  color: 'var(--text-placeholder)',
  marginTop: 4,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

export const inputStyle = {
  border: '1.5px solid var(--input-border)',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 15,
  background: 'var(--input-bg)',
  color: 'var(--text-primary)',
  width: '100%',
  boxSizing: 'border-box',
};

export const fieldLabel = {
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: 4,
  display: 'block',
};

export const hintText = {
  fontSize: 12,
  color: 'var(--text-placeholder)',
  fontFamily: 'var(--font-mono)',
};

export const emptyState = {
  textAlign: 'center',
  color: 'var(--text-placeholder)',
  fontSize: 15,
  padding: '60px 24px',
  background: 'var(--bg-card)',
  border: '1px solid var(--border-card)',
  borderRadius: 16,
};

export const overlay = {
  position: 'fixed',
  inset: 0,
  background: 'var(--overlay)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
  zIndex: 100,
};

export const modalCard = {
  background: 'var(--bg-card)',
  borderRadius: 16,
  padding: 22,
  width: '100%',
  maxWidth: 420,
  maxHeight: '85vh',
  overflowY: 'auto',
};

export const bigDisplay = {
  fontFamily: 'var(--font-mono)',
  fontSize: 'clamp(2rem, 9vw, 3.4rem)',
  fontWeight: 700,
  lineHeight: 1,
  letterSpacing: '-1px',
  color: 'var(--text-heading)',
};

export function statusColor(pct) {
  if (pct >= 85) return 'var(--status-green)';
  if (pct >= 60) return 'var(--status-amber)';
  return 'var(--status-red)';
}
