"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { X } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// ================= Card Components =================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-blue-50/60 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md",
        className
      )}
      {...props}
    />
  );
}

// ================= Badge Component =================
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "secondary" | "info";
}

export function Badge({ className, variant = "primary", ...props }: BadgeProps) {
  const styles = {
    primary: "bg-blue-50 text-blue-700 border-blue-100",
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
    secondary: "bg-slate-50 text-slate-700 border-slate-100",
    info: "bg-sky-50 text-sky-700 border-sky-100",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}

// ================= Progress Component =================
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
}

export function Progress({ className, value, max = 100, ...props }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div
      className={cn("h-2.5 w-full overflow-hidden rounded-full bg-slate-100", className)}
      {...props}
    >
      <div
        className="h-full rounded-full bg-blue-600 transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// ================= Tooltip Component =================
interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [active, setActive] = useState(false);
  const positionStyles = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
    >
      {children}
      {active && (
        <div
          className={cn(
            "absolute z-50 whitespace-nowrap rounded bg-slate-900 px-2 py-1.5 text-xs font-medium text-white shadow-md animate-in fade-in zoom-in-95 duration-100",
            positionStyles[position]
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// ================= Select Dropdown Component =================
interface SelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
}

export function Select({ value, onChange, options, placeholder = "Select option", className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClose = () => setOpen(false);
    window.addEventListener("click", handleClose);
    return () => window.removeEventListener("click", handleClose);
  }, []);

  return (
    <div
      className={cn("relative w-full", className)}
      onClick={(e) => {
        e.stopPropagation();
        setOpen(!open);
      }}
    >
      <div className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-sm cursor-pointer focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-slate-300">
        <span className={selected ? "text-slate-800" : "text-slate-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", open && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {open && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-100 bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1 duration-150">
          {options.length === 0 ? (
            <li className="px-3 py-2 text-slate-400 text-center">No options available</li>
          ) : (
            options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={cn(
                  "cursor-pointer select-none px-3 py-2 transition-colors hover:bg-blue-50 hover:text-blue-700",
                  opt.value === value ? "bg-blue-50/50 font-semibold text-blue-600" : "text-slate-700"
                )}
              >
                {opt.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

// ================= Custom Dialog Modal =================
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
}

export function Dialog({ isOpen, onClose, title, children, maxWidth = "lg" }: DialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      {/* Content Container */}
      <div
        className={cn(
          "relative z-10 w-full overflow-hidden rounded-3xl bg-white shadow-2xl transition-all border border-blue-50/50 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200",
          widthStyles[maxWidth]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4.5">
          {title ? (
            <h3 className="text-lg font-bold text-slate-800 leading-snug">{title}</h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-600 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
