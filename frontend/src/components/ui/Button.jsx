import React from 'react';

export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-150 inline-flex items-center justify-center gap-2 cursor-pointer";
  const styles = {
    primary: "bg-[#2563EB] text-white hover:bg-blue-700 shadow-sm",
    secondary: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger: "bg-[#DC2626] text-white hover:bg-red-700 shadow-sm",
  };

  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}