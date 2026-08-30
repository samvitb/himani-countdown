const PIECES = Array.from({ length: 40 }, (_, i) => i);

export function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {PIECES.map((i) => {
        const left = (i * 37) % 100;
        const delay = (i % 10) * 0.35;
        const duration = 4 + (i % 5) * 0.9;
        const size = 6 + (i % 4) * 3;
        return (
          <span
            key={i}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              width: size,
              height: size,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              opacity: 0.5 + (i % 5) / 10,
            }}
          />
        );
      })}
    </div>
  );
}
