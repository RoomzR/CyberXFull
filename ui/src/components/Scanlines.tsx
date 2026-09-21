export function Scanlines() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.03]"
      style={{
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,0,51,0.15) 2px, rgba(255,0,51,0.15) 4px)',
      }}
      aria-hidden
    />
  );
}
