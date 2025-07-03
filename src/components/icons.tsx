import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2L12 22" />
      <path d="M2 12L22 12" />
      <path d="M12 2a10 10 0 0 0-9.95 9.5" />
      <path d="M2.05 12.5a10 10 0 0 0 9.95 9.5" />
      <path d="M12 22a10 10 0 0 0 9.95-9.5" />
      <path d="M21.95 11.5a10 10 0 0 0-9.95-9.5" />
    </svg>
  );
}
