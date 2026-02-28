
import * as React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
    aria-label="Pharmlogics Logo"
  >
    <g>
      <path
        d="M50,5 C74.85,5 95,25.15 95,50 C95,74.85 74.85,95 50,95 C32.36,95 17.5,84.45 10,70.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M50,5 C25.15,5 5,25.15 5,50 C5,61.35 9.8,71.4 17.1,78.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M50,30 C60,40 60,60 50,70 C40,60 40,40 50,30 Z"
        fill="currentColor"
      />
      <line
        x1="50"
        y1="30"
        x2="50"
        y2="70"
        stroke="#F8F8FF"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </g>
  </svg>
);
