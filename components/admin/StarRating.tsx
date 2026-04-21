"use client";

import { Star } from "lucide-react";

export function StarRating({
  value,
  onChange,
  size = 16,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={
            n <= value
              ? "text-[#d4b97c]"
              : "text-neutral-700 hover:text-neutral-500"
          }
        >
          <Star
            size={size}
            fill={n <= value ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  );
}
