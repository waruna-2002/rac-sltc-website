"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Official Rotaract SLTC Navigation Brand Logo (Mobile-Responsive)
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
          src="/images/rotaract-sltc-clean-logo.png"
          alt="Rotaract Club of Sri Lanka Technology Campus"
          width={286}
          height={103}
          priority
          className="h-9 xs:h-10 sm:h-12 md:h-13 lg:h-15 w-auto max-w-[155px] xs:max-w-[195px] sm:max-w-[280px] md:max-w-[340px] object-contain transition-all"
        />
      </motion.div>
    </Link>
  );
}
