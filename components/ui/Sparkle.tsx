export default function Sparkle({ size = 40 }: { size?: number }) {
  const r = size / 2;
  const arms = 8;
  const outer = r * 0.9;
  const inner = r * 0.28;
  const pts: string[] = [];

  for (let i = 0; i < arms * 2; i++) {
    const angle = (Math.PI / arms) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? outer : inner;
    pts.push(`${r + rad * Math.cos(angle)},${r + rad * Math.sin(angle)}`);
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      aria-hidden="true"
      className="sparkle"
    >
      <polygon
        points={pts.join(" ")}
        fill="#f21f1f"
        stroke="#f21f1f"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
