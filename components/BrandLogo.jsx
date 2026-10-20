"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

/**
 * Official Rotaract Gear Wheel Vector Icon
 */
export function RotaractWheelIcon({ className = "w-8 h-8", ...props }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="rotaractPink" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff4d94" />
          <stop offset="45%" stopColor="#e6007e" />
          <stop offset="100%" stopColor="#b80065" />
        </linearGradient>
        <radialGradient id="hubGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 24 Outer Cog Teeth */}
      <g fill="url(#rotaractPink)">
        {[...Array(24)].map((_, i) => (
          <rect
            key={i}
            x="47"
            y="2"
            width="6"
            height="8"
            rx="1.5"
            transform={`rotate(${i * 15} 50 50)`}
          />
        ))}

        {/* Outer Rim Ring */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M50 8C26.804 8 8 26.804 8 50C8 73.196 26.804 92 50 92C73.196 92 92 73.196 92 50C92 26.804 73.196 8 50 8ZM50 18C32.327 18 18 32.327 18 50C18 67.673 32.327 82 50 82C67.673 82 82 67.673 82 50C82 32.327 67.673 18 50 18Z"
        />

        {/* 6 Rotary / Rotaract Spokes */}
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <rect
            key={angle}
            x="47.5"
            y="18"
            width="5"
            height="32"
            transform={`rotate(${angle} 50 50)`}
          />
        ))}

        {/* Central Hub Disc with Keyway Notch */}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M50 33C40.611 33 33 40.611 33 50C33 59.389 40.611 67 50 67C59.389 67 67 59.389 67 50C67 40.611 59.389 33 50 33ZM50 43C46.134 43 43 46.134 43 50C43 53.866 46.134 57 50 57C53.866 57 57 53.866 57 50C57 48.8 56.7 47.6 56.1 46.6L53.5 46.6L53.5 43.5C52.4 43.2 51.2 43 50 43Z"
        />
      </g>

      {/* Subtle Inner Highlight */}
      <circle cx="50" cy="50" r="14" fill="url(#hubGlow)" />
    </svg>
  );
}

/**
 * Official SLTC Campus Vector Crest Emblem
 */
export function SltcCampusIcon({ className = "w-7 h-7", ...props }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="sltcBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>
      </defs>

      {/* University Academic Crest Shield */}
      <path
        d="M50 6L88 18V48C88 72 71.5 90 50 96C28.5 90 12 72 12 48V18L50 6Z"
        fill="#0c1322"
        stroke="url(#sltcBlueGrad)"
        strokeWidth="3.5"
      />

      {/* Inner Shield Accent */}
      <path
        d="M50 14L80 23V46C80 66 67 81 50 87C33 81 20 66 20 46V23L50 14Z"
        fill="url(#sltcBlueGrad)"
        fillOpacity="0.12"
      />

      {/* Stylized Campus Torch & Innovation Nodes */}
      {/* Central Flame / Spire */}
      <path
        d="M50 24C53 30 58 35 58 41C58 47 54.4 51 50 51C45.6 51 42 47 42 41C42 35 47 30 50 24Z"
        fill="#38bdf8"
      />
      <circle cx="50" cy="38" r="3" fill="#ffffff" />

      {/* Innovation Rings / Book Leaves */}
      <path
        d="M32 58C38 64 45 66 50 66C55 66 62 64 68 58"
        stroke="#38bdf8"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M36 68C41 72 46 73 50 73C54 73 59 72 64 68"
        stroke="#38bdf8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />

      {/* SLTC Lettering */}
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="10"
        fontWeight="900"
        letterSpacing="0.8"
        fontFamily="sans-serif"
      >
        SLTC
      </text>
    </svg>
  );
}

import Image from "next/image";

/**
 * Complete Navigation Brand Lockup using the uploaded official Rotaract SLTC logo
 */
export default function BrandLogo() {
  return (
    <Link href="/" className="flex items-center group shrink-0 select-none py-0.5">
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative flex items-center"
      >
        <Image
          src="/images/rotaract-sltc-logo-transparent.png"
          alt="Rotaract Club of Sri Lanka Technology Campus"
          width={300}
          height={84}
          priority
          className="h-8 sm:h-10 md:h-11 w-auto max-w-[200px] xs:max-w-[240px] sm:max-w-[290px] md:max-w-[330px] object-contain drop-shadow-[0_0_16px_rgba(230,0,126,0.4)] transition-all"
        />
      </motion.div>
    </Link>
  );
}
