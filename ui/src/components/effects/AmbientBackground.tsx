export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute rounded-full blur-[120px]"
        style={{
          width: '600px',
          height: '600px',
          top: '-10%',
          left: '-5%',
          background: 'rgba(255, 26, 26, 0.05)',
        }}
      />
      <div
        className="absolute rounded-full blur-[120px]"
        style={{
          width: '500px',
          height: '500px',
          bottom: '5%',
          right: '-8%',
          background: 'rgba(255, 255, 255, 0.03)',
        }}
      />
      <div
        className="absolute rounded-full blur-[120px]"
        style={{
          width: '400px',
          height: '400px',
          top: '40%',
          left: '60%',
          background: 'rgba(255, 26, 26, 0.04)',
        }}
      />
    </div>
  );
}
