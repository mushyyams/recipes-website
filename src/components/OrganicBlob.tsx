type OrganicBlobProps = {
  className?: string;
  color?: string;
  variant?: "primary" | "secondary";
};

export function OrganicBlob({
  className = "",
  color,
  variant = "primary",
}: OrganicBlobProps) {
  const fill =
    color ??
    (variant === "primary"
      ? "var(--color-sage-light)"
      : "var(--color-clay-light)");

  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M320 180C340 120 300 60 240 45C180 30 120 55 75 95C30 135 15 200 35 260C55 320 115 365 185 375C255 385 300 240 320 180Z"
        fill={fill}
        opacity="0.35"
      />
      <path
        d="M280 220C295 170 260 130 210 120C160 110 110 140 85 180C60 220 70 275 105 310C140 345 200 355 245 330C290 305 265 270 280 220Z"
        fill={fill}
        opacity="0.2"
      />
    </svg>
  );
}
