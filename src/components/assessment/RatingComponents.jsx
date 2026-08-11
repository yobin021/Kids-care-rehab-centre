"use client";

import React from "react";

/**
 * COMPONENT A — 0 to 3 Rating Row
 * Used in IEP domains
 */
export function RatingRow0to3({
  label,
  value,
  onChange,
  remarks,
  onRemarksChange,
  showRemarks = true
}) {
  const options = [
    { num: 0, label: "0 - Not Dev", color: "bg-red-600 text-white border-red-600" },
    { num: 1, label: "1 - Emerging", color: "bg-amber-600 text-white border-amber-600" },
    { num: 2, label: "2 - With Supp", color: "bg-yellow-500 text-white border-yellow-500" },
    { num: 3, label: "3 - Indep", color: "bg-emerald-600 text-white border-emerald-600" }
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-[8px] border border-[#D3D1C7]/60 hover:border-[#185FA5]/40 transition-colors">
      <span className="text-xs font-bold text-[#2C2C2A] flex-1">{label}</span>

      <div className="flex items-center gap-1.5 flex-wrap">
        <div className="inline-flex items-center gap-1 bg-[#F8F8F6] p-1 rounded-[8px] border border-[#D3D1C7]">
          {options.map((opt) => {
            const isSelected = value === opt.num;
            return (
              <button
                key={opt.num}
                type="button"
                onClick={() => onChange(opt.num)}
                className={`px-2.5 py-1 rounded-[6px] text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? opt.color
                    : "bg-white text-[#5F5E5A] hover:bg-slate-100 border border-[#D3D1C7]/40"
                }`}
              >
                {opt.num}
              </button>
            );
          })}
        </div>

        {showRemarks && (
          <input
            type="text"
            value={remarks || ""}
            onChange={(e) => onRemarksChange && onRemarksChange(e.target.value)}
            placeholder="Remarks"
            className="h-8 px-2 border border-[#D3D1C7] rounded-[6px] text-[11px] font-medium text-[#2C2C2A] w-28 outline-none focus:border-[#185FA5]"
          />
        )}
      </div>
    </div>
  );
}

/**
 * COMPONENT B — 1 to 5 Rating Row
 */
export function RatingRow1to5({ itemNum, label, value, onChange }) {
  const options = [
    { num: 1, label: "1 (Rarely)", color: "bg-emerald-600 text-white border-emerald-600" },
    { num: 2, label: "2 (Sometimes)", color: "bg-teal-600 text-white border-teal-600" },
    { num: 3, label: "3 (Frequently)", color: "bg-amber-500 text-white border-amber-500" },
    { num: 4, label: "4 (Mostly)", color: "bg-orange-600 text-white border-orange-600" },
    { num: 5, label: "5 (Always)", color: "bg-red-600 text-white border-red-600" }
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 bg-white rounded-[8px] border border-[#D3D1C7]/60 hover:border-[#185FA5]/40 transition-colors">
      <div className="flex items-start gap-2 flex-1">
        <span className="h-5 w-5 rounded-full bg-[#185FA5]/10 text-[#185FA5] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
          {itemNum}
        </span>
        <span className="text-xs font-bold text-[#2C2C2A] leading-tight">{label}</span>
      </div>

      <div className="inline-flex items-center gap-1 bg-[#F8F8F6] p-1 rounded-[8px] border border-[#D3D1C7] shrink-0">
        {options.map((opt) => {
          const isSelected = value === opt.num;
          return (
            <button
              key={opt.num}
              type="button"
              onClick={() => onChange(opt.num)}
              className={`px-3 py-1.5 rounded-[6px] text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? `${opt.color} shadow-xs scale-105`
                  : "bg-white text-[#5F5E5A] hover:bg-slate-100 border border-[#D3D1C7]/40"
              }`}
            >
              {opt.num}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * COMPONENT C — Yes / No Toggle Row
 */
export function YesNoToggleRow({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-[8px] border border-[#D3D1C7]/60 hover:border-[#185FA5]/40 transition-colors">
      <span className="text-xs font-bold text-[#2C2C2A]">{label}</span>
      <div className="inline-flex items-center gap-1 bg-[#F8F8F6] p-1 rounded-[20px] border border-[#D3D1C7]">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            value === true ? "bg-[#185FA5] text-white shadow-xs" : "bg-transparent text-[#5F5E5A]"
          }`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
            value === false ? "bg-[#993C1D] text-white shadow-xs" : "bg-transparent text-[#5F5E5A]"
          }`}
        >
          No
        </button>
      </div>
    </div>
  );
}

/**
 * COMPONENT D — Chip Select (Multi or Single)
 */
export function ChipSelect({
  label,
  options = [],
  value = [],
  onChange,
  multi = true
}) {
  const isSelected = (opt) => {
    if (multi) return Array.isArray(value) && value.includes(opt);
    return value === opt;
  };

  const handleToggle = (opt) => {
    if (multi) {
      const arr = Array.isArray(value) ? [...value] : [];
      if (arr.includes(opt)) {
        onChange(arr.filter((item) => item !== opt));
      } else {
        onChange([...arr, opt]);
      }
    } else {
      onChange(opt);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold text-[#2C2C2A]">{label}</label>}
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const selected = isSelected(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleToggle(opt)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                selected
                  ? "bg-[#185FA5] text-white border border-[#185FA5] shadow-xs"
                  : "bg-white text-[#5F5E5A] border border-[#D3D1C7] hover:bg-slate-100"
              }`}
            >
              {selected ? `✓ ${opt}` : opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * COMPONENT E — Checkbox Grid
 * Uses 16px styled HTML checkboxes with labels, wrapped in flex/grid layout
 */
export function CheckboxGrid({
  label,
  options = [],
  value = [],
  onChange,
  cols = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
}) {
  const isChecked = (opt) => Array.isArray(value) && value.includes(opt);

  const handleToggle = (opt) => {
    const arr = Array.isArray(value) ? [...value] : [];
    if (arr.includes(opt)) {
      onChange(arr.filter((item) => item !== opt));
    } else {
      onChange([...arr, opt]);
    }
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-bold text-[#2C2C2A]">{label}</label>}
      <div className={`grid ${cols} gap-2.5 bg-[#F8F8F6] p-3 rounded-[8px] border border-[#D3D1C7]/60`}>
        {options.map((opt) => {
          const checked = isChecked(opt);
          return (
            <label
              key={opt}
              className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#2C2C2A] select-none hover:text-[#185FA5] transition-colors"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleToggle(opt)}
                className="h-4 w-4 rounded border-[#D3D1C7] text-[#185FA5] focus:ring-[#185FA5]"
              />
              <span>{opt}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
