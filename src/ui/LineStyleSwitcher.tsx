import { useAppStore } from '../state/store';
import { LINE_STYLES, type LineStyle } from '../scene/lineCurves';
import { color, font } from '../styles/tokens';

const baseBtn = {
  padding: '5px 10px',
  borderRadius: 999,
  background: color.buttonBg,
  border: `1px solid ${color.buttonBorder}`,
  color: color.textSecondary,
  fontFamily: font.uiSans,
  fontSize: 11,
  letterSpacing: '0.05em',
  whiteSpace: 'nowrap' as const,
  cursor: 'pointer' as const,
};

const activeBtn = {
  ...baseBtn,
  color: color.goldText,
  background: color.goldActive,
  borderColor: color.goldActive,
};

export function LineStyleSwitcher() {
  const lineStyle = useAppStore((s) => s.lineStyle);
  const setLineStyle = useAppStore((s) => s.setLineStyle);

  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        top: 96,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        zIndex: 6,
        background: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(6px)',
        padding: '10px 10px 10px',
        borderRadius: 12,
        border: `1px solid ${color.buttonBorder}`,
      }}
    >
      <div
        style={{
          fontFamily: font.uiSerif,
          fontSize: 11,
          color: color.textMuted,
          letterSpacing: '0.15em',
          marginBottom: 4,
          textAlign: 'center',
        }}
      >
        线 形 式
      </div>
      {LINE_STYLES.map((s) => (
        <button
          key={s.id}
          onClick={() => setLineStyle(s.id as LineStyle)}
          title={s.brief}
          style={s.id === lineStyle ? activeBtn : baseBtn}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
