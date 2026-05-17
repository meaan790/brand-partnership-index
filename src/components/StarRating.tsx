"use client";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  anchor5?: string;
  anchor1?: string;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
};

export function StarRating({
  value,
  onChange,
  anchor5,
  anchor1,
  readonly = false,
  size = "md",
}: StarRatingProps) {
  const sizeClass = sizes[size];

  return (
    <div className="flex flex-col items-center gap-1">
      {anchor5 && (
        <div className="flex items-center gap-1.5 text-xs text-score-high">
          <span className="material-symbols-outlined text-sm" data-weight="fill">thumb_up</span>
          <span className="font-medium">{anchor5}</span>
        </div>
      )}
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            className={`${sizeClass} transition-colors ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            } ${star <= value ? "text-accent" : "text-outline-variant"}`}
          >
            <span
              className={`material-symbols-outlined ${sizeClass} ${
                star <= value ? "star-filled" : ""
              }`}
            >
              star
            </span>
          </button>
        ))}
      </div>
      {anchor1 && (
        <div className="flex items-center gap-1.5 text-xs text-score-low">
          <span className="material-symbols-outlined text-sm" data-weight="fill">thumb_down</span>
          <span className="font-medium">{anchor1}</span>
        </div>
      )}
    </div>
  );
}
