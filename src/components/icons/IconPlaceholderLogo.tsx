export function IconPlaceholderLogo({
  className,
  ...props
}: React.ComponentProps<"svg">) {
  return (
    <svg
      fill="currentColor"
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="6"
        fill="white"
        fontFamily="Arial"
      >
        LOGO
      </text>
    </svg>
  );
}
