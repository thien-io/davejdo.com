export type BauhausIconKind =
  | "redTriangle"
  | "blueSquare"
  | "yellowCircle"
  | "greenSquare"
  | "purpleCircle";

const COLORS = {
  red: "#f24e1e",
  blue: "#1E40AF",
  yellow: "#ffcd1a",
  green: "#22C55E",
  purple: "#a259ff",
};

export function BauhausIcon({
  kind,
  size = 10,
  className,
}: {
  kind: BauhausIconKind;
  size?: number;
  className?: string;
}) {
  const color = colorFor(kind);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      shapeRendering="geometricPrecision"
      className={className}
      aria-hidden="true"
      style={{ flexShrink: 0, display: "block" }}
    >
      {shapeFor(kind, color)}
    </svg>
  );
}

function colorFor(kind: BauhausIconKind): string {
  switch (kind) {
    case "redTriangle":
      return COLORS.red;
    case "blueSquare":
      return COLORS.blue;
    case "yellowCircle":
      return COLORS.yellow;
    case "greenSquare":
      return COLORS.green;
    case "purpleCircle":
      return COLORS.purple;
  }
}

function shapeFor(kind: BauhausIconKind, c: string): React.ReactNode {
  switch (kind) {
    case "redTriangle":
      return <polygon points="50,10 90,90 10,90" fill={c} />;
    case "yellowCircle":
    case "purpleCircle":
      return <circle cx="50" cy="50" r="40" fill={c} />;
    case "blueSquare":
    case "greenSquare":
      return <rect x="10" y="10" width="80" height="80" fill={c} />;
  }
}
