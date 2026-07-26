"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// ================= Card Component =================
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function Card({ className, hoverable = true, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl glass-panel p-6 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] transition-all duration-300",
        hoverable && "hover:shadow-[0_12px_24px_-10px_rgba(15,23,42,0.06)] hover:border-slate-300/60 hover:-translate-y-[1px]",
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
    primary: "bg-blue-50/70 text-blue-600 border-blue-100/50",
    success: "bg-emerald-50/70 text-emerald-600 border-emerald-100/50",
    warning: "bg-amber-50/70 text-amber-600 border-amber-100/50",
    danger: "bg-rose-50/70 text-rose-600 border-rose-100/50",
    secondary: "bg-slate-100/70 text-slate-600 border-slate-200/50",
    info: "bg-sky-50/70 text-sky-600 border-sky-100/50",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
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
  color?: string;
}

export function Progress({ className, value, max = 100, color = "bg-blue-600", ...props }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-slate-100/80 border border-slate-100/20", className)}
      {...props}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500 ease-out", color)}
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
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2.5",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2.5",
    left: "right-full top-1/2 -translate-y-1/2 mr-2.5",
    right: "left-full top-1/2 -translate-y-1/2 ml-2.5",
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
            "absolute z-50 whitespace-nowrap rounded-xl bg-slate-900/95 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold tracking-wide text-white shadow-lg border border-slate-800 animate-scale-in",
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
      <div className="flex h-10 w-full items-center justify-between rounded-xl border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-[0_2px_8px_-3px_rgba(15,23,42,0.02)] cursor-pointer focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 hover:border-slate-350 hover:bg-slate-50/30 transition-all duration-200">
        <span className={selected ? "text-slate-800 font-bold" : "text-slate-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={cn("h-4 w-4 text-slate-450 transition-transform duration-200", open && "rotate-180")} />
      </div>
      {open && (
        <ul className="absolute z-50 mt-1.5 max-h-60 w-full overflow-auto rounded-xl border border-slate-100 bg-white/95 backdrop-blur-md py-1.5 text-xs shadow-xl ring-1 ring-black/5 animate-scale-in">
          {options.length === 0 ? (
            <li className="px-3.5 py-2.5 text-slate-400 text-center font-medium">No options available</li>
          ) : (
            options.map((opt) => (
              <li
                key={opt.value}
                onClick={() => onChange(opt.value)}
                className={cn(
                  "cursor-pointer select-none px-3.5 py-2 font-semibold transition-colors mx-1 rounded-lg",
                  opt.value === value
                    ? "bg-blue-600 text-white font-bold"
                    : "text-slate-650 hover:bg-slate-50 hover:text-slate-900"
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
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      {/* Content Container */}
      <div
        className={cn(
          "relative z-10 w-full overflow-hidden rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/50 shadow-2xl flex flex-col max-h-[90vh] animate-scale-in",
          widthStyles[maxWidth]
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/40 px-6 py-4.5">
          {title ? (
            <h3 className="text-base font-extrabold text-slate-800 leading-snug">{title}</h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 text-slate-650 text-xs font-semibold leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
