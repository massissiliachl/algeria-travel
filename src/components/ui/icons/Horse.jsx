/** Icône cheval — style trait Lucide (Tabler MIT) */
export default function Horse({ size = 24, strokeWidth = 1.75, className = '', ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M17 19v-6c0-1.25.75-2 2-2s2 .75 2 2v6" />
      <path d="M3 19v-6c0-1.25.75-2 2-2s2 .75 2 2v6" />
      <path d="M7 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 0 7 0v-14.5" />
      <path d="M4 15v-3h3" />
      <path d="M14 15v-3h3" />
      <path d="M6 19v-2" />
      <path d="M18 19v-2" />
      <path d="M10 5v-2" />
      <path d="M14 5v-2" />
      <path d="M12 5h-2" />
    </svg>
  );
}
