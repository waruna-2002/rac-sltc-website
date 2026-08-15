"use client";

import React from "react";
import { motion } from "framer-motion";

export default function Button({ 
  children, 
  variant = "primary", 
  className = "", 
  onClick, 
  type = "button",
  ...props 
}) {
  const baseStyles = "px-6 py-2.5 rounded-xl font-semibold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer";
  
  const variants = {
    primary: "bg-[#e6007e] hover:bg-[#c4006c] text-white shadow-lg shadow-[#e6007e]/25",
    secondary: "bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80",
    outline: "bg-transparent border border-[#e6007e] text-[#e6007e] hover:bg-[#e6007e]/10",
  };

  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}