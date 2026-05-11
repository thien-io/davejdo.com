export function HelloThienLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 200"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <line
        x1="80" y1="24" x2="80" y2="182"
        stroke="currentColor"
        strokeWidth="19"
        strokeLinecap="round"
      />
      <line
        x1="14" y1="92" x2="146" y2="54"
        stroke="currentColor"
        strokeWidth="19"
        strokeLinecap="round"
      />
    </svg>
  );
}
